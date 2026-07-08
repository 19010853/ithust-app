import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { messageService } from '@gateway/services/api/message.service';
import { assertSellerAccountNotLocked } from '@gateway/services/restriction.service';

export class Create {
  public async message(req: Request, res: Response): Promise<void> {
    if (req.body.hasOffer && req.body.sellerId) {
      await assertSellerAccountNotLocked(req.body.sellerId);
    }
    const response: AxiosResponse = await messageService.addMessage(req.body);
    res
      .status(StatusCodes.OK)
      .json({ message: response.data.message, conversationId: response.data.conversationId, messageData: response.data.messageData });
  }
}
