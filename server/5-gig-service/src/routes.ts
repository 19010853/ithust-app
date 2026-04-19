import { verifyGatewayRequest } from '@19010853/ithust-shared';
import { Application, NextFunction, Request, Response } from 'express';
import { gigRoutes } from '@gig/routes/gig';
import { healthRoutes } from '@gig/routes/health';

const BASE_PATH = '/api/v1/gig';
const normalizeGatewayHeader = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.headers.gatewayToken && req.headers.gatewaytoken) {
    req.headers.gatewayToken = req.headers.gatewaytoken;
  }
  next();
};

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, normalizeGatewayHeader, verifyGatewayRequest, gigRoutes());
};

export { appRoutes };
