import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '~/utils/errors';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })) || [];

      const detailedMsg = errors.length > 0
        ? `Validation failed: ${errors.map((e: any) => `${e.field} (${e.message})`).join(', ')}`
        : 'Validation failed';
      
      next(ApiError.badRequest(detailedMsg, errors));
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })) || [];
      
      next(ApiError.badRequest('Query validation failed', errors));
    }
  };
};
