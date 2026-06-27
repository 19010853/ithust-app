import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { orderService } from '@gateway/services/api/order.service';
import { assertGigCanReceiveNewOrders, assertSellerCanOpenMarketplaceActivity } from '@gateway/services/restriction.service';

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

export class Create {
  public async stripeWebhook(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await orderService.stripeWebhook(req.body, `${req.headers['stripe-signature'] || ''}`, (req as RawBodyRequest).rawBody);
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
