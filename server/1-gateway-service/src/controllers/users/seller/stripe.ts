import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sellerService } from '@gateway/services/api/seller.service';

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

export class StripeConnect {
  public async connectAccount(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await sellerService.createStripeConnectAccount(req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: response.data.message, seller: response.data.seller });
  }

  public async accountLink(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await sellerService.createStripeAccountLink(req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: response.data.message, url: response.data.url, seller: response.data.seller });
  }

  public async status(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await sellerService.getStripeAccountStatus(req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: response.data.message, seller: response.data.seller });
  }

  public async webhook(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await sellerService.stripeConnectWebhook(
      req.body,
      `${req.headers['stripe-signature'] || ''}`,
      (req as RawBodyRequest).rawBody
    );
    res.status(StatusCodes.OK).json({ success: response.data.success });
  }
}
