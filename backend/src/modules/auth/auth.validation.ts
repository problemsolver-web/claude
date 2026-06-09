import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().toLowerCase(),
    password: passwordSchema,
    userType: z.enum(['COMPANY', 'JOB_SEEKER']),
    // Optional profile bootstrap fields
    companyName: z.string().min(2).max(160).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({ token: z.string().min(1) }),
});

export const resendVerificationSchema = z.object({
  body: z.object({ email: z.string().email().toLowerCase() }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email().toLowerCase() }),
});

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().min(1), password: passwordSchema }),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(1) }),
});
