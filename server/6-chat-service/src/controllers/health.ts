import { Request, Response } from 'express';
import { createHealthHandler } from '@19010853/ithust-shared';

const healthHandler = createHealthHandler('Chat service is healthy and OK.');

const health = (_req: Request, res: Response): void => {
  healthHandler(_req, res);
};

export { health };
