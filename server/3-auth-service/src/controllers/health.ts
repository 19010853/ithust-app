import { Request, Response } from 'express';
import { createHealthHandler } from '@19010853/ithust-shared';

const healthHandler = createHealthHandler('Auth service is healthy and OK.');

export function health(_req: Request, res: Response): void {
  healthHandler(_req, res);
}
