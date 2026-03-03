import { verifyGatewayRequest } from '@19010853/ithust-shared';
import { Application } from 'express';

const BASE_PATH = '/api/v1/gig';

const appRoutes = (app: Application): void => {
    //   app.use('', healthRoutes());
    //   app.use(BASE_PATH, verifyGatewayRequest,  gigRoutes());
};

export { appRoutes };