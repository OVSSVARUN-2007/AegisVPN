import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/db.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    const user = db.users.get(decoded.userId);
    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Unauthorized', message: 'User account is inactive or deleted' });
      return;
    }

    // Fetch user roles
    const userRoles = db.userRoles
      .filter(ur => ur.user_id === user.id)
      .map(ur => db.roles.get(ur.role_id)?.name || '')
      .filter(Boolean);

    req.user = {
      id: user.id,
      email: user.email,
      roles: userRoles.length > 0 ? userRoles : ['User']
    };

    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Token invalid or expired' });
    return;
  }
};
