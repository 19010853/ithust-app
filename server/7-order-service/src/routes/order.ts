import { notifications } from '@order/controllers/notification/get';
import { order } from '@order/controllers/order/create';
import { sepayCallback } from '@order/controllers/order/callback';
import { refund } from '@order/controllers/order/refund';
import { buyerOrders, orderId, sellerOrders } from '@order/controllers/order/get';
import { buyerApproveOrder, cancel, deliverOrder, deliveryDate, requestExtension } from '@order/controllers/order/update';
import { markSingleNotificationAsRead } from '@order/controllers/notification/update';
import express, { Router } from 'express';

const router: Router = express.Router();

const orderRoutes = (): Router => {
  router.get('/notification/:userTo', notifications);
  router.get('/:orderId', orderId);
  router.get('/seller/:sellerId', sellerOrders);
  router.get('/buyer/:buyerId', buyerOrders);
  router.post('/', order);
  router.post('/sepay/webhook', sepayCallback);
  router.post('/refund/:orderId', refund);

  router.put('/cancel/:orderId', cancel);
  router.put('/extension/:orderId', requestExtension);
  router.put('/deliver-order/:orderId', deliverOrder);
  router.put('/approve-order/:orderId', buyerApproveOrder);
  router.put('/gig/:type/:orderId', deliveryDate);
  router.put('/notification/mark-as-read', markSingleNotificationAsRead);

  return router;
};

export { orderRoutes };
