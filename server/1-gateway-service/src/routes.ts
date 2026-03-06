import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health';
import { authRoutes } from '@gateway/routes/auth';
import { searchRoutes } from '@gateway/routes/search';
import { buyerRoutes } from '@gateway/routes/buyer';
import { sellerRoutes } from './routes/seller';
import { currentUserRoutes } from './routes/current-user';
import { authMiddleware } from './services/auth-middleware';
import { gigRoutes } from './routes/gig';
import { messageRoutes } from './routes/message';

const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
    app.use(`${BASE_PATH}`, healthRoutes.routes());
    app.use(`${BASE_PATH}`, authRoutes.routes());
    app.use(`${BASE_PATH}`, searchRoutes.routes());
    app.use(`${BASE_PATH}`, buyerRoutes.routes());
    app.use(`${BASE_PATH}`, sellerRoutes.routes());
    app.use(`${BASE_PATH}`, gigRoutes.routes());
    app.use(`${BASE_PATH}`, messageRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
};