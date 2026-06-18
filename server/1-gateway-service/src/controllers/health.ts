import { Request, Response } from 'express';
import { createHealthHandler } from '@19010853/ithust-shared';

export class Health {
  private readonly healthHandler = createHealthHandler('API Gateway service is healthy and OK.');

  public health(_req: Request, res: Response): void {
    this.healthHandler(_req, res);
  }
}
