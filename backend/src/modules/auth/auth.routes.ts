import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimit';
import * as ctrl from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validation';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate(registerSchema), asyncHandler(ctrl.register));
authRouter.post('/login', authRateLimiter, validate(loginSchema), asyncHandler(ctrl.login));
authRouter.post('/verify-email', validate(verifyEmailSchema), asyncHandler(ctrl.verifyEmail));
authRouter.post(
  '/resend-verification',
  authRateLimiter,
  validate(resendVerificationSchema),
  asyncHandler(ctrl.resendVerification),
);
authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(ctrl.forgotPassword),
);
authRouter.post('/reset-password', validate(resetPasswordSchema), asyncHandler(ctrl.resetPassword));
authRouter.post('/refresh', validate(refreshSchema), asyncHandler(ctrl.refresh));
authRouter.get('/me', authenticate, asyncHandler(ctrl.me));
