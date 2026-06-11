import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '@gateway/config';
import { orderService } from '@gateway/services/api/order.service';
import { assertGigCanReceiveNewOrders, assertSellerCanOpenMarketplaceActivity } from '@gateway/services/restriction.service';

const SEPAY_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

type SePayWebhookRequest = Request & {
  rawBody?: Buffer;
};

const getHeaderValue = (header: string | string[] | undefined): string => {
  if (Array.isArray(header)) {
    return header[0] || '';
  }
  return header || '';
};

const constantTimeEquals = (expected: string, actual: string): boolean => {
  const expectedBuffer: Buffer = Buffer.from(expected);
  const actualBuffer: Buffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
};

const getSePayWebhookAuthError = (req: SePayWebhookRequest): string | undefined => {
  if (!config.SEPAY_WEBHOOK_SECRET) {
    return 'SePay webhook secret is not configured.';
  }

  const signature: string = getHeaderValue(req.headers['x-sepay-signature']);
  const timestampHeader: string = getHeaderValue(req.headers['x-sepay-timestamp']);
  const timestamp: number = Number(timestampHeader);

  if (!signature || !timestampHeader || !req.rawBody || !Number.isFinite(timestamp)) {
    return 'Invalid SePay webhook signature.';
  }

  const currentTimestampSeconds: number = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTimestampSeconds - timestamp) > SEPAY_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS) {
    return 'SePay webhook request expired.';
  }

  const hash: string = createHmac('sha256', config.SEPAY_WEBHOOK_SECRET)
    .update(`${timestampHeader}.`)
    .update(req.rawBody)
    .digest('hex');
  const expectedSignature = `sha256=${hash}`;

  if (!constantTimeEquals(expectedSignature, signature)) {
    return 'Invalid SePay webhook signature.';
  }

  return undefined;
};

export class Create {
  public async sepayWebhookInfo(_req: Request, res: Response): Promise<void> {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).json({ message: 'SePay webhook accepts HTTP POST requests only.' });
  }

  public async sepayWebhook(req: Request, res: Response): Promise<void> {
    const authError: string | undefined = getSePayWebhookAuthError(req as SePayWebhookRequest);
    if (authError) {
      res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: authError });
      return;
    }

    const response: AxiosResponse = await orderService.sepayWebhook(req.body);
    res.status(StatusCodes.OK).json({ success: response.data.success });
  }

  public async order(req: Request, res: Response): Promise<void> {
    await assertGigCanReceiveNewOrders(req.body.gigId);
    await assertSellerCanOpenMarketplaceActivity(req.body.sellerId);
    const response: AxiosResponse = await orderService.createOrder(req.body);
    res.status(StatusCodes.CREATED).json({ message: response.data.message, order: response.data.order, payment: response.data.payment });
  }

  public async refund(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await orderService.createRefundRequest(req.params.orderId, req.body);
    res.status(StatusCodes.CREATED).json({ message: response.data.message, refund: response.data.refund });
  }
}
