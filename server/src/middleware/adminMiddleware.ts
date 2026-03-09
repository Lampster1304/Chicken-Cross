import { Request, Response, NextFunction } from 'express';

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const userPayload = (req as any).userPayload;

  if (!userPayload || userPayload.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}
