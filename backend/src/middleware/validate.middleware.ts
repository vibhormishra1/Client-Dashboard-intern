import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response.util';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(
        res,
        'BAD_REQUEST',
        'Validation failed',
        400,
        parsed.error.issues
      );
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      errorResponse(
        res,
        'BAD_REQUEST',
        'Query validation failed',
        400,
        parsed.error.issues
      );
      return;
    }
    req.query = parsed.data as typeof req.query;
    next();
  };
}
