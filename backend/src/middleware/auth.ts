import { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../services/token.service';

/** Requires a valid Bearer access token; attaches the user to req.user. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid Authorization header'));
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, userType: payload.userType };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Restricts a route to specific user types. Use after authenticate. */
export function authorize(...types: UserType[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!types.includes(req.user.userType)) return next(ApiError.forbidden());
    next();
  };
}
