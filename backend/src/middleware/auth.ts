import { Request, Response, NextFunction } from 'express';

const tokenStore = new Map<string, { username: string; expiresAt: number }>();

export { tokenStore };

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const session = tokenStore.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    if (Date.now() > session.expiresAt) {
      tokenStore.delete(token);
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }

    (req as any).user = { username: session.username };
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Auth check failed' });
  }
};
