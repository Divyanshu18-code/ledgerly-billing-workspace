import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '~/utils/errors';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
    return;
  }

  // Fallback for unhandled exceptions
  console.error('[Unhandled Exception]:', err);
  
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
};
