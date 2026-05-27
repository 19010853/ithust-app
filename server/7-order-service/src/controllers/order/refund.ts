import { BadRequestError } from '@19010853/ithust-shared';
import { refundRequestSchema } from '@order/schemes/order';
import { createRefundRequest } from '@order/services/refund.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const refund = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(refundRequestSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'refund()');
  }

  const refundRequest = await createRefundRequest(req.params.orderId, `${req.currentUser?.username || ''}`, req.body);
  res.status(StatusCodes.CREATED).json({ message: 'Refund request created.', refund: refundRequest });
};

export { refund };
