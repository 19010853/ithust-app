import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health';
import { authRoutes } from '@gateway/routes/auth';
import { searchRoutes } from '@gateway/routes/search';

const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
    app.use(`${BASE_PATH}`, healthRoutes.routes());
    app.use(`${BASE_PATH}`, authRoutes.routes());
    app.use(`${BASE_PATH}`, searchRoutes.routes());
};