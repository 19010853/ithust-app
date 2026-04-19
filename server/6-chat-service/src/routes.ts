import { Application, NextFunction, Request, Response } from 'express';
import { healthRoutes } from '@chat/routes/health';
import { verifyGatewayRequest } from '@19010853/ithust-shared';
import { messageRoutes } from '@chat/routes/message';

const BASE_PATH = '/api/v1/message';
const normalizeGatewayHeader = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.headers.gatewayToken && req.headers.gatewaytoken) {
    req.headers.gatewayToken = req.headers.gatewaytoken;
  }
  next();
};

const appRoutes = (app: Application): void => {
  app.use(BASE_PATH, healthRoutes());
  app.use(BASE_PATH, normalizeGatewayHeader, verifyGatewayRequest, messageRoutes());
};

export { appRoutes };
