import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { sellerService } from '@gateway/services/api/seller.service';

export class Withdraw {
  public async withdrawal(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await sellerService.withdraw(req.params.sellerId, req.body);
    res.status(StatusCodes.CREATED).json({ message: response.data.message, withdrawal: response.data.withdrawal });
  }

  public async withdrawals(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await sellerService.getWithdrawals(req.query);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      withdrawals: response.data.withdrawals,
      pagination: response.data.pagination,
      filters: response.data.filters
    });
  }

  public async updateStatus(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await sellerService.updateWithdrawalStatus(req.params.withdrawalId, {
      ...req.body,
      processedBy: {
        id: req.currentUser?.id,
        username: req.currentUser?.username,
        email: req.currentUser?.email
      }
    });
    res.status(StatusCodes.OK).json({ message: response.data.message, withdrawal: response.data.withdrawal });
  }
}
