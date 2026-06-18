import { createHealthHandler } from '@19010853/ithust-shared';
import express, { Router } from 'express';

const router: Router = express.Router();
const healthHandler = createHealthHandler('Notification service is healthy and OK.');

export function healthRoutes(): Router {
  router.get('/notification-health', healthHandler);
  return router;
}
