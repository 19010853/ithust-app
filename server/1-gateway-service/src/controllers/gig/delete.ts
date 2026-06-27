import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { gigService } from '@gateway/services/api/gig.service';
import { assertGigOwner } from '@gateway/services/restriction.service';

export class Delete {
  public async gig(req: Request, res: Response): Promise<void> {
    await assertGigOwner(req.params.gigId, req.currentUser);
    const response: AxiosResponse = await gigService.deleteGig(req.params.gigId, req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: response.data.message });
  }
}
