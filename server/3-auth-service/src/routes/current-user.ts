import { read, resendEmail } from '@auth/controllers/current-user';
import { accountStatus } from '@auth/controllers/admin';
import { token } from '@auth/controllers/refresh-token';
import express, { Router } from 'express';

const router: Router = express.Router();

export function currentUserRoutes(): Router {
  router.get('/refresh-token/:username', token);
  router.get('/currentuser', read);
  router.post('/resend-email', resendEmail);
  router.patch('/admin/users/:username/account-status', accountStatus);

  return router;
}
