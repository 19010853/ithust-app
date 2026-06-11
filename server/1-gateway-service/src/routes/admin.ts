import { AdminUsers } from '@gateway/controllers/admin/users';
import { authMiddleware } from '@gateway/services/auth-middleware';
import express, { Router } from 'express';

class AdminRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/admin/users', authMiddleware.checkAdmin, AdminUsers.prototype.users);
    this.router.get('/admin/users/:username/restriction-preview', authMiddleware.checkAdmin, AdminUsers.prototype.restrictionPreview);
    this.router.patch('/admin/users/:username/account-status', authMiddleware.checkAdmin, AdminUsers.prototype.updateAccountStatus);
    this.router.patch('/admin/users/:username/seller-status', authMiddleware.checkAdmin, AdminUsers.prototype.updateSellerStatus);
    this.router.get('/admin/users/:username', authMiddleware.checkAdmin, AdminUsers.prototype.userDetail);

    return this.router;
  }
}

export const adminRoutes: AdminRoutes = new AdminRoutes();
