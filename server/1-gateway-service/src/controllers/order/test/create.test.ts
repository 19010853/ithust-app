import { AxiosResponse } from 'axios';
import { Create } from '@gateway/controllers/order/create';
import { orderService } from '@gateway/services/api/order.service';
import { Request, Response } from 'express';
import { createHmac } from 'crypto';

jest.mock('@gateway/services/api/order.service');
jest.mock('@gateway/config', () => ({
  config: {
    SEPAY_WEBHOOK_SECRET: 'test-sepay-secret'
  }
}));

const response = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  }) as unknown as Response;

const signBody = (timestamp: string, rawBody: string): string =>
  `sha256=${createHmac('sha256', 'test-sepay-secret').update(`${timestamp}.${rawBody}`).digest('hex')}`;

describe('Gateway order create controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should explain that browser GET requests cannot receive SePay webhooks', async () => {
    const res = response();

    await Create.prototype.sepayWebhookInfo({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'SePay webhook accepts HTTP POST requests only.' });
  });

  it('should proxy public SePay POST payloads to the order service', async () => {
    const res = response();
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const rawBody = '{ "transferAmount": 75000, "content": "SEVQR PAYORDER65f1f1f1f1f1f1f1f1f1f1f1" }';
    const body = {
      transferAmount: 75000,
      content: 'SEVQR PAYORDER65f1f1f1f1f1f1f1f1f1f1f1'
    };
    jest.spyOn(orderService, 'sepayWebhook').mockResolvedValue({ data: { success: true } } as AxiosResponse);
    const req = {
      body,
      rawBody: Buffer.from(rawBody),
      headers: {
        'x-sepay-signature': signBody(timestamp, rawBody),
        'x-sepay-timestamp': timestamp
      }
    } as unknown as Request & { rawBody: Buffer };

    await Create.prototype.sepayWebhook(req, res);

    expect(orderService.sepayWebhook).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('should reject webhook payloads without HMAC headers', async () => {
    const res = response();
    const req = {
      body: { transferAmount: 75000 },
      rawBody: Buffer.from('{"transferAmount":75000}'),
      headers: {}
    } as unknown as Request & { rawBody: Buffer };

    await Create.prototype.sepayWebhook(req, res);

    expect(orderService.sepayWebhook).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid SePay webhook signature.' });
  });

  it('should reject webhook payloads with invalid signatures', async () => {
    const res = response();
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const req = {
      body: { transferAmount: 75000 },
      rawBody: Buffer.from('{"transferAmount":75000}'),
      headers: {
        'x-sepay-signature': 'sha256=invalid',
        'x-sepay-timestamp': timestamp
      }
    } as unknown as Request & { rawBody: Buffer };

    await Create.prototype.sepayWebhook(req, res);

    expect(orderService.sepayWebhook).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid SePay webhook signature.' });
  });

  it('should reject expired webhook payloads', async () => {
    const res = response();
    const timestamp = `${Math.floor(Date.now() / 1000) - 301}`;
    const rawBody = '{"transferAmount":75000}';
    const req = {
      body: { transferAmount: 75000 },
      rawBody: Buffer.from(rawBody),
      headers: {
        'x-sepay-signature': signBody(timestamp, rawBody),
        'x-sepay-timestamp': timestamp
      }
    } as unknown as Request & { rawBody: Buffer };

    await Create.prototype.sepayWebhook(req, res);

    expect(orderService.sepayWebhook).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'SePay webhook request expired.' });
  });
});
