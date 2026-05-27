/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as orderService from '@order/services/order.service';
import { authUserPayload, orderDocument, orderMockRequest, orderMockResponse } from '@order/controllers/order/test/mocks/order.mock';
import { order } from '@order/controllers/order/create';
import { orderSchema } from '@order/schemes/order';
import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';

jest.mock('@order/services/order.service');
jest.mock('@19010853/ithust-shared');
jest.mock('@order/schemes/order');
jest.mock('@elastic/elasticsearch');
jest.mock('@order/config', () => ({
  config: {
    PLATFORM_BANK_ACCOUNT: '0123456789',
    PLATFORM_BANK_ID: 'VietinBank',
    getSepayMode: jest.fn(() => 'test')
  }
}));
jest.mock('@order/services/exchange-rate.service', () => ({
  getUsdToVndRate: jest.fn(() => Promise.resolve(25000))
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
      let orderData: IOrderDocument = req.body;
      orderData = { ...orderData, serviceFee: 3.1, status: 'PENDING_PAYMENT' };
      (orderData as IOrderDocument & { _id: string })._id = '65f1f1f1f1f1f1f1f1f1f1f1';
      jest.spyOn(orderSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(orderService, 'createOrder').mockResolvedValue(orderData);

      await order(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order created. Please scan QR to pay.',
        order: expect.objectContaining(orderData),
        payment: {
          qrCodeUrl: expect.stringContaining('amount=577500&des=SEVQR%20PAYORDER'),
          amount: 577500,
          currency: 'VND',
          mode: 'test',
          content: expect.stringMatching(/^SEVQR PAYORDER[a-fA-F0-9]{24}$/)
        }
      });
      expect(orderService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceFee: 3.1,
          paymentAmountVnd: 577500,
          paymentCurrency: 'VND'
        })
      );
    });
  });
});
