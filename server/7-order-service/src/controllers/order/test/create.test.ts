/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as orderService from '@order/services/order.service';
import { OrderModel } from '@order/models/order.schema';
import { createStripePaymentIntent } from '@order/services/stripe.service';
import { authUserPayload, orderDocument, orderMockRequest, orderMockResponse } from '@order/controllers/order/test/mocks/order.mock';
import { order } from '@order/controllers/order/create';
import { orderSchema } from '@order/schemes/order';
import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';

type OrderDocumentWithPayment = IOrderDocument & {
  serviceFee: number;
  paymentAmountVnd: number;
  paymentCurrency: 'VND';
  paymentStatus: 'PENDING';
  status: 'PENDING_PAYMENT';
  _id?: string;
};

jest.mock('@order/services/order.service');
jest.mock('@order/services/stripe.service');
jest.mock('@order/models/order.schema', () => ({ OrderModel: { updateOne: jest.fn() } }));
jest.mock('@19010853/ithust-shared');
jest.mock('@order/schemes/order');
jest.mock('@elastic/elasticsearch');
jest.mock('@order/config', () => ({
  config: {
    CLIENT_URL: 'http://localhost:3000',
    STRIPE_SECRET_KEY: 'sk_test_123',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
    STRIPE_CURRENCY: 'usd',
    STRIPE_VND_PER_UNIT: 25000,
    REFUND_SETTLEMENT_MODE: 'ORIGINAL_SOURCE'
  }
}));

describe('Order Controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });



  describe('order method', () => {
    it('should throw an error for invalid schema data', async () => {
      const req: Request = orderMockRequest({}, orderDocument, authUserPayload) as unknown as Request;
      const res: Response = orderMockResponse();
      jest.spyOn(orderSchema, 'validate').mockImplementation((): any =>
        Promise.resolve({
          error: {
            name: 'ValidationError',
            isJoi: true,
            details: [{ message: 'This is an error message' }]
          }
        })
      );

      order(req, res).catch(() => {
        expect(BadRequestError).toHaveBeenCalledWith('This is an error message', 'Create order() method');
      });
    });

    it('should return correct json response', async () => {
      const req: Request = orderMockRequest({}, orderDocument, authUserPayload) as unknown as Request;
      const res: Response = orderMockResponse();
      let orderData = req.body as OrderDocumentWithPayment;
      orderData = {
        ...orderData,
        serviceFee: 77500,
        status: 'PENDING_PAYMENT',
        paymentAmountVnd: 577500,
        paymentCurrency: 'VND',
        paymentStatus: 'PENDING'
      };
      orderData._id = '65f1f1f1f1f1f1f1f1f1f1f1';
      jest.spyOn(orderSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(orderService, 'createOrder').mockResolvedValue(orderData);
      (createStripePaymentIntent as jest.Mock).mockResolvedValue({
        clientSecret: 'cs_test_123',
        providerPaymentId: 'pi_test_123',
        amount: '23.10',
        currency: 'usd',
        exchangeRate: 25000,
        exchangeRateSource: 'test',
        exchangeRateFetchedAt: '2026-06-25T00:00:00.000Z'
      });
      (OrderModel.updateOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

      await order(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order created. Confirm payment with Stripe Sandbox.',
        order: expect.objectContaining(orderData),
        payment: {
          provider: 'stripe',
          mode: 'sandbox',
          clientSecret: 'cs_test_123',
          providerPaymentId: 'pi_test_123',
          amount: 577500,
          currency: 'VND',
          providerAmount: '23.10',
          providerCurrency: 'usd',
          exchangeRate: 25000,
          exchangeRateSource: 'test',
          exchangeRateFetchedAt: '2026-06-25T00:00:00.000Z'
        }
      });
      expect(orderService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceFee: 77500,
          paymentAmountVnd: 577500,
          paymentCurrency: 'VND'
        })
      );
      expect(createStripePaymentIntent).toHaveBeenCalledWith('65f1f1f1f1f1f1f1f1f1f1f1', orderData.orderId, 577500, orderData.orderId);
      expect(OrderModel.updateOne).toHaveBeenCalledWith(
        { _id: '65f1f1f1f1f1f1f1f1f1f1f1', paymentStatus: 'PENDING' },
        { $set: { providerPaymentId: 'pi_test_123', providerAmount: '23.10', providerCurrency: 'usd' } }
      );
    });
  });
});
