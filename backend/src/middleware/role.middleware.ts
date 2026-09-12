import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response.util';

type Role = 'ADMIN' | 'PM' | 'DEVELOPER';

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Not authenticated', 401));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AppError(
          'FORBIDDEN',
          `This action requires one of: ${roles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
}
