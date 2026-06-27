import { buyerService } from '@gateway/services/api/buyer.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class BuyerWithdraw {
  public async create(req: Request, res: Response): Promise<void> {
    const response = await buyerService.createRefundWithdrawal(req.params.buyerId, req.body);
    res.status(StatusCodes.CREATED).json(response.data);
  }
}
