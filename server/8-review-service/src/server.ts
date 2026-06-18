import http from 'http';

import 'express-async-errors';
import { attachCurrentUser, createServiceErrorHandler, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@review/config';
import { Application, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { checkConnection } from '@review/elasticsearch';
import { appRoutes } from '@review/routes';
import { createConnection } from '@review/queues/connection';
import { Channel } from 'amqplib';

const SERVER_PORT = 4007;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewServer', 'debug');
let reviewChannel: Channel;

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  reviewErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );
  app.use(attachCurrentUser(config.JWT_TOKEN!));
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueues = async (): Promise<void> => {
  reviewChannel = (await createConnection()) as Channel;
};

const startElasticSearch = (): void => {
  checkConnection();
};

const reviewErrorHandler = (app: Application): void => {
  app.use(createServiceErrorHandler('ReviewService', log));
};

const startServer = async (app: Application): Promise<void> => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Review server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Review server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'ReviewService startServer() method error:', error);
  }
};

export { start, reviewChannel };
