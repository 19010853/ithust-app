import { orderService } from '@gateway/services/api/order.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class Dispute {
  public async create(req: Request, res: Response): Promise<void> {
    const response = await orderService.createDispute(req.params.orderId, req.body);
    res.status(StatusCodes.CREATED).json(response.data);
  }
  public async list(req: Request, res: Response): Promise<void> {
    const response = await orderService.getDisputes(req.query);
    res.status(StatusCodes.OK).json(response.data);
  }
  public async messages(req: Request, res: Response): Promise<void> {
    const response = await orderService.getDisputeMessages(req.params.disputeId);
    res.status(StatusCodes.OK).json(response.data);
  }
  public async createMessage(req: Request, res: Response): Promise<void> {
    const response = await orderService.createDisputeMessage(req.params.disputeId, req.body);
    res.status(StatusCodes.CREATED).json(response.data);
  }
  public async decide(req: Request, res: Response): Promise<void> {
    const response = await orderService.decideDispute(req.params.disputeId, req.body);
    res.status(StatusCodes.OK).json(response.data);
  }
}
