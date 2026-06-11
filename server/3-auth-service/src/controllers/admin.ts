import { BadRequestError } from '@19010853/ithust-shared';
import { updateAccountStatus } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const accountStatus = async (req: Request, res: Response): Promise<void> => {
  const status = `${req.body.status || ''}`;
  const reason = `${req.body.reason || ''}`.trim();
  if (!['ACTIVE', 'ACCOUNT_LOCKED'].includes(status)) {
    throw new BadRequestError('Invalid account status.', 'Auth admin accountStatus()');
  }
  if (status === 'ACCOUNT_LOCKED' && !reason) {
    throw new BadRequestError('Reason is required.', 'Auth admin accountStatus()');
  }

  const user = await updateAccountStatus(req.params.username, status as 'ACTIVE' | 'ACCOUNT_LOCKED', reason, req.body.lockedBy);
  if (!user) {
    throw new BadRequestError('User not found.', 'Auth admin accountStatus()');
  }
  res.status(StatusCodes.OK).json({ message: 'Account status updated.', user });
};

export { accountStatus };
