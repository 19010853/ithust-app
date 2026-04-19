import { verifyGatewayRequest } from '@19010853/ithust-shared';
import { Application, NextFunction, Request, Response } from 'express';
import { healthRoutes } from '@review/routes/health';
import { reviewRoutes } from '@review/routes/review';

const BASE_PATH = '/api/v1/review';
const normalizeGatewayHeader = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.headers.gatewayToken && req.headers.gatewaytoken) {
    req.headers.gatewayToken = req.headers.gatewaytoken;
  }
  next();
};

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, normalizeGatewayHeader, verifyGatewayRequest, reviewRoutes());
};

export { appRoutes };
