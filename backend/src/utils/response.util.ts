import { Response } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown[];

  constructor(code: string, message: string, statusCode: number, details?: unknown[]) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function successResponse(res: Response, data: unknown, meta?: unknown, statusCode: number = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
    meta,
  });
}

export function errorResponse(res: Response, code: string, message: string, statusCode: number, details?: unknown[]): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: details || [],
    },
  });
}
