import { Health } from '@gateway/controllers/health';
import express, { Router } from 'express';

class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    const healthInstance = new Health();
    this.router.get('/gateway-health', (req, res) => healthInstance.health(req, res));
    return this.router;
  }
}

export const healthRoutes: HealthRoutes = new HealthRoutes();
