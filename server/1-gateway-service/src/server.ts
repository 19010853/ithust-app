import http from 'http';
import 'express-async-errors';
import { CustomError, IErrorResponse, winstonLogger } from '@19010853/ithust-shared';
import { Application, Request, Response, json, urlencoded, NextFunction } from 'express';
import { Logger } from 'winston';
import cookieSession from 'cookie-session';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import { config } from '@gateway/config';
import { elasticSearch } from '@gateway/elasticsearch';
import { appRoutes } from '@gateway/routes';
import { axiosAuthInstance } from '@gateway/services/api/auth.service';
import { axiosBuyerInstance } from '@gateway/services/api/buyer.service';
import { axiosSellerInstance } from '@gateway/services/api/seller.service';
import { axiosGigInstance } from '@gateway/services/api/gig.service';
import { axiosMessageInstance } from '@gateway/services/api/message.service';
import { axiosOrderInstance } from '@gateway/services/api/order.service';
import { axiosReviewInstance } from '@gateway/services/api/review.service';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { SocketIOAppHandler } from '@gateway/sockets/socket';
import { isAxiosError } from 'axios';

const SERVER_PORT = 4000;
const DEFAULT_ERROR_CODE = 500;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug');
export let socketIO: Server;
const allowedOrigins = config.CLIENT_URLS.length > 0 ? config.CLIENT_URLS : [`${config.CLIENT_URL}`].filter(Boolean);
log.info(`Gateway CORS allowedOrigins: ${JSON.stringify(allowedOrigins)}`);

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

export class GatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development',
        ...(config.NODE_ENV !== 'development' && {
          sameSite: 'none'
        })
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use((req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers['origin'] as string | undefined;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-gateway-token,gatewayToken,Accept');
        res.setHeader('Vary', 'Origin');
      }
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosBuyerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosSellerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosGigInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosMessageInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosOrderInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosReviewInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
      }
      next();
    });
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(
      json({
        limit: '200mb',
        verify: (req: RawBodyRequest, _res: Response, buffer: Buffer) => {
          if (req.originalUrl.includes('/stripe/order/webhook') || req.originalUrl.includes('/stripe/connect/webhook')) {
            req.rawBody = Buffer.from(buffer);
          }
        }
      })
    );
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private startElasticSearch(): void {
    elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.log('error', `${fullUrl} endpoint does not exist.`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.' });
      next();
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (error instanceof CustomError) {
        log.log('error', `GatewayService ${error.comingFrom}:`, error);
        res.status(error.statusCode).json(error.serializedErrors());
      }

      if (isAxiosError(error)) {
        const safeAxiosError = {
          comingFrom: error?.response?.data?.comingFrom ?? 'unknown',
          message: error?.response?.data?.message ?? error.message,
          statusCode: error?.response?.status ?? error?.response?.data?.statusCode ?? DEFAULT_ERROR_CODE,
          code: error.code,
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL
        };
        log.log('error', `GatewayService Axios Error - ${safeAxiosError.comingFrom}:`, safeAxiosError);
        res
          .status(error?.response?.data?.statusCode ?? error?.response?.status ?? DEFAULT_ERROR_CODE)
          .json({ message: error?.response?.data?.message ?? 'Error occurred.' });
      }

      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
      try {
        const io: Server = await this.createSocketIO(httpServer);
        this.socketIOConnections(io);
      } catch (error) {
        // Don't block HTTP server startup if Redis/Socket.IO adapter can't initialize.
        log.log('error', 'GatewayService createSocketIO() error method:', error);
      }
    } catch (error) {
      log.log('error', 'GatewayService startServer() error method:', error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    const REDIS_CONNECT_TIMEOUT_MS = 8000;
    await withTimeout(Promise.all([pubClient.connect(), subClient.connect()]), REDIS_CONNECT_TIMEOUT_MS, 'Redis pub/sub connect');
    io.adapter(createAdapter(pubClient, subClient));
    socketIO = io;
    return io;
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      log.info(`Gateway server has started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Gateway server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      log.log('error', 'GatewayService startServer() error method:', error);
    }
  }

  private socketIOConnections(io: Server): void {
    const socketIoApp = new SocketIOAppHandler(io);
    socketIoApp.listen();
  }
}
