import { AxiosResponse, isAxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { reviewService } from '@gateway/services/api/review.service';

export class Get {
  public async reviewsByGigId(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await reviewService.getReviewsByGigId(req.params.gigId);
      res.status(StatusCodes.OK).json({ message: response.data.message, reviews: response.data.reviews });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === StatusCodes.NOT_FOUND) {
        res.status(StatusCodes.OK).json({ message: 'Gig reviews by gig id', reviews: [] });
        return;
      }
      throw error;
    }
  }

  public async reviewsBySellerId(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await reviewService.getReviewsBySellerId(req.params.sellerId);
      res.status(StatusCodes.OK).json({ message: response.data.message, reviews: response.data.reviews });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === StatusCodes.NOT_FOUND) {
        res.status(StatusCodes.OK).json({ message: 'Gig reviews by seller id', reviews: [] });
        return;
      }
      throw error;
    }
  }
}
