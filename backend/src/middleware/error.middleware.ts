import { Request, Response, NextFunction } from 'express';
import { AppError, errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    errorResponse(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle jsonwebtoken errors specifically
  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    errorResponse(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
    return;
  }

  logger.error('Unhandled Error:', err);

  errorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    500
  );
}
