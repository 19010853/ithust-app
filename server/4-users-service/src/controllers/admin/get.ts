import { BadRequestError } from '@19010853/ithust-shared';
import {
  getAdminUserDetail,
  getAdminUsers,
  getRestrictionPreview,
  IAdminUserQuery,
  updateAccountStatus,
  updateSellerStatus
} from '@users/services/admin.service';
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

const restrictionPreview = async (req: Request, res: Response): Promise<void> => {
  const preview = await getRestrictionPreview(req.params.username);
  res.status(StatusCodes.OK).json({ message: 'Restriction preview', preview });
};

const accountStatus = async (req: Request, res: Response): Promise<void> => {
  const result = await updateAccountStatus(req.params.username, req.body);
  res.status(StatusCodes.OK).json({ message: 'Account status updated', adminUser: result });
};

const sellerStatus = async (req: Request, res: Response): Promise<void> => {
  const seller = await updateSellerStatus(req.params.username, req.body);
  res.status(StatusCodes.OK).json({ message: 'Seller status updated', seller });
};

export { users, userDetail, restrictionPreview, accountStatus, sellerStatus };
