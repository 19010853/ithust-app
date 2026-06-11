import { adminService } from '@gateway/services/api/admin.service';
import { authService } from '@gateway/services/api/auth.service';
import { gigService } from '@gateway/services/api/gig.service';
import { orderService } from '@gateway/services/api/order.service';
import { sellerService } from '@gateway/services/api/seller.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const finalOrderStatuses = new Set(['Completed', 'Cancelled']);

const countActiveOrders = (orders: any[] = []): number => orders.filter((order) => !finalOrderStatuses.has(`${order.status}`)).length;

const buildRestrictionPreview = async (username: string): Promise<any> => {
  const response: AxiosResponse = await adminService.getRestrictionPreview(username);
  const preview = response.data.preview;
  const buyerId = preview.identity?.buyerId;
  const sellerId = preview.identity?.sellerId;
  const [buyerOrders, sellerOrders, activeGigs, withdrawals] = await Promise.all([
    buyerId ? orderService.buyerOrders(`${buyerId}`).then((result) => result.data.orders || []).catch(() => []) : Promise.resolve([]),
    sellerId ? orderService.sellerOrders(`${sellerId}`).then((result) => result.data.orders || []).catch(() => []) : Promise.resolve([]),
    sellerId ? gigService.getSellerGigs(`${sellerId}`).then((result) => result.data.gigs || []).catch(() => []) : Promise.resolve([]),
    preview.identity?.username
      ? sellerService
          .getWithdrawals({ sellerUsername: preview.identity.username, status: 'PENDING' })
          .then((result) => result.data.withdrawals || [])
          .catch(() => [])
      : Promise.resolve([])
  ]);

  return {
    ...preview,
    activeBuyerOrders: countActiveOrders(buyerOrders),
    activeSellerOrders: countActiveOrders(sellerOrders),
    pendingWithdrawals: Math.max(Number(preview.pendingWithdrawals || 0), withdrawals.length),
    activeGigs: activeGigs.length
  };
};

export class AdminUsers {
  public async users(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await adminService.getUsers(req.query);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      users: response.data.users,
      pagination: response.data.pagination,
      filters: response.data.filters
    });
  }

  public async userDetail(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await adminService.getUserDetail(req.params.username);
    res.status(StatusCodes.OK).json({ message: response.data.message, adminUser: response.data.adminUser });
  }

  public async restrictionPreview(req: Request, res: Response): Promise<void> {
    const preview = await buildRestrictionPreview(req.params.username);
    res.status(StatusCodes.OK).json({ message: 'Restriction preview', preview });
  }

  public async updateAccountStatus(req: Request, res: Response): Promise<void> {
    const preview = await buildRestrictionPreview(req.params.username);
    const admin = { id: req.currentUser?.id, username: req.currentUser?.username, email: req.currentUser?.email };
    const body = {
      ...req.body,
      admin,
      lockedBy: admin.username || admin.email || `${admin.id || ''}`,
      preview
    };
    await authService.updateAccountStatus(req.params.username, body);
    const response: AxiosResponse = await adminService.updateAccountStatus(req.params.username, body);
    res.status(StatusCodes.OK).json({ message: response.data.message, adminUser: response.data.adminUser });
  }

  public async updateSellerStatus(req: Request, res: Response): Promise<void> {
    const preview = await buildRestrictionPreview(req.params.username);
    const body = {
      ...req.body,
      admin: { id: req.currentUser?.id, username: req.currentUser?.username, email: req.currentUser?.email },
      preview
    };
    const response: AxiosResponse = await adminService.updateSellerStatus(req.params.username, body);
    res.status(StatusCodes.OK).json({ message: response.data.message, seller: response.data.seller });
  }

}
