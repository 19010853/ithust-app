import { BadRequestError } from '@19010853/ithust-shared';
import { OrderModel } from '@order/models/order.schema';
import { RefundRequestModel } from '@order/models/refund-request.schema';
import { publishDirectMessage } from '@order/queues/order.producer';
import { createRefundRequest } from '@order/services/refund.service';

jest.mock('@19010853/ithust-shared');
jest.mock('@order/config', () => ({ config: { CLIENT_URL: 'http://localhost:3000' } }));
jest.mock('@order/server', () => ({ orderChannel: {} }));
jest.mock('@order/queues/order.producer', () => ({ publishDirectMessage: jest.fn() }));
jest.mock('@order/models/order.schema', () => ({
  OrderModel: {
    findOne: jest.fn(),
    updateOne: jest.fn()
  }
}));
jest.mock('@order/models/refund-request.schema', () => ({
  RefundRequestModel: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

describe('Refund service', () => {
  const request = {
    reason: 'Seller missed the agreed delivery date.',
    bankInfo: {
      bankName: 'VietinBank',
      accountNumber: '102879023209',
      accountName: 'Buyer Name'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PLATFORM_OWNER_EMAIL = 'admin@example.com';
    (RefundRequestModel.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    (OrderModel.updateOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
  });

  it('should create a manual refund request for a held payment', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'mongo-order',
        orderId: 'JO123',
        buyerId: 'buyer-id',
        buyerUsername: 'buyer',
        buyerEmail: 'buyer@example.com',
        paymentAmountVnd: 75000,
        paymentStatus: 'HELD',
        approved: false
      })
    });
    (RefundRequestModel.create as jest.Mock).mockResolvedValue({ _id: 'refund-id', orderId: 'JO123', ...request });

    await expect(createRefundRequest('JO123', 'buyer', request)).resolves.toEqual(expect.objectContaining({ _id: 'refund-id' }));
    expect(OrderModel.updateOne).toHaveBeenCalledWith({ orderId: 'JO123' }, { $set: { paymentStatus: 'REFUND_REQUESTED' } });
    expect(publishDirectMessage).toHaveBeenCalledWith(
      expect.anything(),
      'ithust-order-notification',
      'order-email',
      expect.stringContaining('"template":"refundRequest"'),
      'Refund request email sent to notification service.'
    );
  });

  it('should reject refund requests for payments that are not held', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        orderId: 'JO123',
        buyerUsername: 'buyer',
        paymentAmountVnd: 75000,
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

  it('should reject refund requests from users other than the buyer', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        orderId: 'JO123',
        buyerUsername: 'buyer',
        paymentAmountVnd: 75000,
        paymentStatus: 'HELD',
        approved: false
      })
    });

    await expect(createRefundRequest('JO123', 'someone-else', request)).rejects.toBeDefined();
    expect(BadRequestError).toHaveBeenCalledWith('Only the buyer can request a refund for this order.', 'createRefundRequest()');
  });
});
