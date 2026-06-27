import { Create } from '@gateway/controllers/order/create';
import { StripeConnect } from '@gateway/controllers/users/seller/stripe';
import express, { Router } from 'express';

class WebhookRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/stripe/order/webhook', Create.prototype.stripeWebhook);
    this.router.post('/stripe/connect/webhook', StripeConnect.prototype.webhook);
    return this.router;
  }
}

export const webhookRoutes: WebhookRoutes = new WebhookRoutes();
