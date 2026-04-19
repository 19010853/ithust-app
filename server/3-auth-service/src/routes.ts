import { Application, NextFunction, Request, Response } from 'express';
import { verifyGatewayRequest } from '@19010853/ithust-shared';
import { authRoutes } from '@auth/routes/auth';
import { currentUserRoutes } from '@auth/routes/current-user';
import { healthRoutes } from '@auth/routes/health';
import { searchRoutes } from '@auth/routes/search';
import { seedRoutes } from '@auth/routes/seed';

const BASE_PATH = '/api/v1/auth';
const normalizeGatewayHeader = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.headers.gatewayToken && req.headers.gatewaytoken) {
    req.headers.gatewayToken = req.headers.gatewaytoken;
  }
  next();
};

export function appRoutes(app: Application): void {
  app.use('', healthRoutes());
  app.use(BASE_PATH, searchRoutes());
  app.use(BASE_PATH, seedRoutes());
  app.use(BASE_PATH, authRoutes());
  app.use(BASE_PATH, normalizeGatewayHeader, verifyGatewayRequest, currentUserRoutes());
}
