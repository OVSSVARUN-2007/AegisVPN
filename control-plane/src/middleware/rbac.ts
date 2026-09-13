import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role) || role === 'SuperAdmin');
    if (!hasPermission) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Required one of: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};
