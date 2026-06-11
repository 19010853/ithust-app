import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { gigService } from '@gateway/services/api/gig.service';
import { assertGigOwner, assertGigSellerCanOpenMarketplaceActivity } from '@gateway/services/restriction.service';

export class Update {
  public async gig(req: Request, res: Response): Promise<void> {
    await assertGigSellerCanOpenMarketplaceActivity(req.params.gigId);
    const response: AxiosResponse = await gigService.updateGig(req.params.gigId, req.body);
    res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
  }

  public async gigActive(req: Request, res: Response): Promise<void> {
    await assertGigOwner(req.params.gigId, req.currentUser?.username);
    if (req.body.active === true) {
      await assertGigSellerCanOpenMarketplaceActivity(req.params.gigId);
    }
    const response: AxiosResponse = await gigService.updateActiveGigProp(req.params.gigId, req.body.active);
    res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
  }
}
