import { Create } from '@gateway/controllers/order/create';
import { Dispute } from '@gateway/controllers/order/dispute';
import { Get } from '@gateway/controllers/order/get';
import { Update } from '@gateway/controllers/order/update';
import express, { Router } from 'express';

class OrderRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/order/notification/:userTo', Get.prototype.notifications);
    this.router.get('/order/disputes', Dispute.prototype.list);
    this.router.get('/order/dispute/:disputeId/messages', Dispute.prototype.messages);
    this.router.get('/order/:orderId', Get.prototype.orderId);
    this.router.get('/order/seller/:sellerId', Get.prototype.sellerOrders);
    this.router.get('/order/buyer/:buyerId', Get.prototype.buyerOrders);
    this.router.post('/order', Create.prototype.order);
    this.router.post('/order/:orderId/refund', Create.prototype.refund);
    this.router.post('/order/:orderId/dispute', Dispute.prototype.create);
    this.router.post('/order/dispute/:disputeId/messages', Dispute.prototype.createMessage);

    this.router.put('/order/cancel/:orderId', Update.prototype.cancel);
    this.router.put('/order/extension/:orderId', Update.prototype.requestExtension);
    this.router.put('/order/deliver-order/:orderId', Update.prototype.deliverOrder);
    this.router.put('/order/approve-order/:orderId', Update.prototype.approveOrder);
    this.router.put('/order/gig/:type/:orderId', Update.prototype.deliveryDate);
    this.router.put('/order/dispute/:disputeId/decision', Dispute.prototype.decide);
    this.router.put('/order/notification/mark-as-read', Update.prototype.markNotificationAsRead);

    return this.router;
  }
}

export const orderRoutes: OrderRoutes = new OrderRoutes();
