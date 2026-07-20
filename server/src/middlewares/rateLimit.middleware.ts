import rateLimit from 'express-rate-limit';
import { ApiError } from '~/utils/errors';

const isDev = process.env.NODE_ENV !== 'production';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 10, // Relaxed limit in local dev environment
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many login attempts from this IP, please try again after 15 minutes.'));
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 1000 : 5, // Relaxed limit in local dev environment
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many accounts created from this IP, please try again after an hour.'));
  },
});
