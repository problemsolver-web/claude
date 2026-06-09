import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

/** General API limiter: 100 requests / 15 min per IP. */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(ApiError.tooMany()),
});

/** Stricter limiter for sensitive auth endpoints: 10 requests / 15 min per IP. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(ApiError.tooMany('Too many attempts, please try again later')),
});
