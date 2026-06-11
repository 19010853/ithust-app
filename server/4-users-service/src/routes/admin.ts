import { accountStatus, restrictionPreview, sellerStatus, userDetail, users } from '@users/controllers/admin/get';
import express, { Router } from 'express';

const router: Router = express.Router();

const adminRoutes = (): Router => {
  router.get('/users', users);
  router.get('/users/:username/restriction-preview', restrictionPreview);
  router.patch('/users/:username/account-status', accountStatus);
  router.patch('/users/:username/seller-status', sellerStatus);
  router.get('/users/:username', userDetail);

  return router;
};

export { adminRoutes };
