import { AxiosResponse } from 'axios';
import { Create } from '@gateway/controllers/order/create';
import { orderService } from '@gateway/services/api/order.service';
import { Request, Response } from 'express';

jest.mock('@gateway/services/api/order.service');
jest.mock('@gateway/services/restriction.service', () => ({
  assertGigCanReceiveNewOrders: jest.fn(),
  assertSellerCanOpenMarketplaceActivity: jest.fn()
}));

const response = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  }) as unknown as Response;

describe('Gateway order create controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('stripeWebhook', () => {
    it('should proxy Stripe webhook payload to order service and return success', async () => {
      const res = response();
      const body = { id: 'evt_test_123', type: 'payment_intent.succeeded' };
      const stripeSignature = 'stripe-sig-header';

      jest.spyOn(orderService, 'stripeWebhook').mockResolvedValue({ data: { success: true } } as AxiosResponse);

      const req = {
        body,
        rawBody: Buffer.from(JSON.stringify(body)),
        headers: { 'stripe-signature': stripeSignature }
      } as unknown as Request & { rawBody: Buffer };

      await Create.prototype.stripeWebhook(req, res);

      expect(orderService.stripeWebhook).toHaveBeenCalledWith(body, stripeSignature, expect.any(Buffer));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should pass empty string when stripe-signature header is missing', async () => {
      const res = response();
      const body = { id: 'evt_test_456' };

      jest.spyOn(orderService, 'stripeWebhook').mockResolvedValue({ data: { success: true } } as AxiosResponse);

      const req = {
        body,
        rawBody: Buffer.from(JSON.stringify(body)),
        headers: {}
      } as unknown as Request & { rawBody: Buffer };

      await Create.prototype.stripeWebhook(req, res);

      expect(orderService.stripeWebhook).toHaveBeenCalledWith(body, '', expect.any(Buffer));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
