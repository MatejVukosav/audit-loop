import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // Handle Zod validation errors
  if (err.name === 'ZodError' || err.errors) {
    return res.status(400).json({ error: err.errors || err.message });
  }
  // eslint-disable-next-line no-console
  console.error(err);

  res.status(500).json({ error: 'Internal Server Error' });
}
