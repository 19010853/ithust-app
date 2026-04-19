import { verifyGatewayRequest } from '@19010853/ithust-shared';
import { Application, NextFunction, Request, Response } from 'express';
import { buyerRoutes } from '@users/routes/buyer';
import { healthRoutes } from '@users/routes/health';
import { sellerRoutes } from '@users/routes/seller';

const BUYER_BASE_PATH = '/api/v1/buyer';
const SELLER_BASE_PATH = '/api/v1/seller';
const normalizeGatewayHeader = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.headers.gatewayToken && req.headers.gatewaytoken) {
    req.headers.gatewayToken = req.headers.gatewaytoken;
  }
  next();
};

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BUYER_BASE_PATH, normalizeGatewayHeader, verifyGatewayRequest, buyerRoutes());
  app.use(SELLER_BASE_PATH, normalizeGatewayHeader, verifyGatewayRequest, sellerRoutes());
};

export { appRoutes };
