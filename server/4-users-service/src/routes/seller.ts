import { seller as createSeller } from '@users/controllers/seller/create';
import { id, random, username } from '@users/controllers/seller/get';
import { seed } from '@users/controllers/seller/seed';
import { seller as updateSeller } from '@users/controllers/seller/update';
import { updateStatus, withdraw, withdrawals } from '@users/controllers/seller/withdraw';
import { accountLink, connectAccount, connectWebhook, status as stripeStatus } from '@users/controllers/seller/stripe';
import express, { Router } from 'express';

const router: Router = express.Router();

const sellerRoutes = (): Router => {
  router.get('/id/:sellerId', id);
  router.get('/username/:username', username);
  router.get('/random/:size', random);
  router.get('/withdrawals', withdrawals);
  router.patch('/withdrawals/:withdrawalId/status', updateStatus);
  router.post('/stripe/connect/webhook', connectWebhook);
  router.post('/:sellerId/stripe/connect-account', connectAccount);
  router.post('/:sellerId/stripe/account-link', accountLink);
  router.get('/:sellerId/stripe/status', stripeStatus);
  router.post('/create', createSeller);
  router.put('/:sellerId', updateSeller);
  router.post('/:sellerId/withdraw', withdraw);
  router.put('/seed/:count', seed);

  return router;
};

export { sellerRoutes };
