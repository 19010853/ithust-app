import http from 'http';
import 'express-async-errors';
import { attachCurrentUser, createServiceErrorHandler, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@users/config';
import { Application, json, Request, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { checkConnection } from '@users/elasticsearch';
import { appRoutes } from '@users/routes';
import { createConnection } from '@users/queues/connection';
import { Channel } from 'amqplib';
import {
  consumeBuyerDirectMessage,
  consumeReviewFanoutMessages,
  consumeSeedGigDirectMessages,
  consumeSellerDirectMessage
} from '@users/queues/user.consumer';

const SERVER_PORT = 4003;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersServer', 'debug');
let usersHttpServer: http.Server | undefined;

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  usersErrorHandler(app);
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
  app.use(
    json({
      limit: '200mb',
      verify: (req: RawBodyRequest, _res, buffer: Buffer) => {
        if (req.originalUrl.includes('/stripe/connect/webhook')) {
          req.rawBody = Buffer.from(buffer);
        }
      }
    })
  );
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueues = async (): Promise<void> => {
  const userChannel: Channel = (await createConnection()) as Channel;
  await consumeBuyerDirectMessage(userChannel);
  await consumeSellerDirectMessage(userChannel);
  await consumeReviewFanoutMessages(userChannel);
  await consumeSeedGigDirectMessages(userChannel);
};

const startElasticSearch = (): void => {
  checkConnection();
};

const usersErrorHandler = (app: Application): void => {
  app.use(createServiceErrorHandler('UsersService', log));
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    usersHttpServer = httpServer;
    httpServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        log.log('error', `UsersService port ${SERVER_PORT} is already in use. Stop the stale users-service process and restart.`, error);
        process.exit(1);
      }
      log.log('error', 'UsersService HTTP server error:', error);
      process.exit(1);
    });
    log.info(`Users server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Users server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'UsersService startServer() method error:', error);
  }
};

const shutdown = (signal: NodeJS.Signals): void => {
  if (!usersHttpServer) {
    process.exit(0);
  }
  usersHttpServer.close(() => {
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(0);
  });
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
process.once('SIGUSR2', shutdown);

export { start };
