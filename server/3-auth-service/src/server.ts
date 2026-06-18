import {
  attachCurrentUser,
  createServiceErrorHandler,
  normalizeGatewayTokenHeader,
  winstonLogger
} from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@auth/config';
import { Application, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { checkConnection, createIndex } from '@auth/elasticsearch';
import http from 'http';
import { appRoutes } from '@auth/routes';
import { createConnection } from '@auth/queues/connection';
import { Channel } from 'amqplib';
import { ensurePlatformAdmin } from '@auth/services/platform-admin.service';

const SERVER_PORT = 4002;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authenticationServer', 'debug');

export let authChannel: Channel;

export function start(app: Application): void {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  void ensurePlatformAdmin();
  startQueues();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
}

function securityMiddleware(app: Application): void {
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
  app.use(normalizeGatewayTokenHeader);
  app.use(attachCurrentUser(config.JWT_TOKEN!));
}

function standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routesMiddleware(app: Application): void {
  appRoutes(app);
}

async function startQueues(): Promise<void> {
  authChannel = (await createConnection()) as Channel;
}

function startElasticSearch(): void {
  checkConnection();
  createIndex('gigs');
}

function authErrorHandler(app: Application): void {
  app.use(createServiceErrorHandler('AuthService', log));
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Authentication server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Authentication server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'AuthService startServer() method error:', error);
  }
}
