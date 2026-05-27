/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { sepayCallback } from '@order/controllers/order/callback';
import { OrderModel } from '@order/models/order.schema';

jest.mock('@order/models/order.schema', () => ({
  OrderModel: {
    findById: jest.fn(),
    findOne: jest.fn()
  }
}));

describe('SePay callback controller', () => {
  const response = (): Response =>
    ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }) as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null)
    });
  });

  it('should update order when SePay test mode sends content field', async () => {
    const orderId = '65f1f1f1f1f1f1f1f1f1f1f1';
    const order = {
      _id: orderId,
      price: 100000,
      paymentAmountVnd: 100000,
      status: 'PENDING_PAYMENT',
      save: jest.fn()
    };
    (OrderModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(order)
    });

    const req = {
      headers: {},
      body: {
        id: 12345,
        content: `SEVQR PAYORDER${orderId} thanh toan don hang`,
        transferAmount: 100000
      }
    } as unknown as Request;
    const res = response();

    await sepayCallback(req, res);

    expect(OrderModel.findById).toHaveBeenCalledWith(orderId);
    expect(order.status).toBe('IN_PROGRESS');
    expect((order as any).paymentTransactionId).toBe('12345');
    expect(order.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('should ignore payloads without a PAYORDER object id', async () => {
    const req = {
      headers: {},
      body: {
        content: 'DH123456 thanh toan don hang',
        transferAmount: 100000
      }
    } as unknown as Request;
    const res = response();

    await sepayCallback(req, res);

    expect(OrderModel.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'No valid order ID found, ignoring' });
  });

  it('should acknowledge duplicate SePay transaction ids without updating another order', async () => {
    (OrderModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({ orderId: 'already-paid' })
    });
    const req = {
      headers: {},
      body: {
        id: 12345,
        content: 'PAYORDER65f1f1f1f1f1f1f1f1f1f1f1',
        transferAmount: 75000
      }
    } as unknown as Request;
    const res = response();

    await sepayCallback(req, res);

    expect(OrderModel.findById).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Transaction already processed' });
  });

  it('should not update order when the VND transfer amount does not match the stored payment amount', async () => {
    const orderId = '65f1f1f1f1f1f1f1f1f1f1f1';
    const order = {
      _id: orderId,
      price: 3,
      paymentAmountVnd: 75000,
      status: 'PENDING_PAYMENT',
      save: jest.fn()
    };
    (OrderModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(order)
    });

    const req = {
      headers: {},
      body: {
        content: `PAYORDER${orderId}`,
        transferAmount: 3
      }
    } as unknown as Request;
    const res = response();

    await sepayCallback(req, res);

    expect(order.status).toBe('PENDING_PAYMENT');
    expect(order.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Transfer amount does not match order amount' });
  });

  it('should not update legacy orders without a stored VND payment amount', async () => {
    const orderId = '65f1f1f1f1f1f1f1f1f1f1f1';
    const order = {
      _id: orderId,
      price: 3,
      status: 'PENDING_PAYMENT',
      save: jest.fn()
    };
    (OrderModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(order)
    });

    const req = {
      headers: {},
      body: {
        content: `PAYORDER${orderId}`,
        transferAmount: 75000
      }
    } as unknown as Request;
    const res = response();

    await sepayCallback(req, res);

    expect(order.status).toBe('PENDING_PAYMENT');
    expect(order.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Transfer amount does not match order amount' });
  });
});
