import { userDetail, users } from '@users/controllers/admin/get';
import express, { Router } from 'express';

const router: Router = express.Router();

const adminRoutes = (): Router => {
  router.get('/users', users);
  router.get('/users/:username', userDetail);

  return router;
};

export { adminRoutes };
