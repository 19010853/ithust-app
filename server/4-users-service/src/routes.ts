import { normalizeGatewayTokenHeader, verifyGatewayRequest } from '@19010853/ithust-shared';
import { Application } from 'express';
import { buyerRoutes } from '@users/routes/buyer';
import { healthRoutes } from '@users/routes/health';
import { sellerRoutes } from '@users/routes/seller';
import { adminRoutes } from '@users/routes/admin';

const BUYER_BASE_PATH = '/api/v1/buyer';
const SELLER_BASE_PATH = '/api/v1/seller';
const ADMIN_BASE_PATH = '/api/v1/admin';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BUYER_BASE_PATH, normalizeGatewayTokenHeader, verifyGatewayRequest, buyerRoutes());
  app.use(SELLER_BASE_PATH, normalizeGatewayTokenHeader, verifyGatewayRequest, sellerRoutes());
  app.use(ADMIN_BASE_PATH, normalizeGatewayTokenHeader, verifyGatewayRequest, adminRoutes());
};

export { appRoutes };
