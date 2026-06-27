import { notifications } from '@order/controllers/notification/get';
import { createDispute, createMessage, decision, disputes, messages } from '@order/controllers/order/dispute';
import { order } from '@order/controllers/order/create';
import { refund } from '@order/controllers/order/refund';
import { stripeWebhook } from '@order/controllers/order/stripe';
import { buyerOrders, orderId, sellerOrders } from '@order/controllers/order/get';
import { buyerApproveOrder, cancel, deliverOrder, deliveryDate, requestExtension } from '@order/controllers/order/update';
import { markSingleNotificationAsRead } from '@order/controllers/notification/update';
import express, { Router } from 'express';

const router: Router = express.Router();

const orderRoutes = (): Router => {
  router.get('/notification/:userTo', notifications);
  router.get('/disputes', disputes);
  router.get('/dispute/:disputeId/messages', messages);
  router.get('/:orderId', orderId);
  router.get('/seller/:sellerId', sellerOrders);
  router.get('/buyer/:buyerId', buyerOrders);
  router.post('/', order);
  router.post('/stripe/webhook', stripeWebhook);
  router.post('/refund/:orderId', refund);
  router.post('/dispute/:orderId', createDispute);
  router.post('/dispute/:disputeId/messages', createMessage);

  router.put('/cancel/:orderId', cancel);
  router.put('/extension/:orderId', requestExtension);
  router.put('/deliver-order/:orderId', deliverOrder);
  router.put('/approve-order/:orderId', buyerApproveOrder);
  router.put('/gig/:type/:orderId', deliveryDate);
  router.put('/dispute/:disputeId/decision', decision);
  router.put('/notification/mark-as-read', markSingleNotificationAsRead);

  return router;
};

export { orderRoutes };
