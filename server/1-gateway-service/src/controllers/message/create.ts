import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { messageService } from '@gateway/services/api/message.service';
import { assertOfferGigIsValidForSeller, assertSellerAccountNotLocked } from '@gateway/services/restriction.service';
import { BadRequestError } from '@19010853/ithust-shared';

export class Create {
  public async message(req: Request, res: Response): Promise<void> {
    if (req.body.hasOffer) {
      if (!req.body.sellerId || !req.body.gigId) {
        throw new BadRequestError('A custom offer requires a seller and a gig.', 'Create message() method');
      }
      await assertSellerAccountNotLocked(`${req.body.sellerId}`);
      await assertOfferGigIsValidForSeller(`${req.body.gigId}`, `${req.body.sellerId}`);
    }
    const response: AxiosResponse = await messageService.addMessage(req.body);
    res
      .status(StatusCodes.OK)
      .json({ message: response.data.message, conversationId: response.data.conversationId, messageData: response.data.messageData });
  }
}
