import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createWithdrawal, getWithdrawals, IWithdrawalFilters, updateWithdrawalStatus } from '@users/services/withdrawal.service';
import { BadRequestError } from '@19010853/ithust-shared';
import { withdrawalSchema, withdrawalStatusSchema } from '@users/schemes/withdrawal';

const withdraw = async (req: Request, res: Response): Promise<void> => {
  const sellerId = req.params.sellerId;
  const { error, value } = await Promise.resolve(withdrawalSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'withdraw()');
  }

  const withdrawal = await createWithdrawal(sellerId, value.amount, value.bankAccount);

  res.status(StatusCodes.CREATED).json({ message: 'Withdrawal request created', withdrawal });
};

const withdrawals = async (req: Request, res: Response): Promise<void> => {
  const status = req.query.status ? `${req.query.status}` : undefined;
  if (status && !['PENDING', 'COMPLETED', 'REJECTED'].includes(status)) {
    throw new BadRequestError('Invalid withdrawal status filter', 'withdrawals()');
  }

  const result = await getWithdrawals(req.query as IWithdrawalFilters);
  res.status(StatusCodes.OK).json({ message: 'Seller withdrawals', ...result });
};

const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = await Promise.resolve(withdrawalStatusSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'updateStatus()');
  }

  const withdrawal = await updateWithdrawalStatus(req.params.withdrawalId, value);
  res.status(StatusCodes.OK).json({ message: 'Withdrawal status updated', withdrawal });
};

export { withdraw, withdrawals, updateStatus };
