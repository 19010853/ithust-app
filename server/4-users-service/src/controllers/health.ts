import { Request, Response } from 'express';
import { createHealthHandler } from '@19010853/ithust-shared';

const healthHandler = createHealthHandler('Users service is healthy and OK.');

const health = (_req: Request, res: Response): void => {
  healthHandler(_req, res);
};

export { health };
