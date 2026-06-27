import { BadRequestError } from '@19010853/ithust-shared';
import { OrderModel } from '@order/models/order.schema';
import { RefundRequestModel } from '@order/models/refund-request.schema';
import { publishDirectMessage } from '@order/queues/order.producer';
import { createRefundRequest } from '@order/services/refund.service';
import { refundStripePaymentIntent } from '@order/services/stripe.service';

jest.mock('@19010853/ithust-shared');
jest.mock('@order/config', () => ({ config: { CLIENT_URL: 'http://localhost:3000', REFUND_SETTLEMENT_MODE: 'ORIGINAL_SOURCE' } }));
jest.mock('@order/server', () => ({ orderChannel: {} }));
jest.mock('@order/queues/order.producer', () => ({ publishDirectMessage: jest.fn() }));
jest.mock('@order/services/notification.service', () => ({ emitOrderUpdate: jest.fn() }));
jest.mock('@order/services/stripe.service', () => ({ refundStripePaymentIntent: jest.fn() }));
jest.mock('@order/models/order.schema', () => ({
  OrderModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  }
}));
jest.mock('@order/models/refund-request.schema', () => ({
  RefundRequestModel: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn()
  }
}));

describe('Refund service', () => {
  const request = { reason: 'Seller asked for more time and I cannot accept the extension.' };
  const heldStripeOrder = {
    _id: 'mongo-order',
    orderId: 'JO123',
    buyerId: 'buyer-id',
    buyerUsername: 'buyer',
    buyerEmail: 'buyer@example.com',
    sellerId: 'seller-id',
    sellerUsername: 'seller',
    sellerEmail: 'seller@example.com',
    paymentAmountVnd: 75000,
    paymentStatus: 'HELD',
    paymentProvider: 'stripe',
    providerPaymentId: 'pi_test_123',
    approved: false,
    delivered: false,
    cancelled: false,
    requestExtension: {
      originalDate: new Date(Date.now() + 3600000).toISOString(),
      newDate: new Date(Date.now() + 86400000).toISOString(),
      days: 1,
      reason: 'Need more time'
    },
    offer: { newDeliveryDate: new Date(Date.now() + 3600000).toISOString() }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PLATFORM_OWNER_EMAIL = 'admin@example.com';
    (RefundRequestModel.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    (RefundRequestModel.updateOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
    (RefundRequestModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'refund-id', orderId: 'JO123', status: 'COMPLETED' })
    });
    (refundStripePaymentIntent as jest.Mock).mockResolvedValue({ id: 're_test_123', status: 'succeeded' });
  });

  it('refunds to the original Stripe payment source when a buyer rejects a pending extension', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(heldStripeOrder) });
    (RefundRequestModel.create as jest.Mock).mockResolvedValue({ _id: 'refund-id', orderId: 'JO123', ...request, status: 'PROCESSING' });
    (OrderModel.findOneAndUpdate as jest.Mock)
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ ...heldStripeOrder, paymentStatus: 'REFUND_PROCESSING' }) })
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ ...heldStripeOrder, paymentStatus: 'REFUNDED', status: 'REFUNDED' }) });

    await expect(createRefundRequest('JO123', 'buyer', request)).resolves.toEqual(expect.objectContaining({ _id: 'refund-id' }));

    expect(refundStripePaymentIntent).toHaveBeenCalledWith('pi_test_123', 'refund-refund-id');
    expect(OrderModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'JO123', paymentStatus: { $in: ['HELD', 'REFUND_PROCESSING'] } }),
      { $set: { paymentStatus: 'REFUND_PROCESSING' } },
      { new: true }
    );
    expect(OrderModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'JO123', paymentStatus: { $in: ['HELD', 'REFUND_PROCESSING'] } }),
      expect.objectContaining({ $set: expect.objectContaining({ paymentStatus: 'REFUNDED', status: 'REFUNDED' }) }),
      { new: true }
    );
    expect(publishDirectMessage).toHaveBeenCalledWith(
      expect.anything(),
      'ithust-seller-update',
      'user-seller',
      expect.stringContaining('"type":"refund-order"'),
      'Refunded order details sent to users service.'
    );
  });

  it('rejects buyer refund requests that are not tied to a pending extension', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...heldStripeOrder, requestExtension: { originalDate: '', newDate: '', days: 0, reason: '' } })
    });

    await expect(createRefundRequest('JO123', 'buyer', request)).rejects.toBeDefined();
    expect(BadRequestError).toHaveBeenCalledWith(
      'Buyer refund is only available while rejecting a pending delivery extension request. Overdue orders are refunded automatically and quality refunds must go through admin dispute review.',
      'createRefundRequest()'
    );
  });

  it('rejects refund requests for payments that are not held', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...heldStripeOrder,
        paymentStatus: 'RELEASED',
        approved: true
      })
    });

    await expect(createRefundRequest('JO123', 'buyer', request)).rejects.toBeDefined();

    expect(BadRequestError).toHaveBeenCalledWith(
      'Refund is only available for paid orders still held by the platform.',
      'createRefundRequest()'
    );
  });

  it('rejects refund requests from users other than the buyer', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(heldStripeOrder)
    });

    await expect(createRefundRequest('JO123', 'someone-else', request)).rejects.toBeDefined();
    expect(BadRequestError).toHaveBeenCalledWith('Only the buyer can request a refund for this order.', 'createRefundRequest()');
  });
});
