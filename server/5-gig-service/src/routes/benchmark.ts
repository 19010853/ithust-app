import { esSearch, mongoSearch } from '@gig/controllers/benchmark';
import express, { Router } from 'express';

const router: Router = express.Router();

const benchmarkRoutes = (): Router => {
  router.get('/search/:from/:size/:type', esSearch);
  router.get('/mongo/search/:from/:size/:type', mongoSearch);
  return router;
};

export { benchmarkRoutes };
