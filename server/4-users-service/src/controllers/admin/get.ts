import { BadRequestError } from '@19010853/ithust-shared';
import { getAdminUserDetail, getAdminUsers, IAdminUserQuery } from '@users/services/admin.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const users = async (req: Request, res: Response): Promise<void> => {
  const result = await getAdminUsers(req.query as IAdminUserQuery);
  res.status(StatusCodes.OK).json({ message: 'Admin users', ...result });
};

const userDetail = async (req: Request, res: Response): Promise<void> => {
  const adminUser = await getAdminUserDetail(req.params.username);
  if (!adminUser.buyer && !adminUser.seller) {
    throw new BadRequestError('User not found', 'admin userDetail()');
  }
  res.status(StatusCodes.OK).json({ message: 'Admin user detail', adminUser });
};

export { users, userDetail };
