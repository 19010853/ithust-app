import { Application } from 'express';
import { healthRoutes } from '@chat/routes/health';

const BASE_PATH = '/api/v1/message';

const appRoutes = (app: Application): void => {
    app.use(BASE_PATH, healthRoutes());
};

export { appRoutes };