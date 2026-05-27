import { Create } from '@gateway/controllers/order/create';
import express, { Router } from 'express';

class WebhookRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/sepay/webhook', Create.prototype.sepayWebhookInfo);
    this.router.post('/sepay/webhook', Create.prototype.sepayWebhook);
    return this.router;
  }
}

export const webhookRoutes: WebhookRoutes = new WebhookRoutes();
