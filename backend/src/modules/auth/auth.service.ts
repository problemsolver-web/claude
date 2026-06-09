import bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import {
  generateSecureToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../services/token.service';
import { sendPasswordResetEmail, sendVerificationEmail } from '../../services/email.service';

const SALT_ROUNDS = 12;
const EMAIL_VERIFY = 'EMAIL_VERIFY';
const PASSWORD_RESET = 'PASSWORD_RESET';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  userType: 'COMPANY' | 'JOB_SEEKER';
  companyName?: string;
}

/** Shape returned to clients — never includes the password hash. */
function publicUser(user: { id: string; email: string; name: string; userType: UserType; emailVerified: boolean }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    emailVerified: user.emailVerified,
  };
}

function issueTokens(user: { id: string; email: string; userType: UserType }) {
  const payload = { sub: user.id, email: user.email, userType: user.userType };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function createVerificationToken(userId: string, type: string, expiresHours: number) {
  const { raw, hashed } = generateSecureToken();
  await prisma.verificationToken.create({
    data: {
      userId,
      token: hashed,
      type,
      expiresAt: new Date(Date.now() + expiresHours * 60 * 60 * 1000),
    },
  });
  return raw;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create the user and its matching profile row in one transaction.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      userType: input.userType as UserType,
      ...(input.userType === 'COMPANY'
        ? { company: { create: { companyName: input.companyName ?? input.name } } }
        : { jobSeeker: { create: {} } }),
    },
  });

  const rawToken = await createVerificationToken(user.id, EMAIL_VERIFY, env.EMAIL_TOKEN_EXPIRES_HOURS);
  await sendVerificationEmail(user.email, rawToken);

  return { user: publicUser(user), ...issueTokens(user) };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-ish behavior: do a dummy compare to reduce user-enumeration timing leaks.
  const ok = user ? await bcrypt.compare(password, user.password) : await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
  if (!user || !ok) throw ApiError.unauthorized('Invalid email or password');

  return { user: publicUser(user), ...issueTokens(user) };
}

export async function verifyEmail(rawToken: string) {
  const hashed = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({ where: { token: hashed } });
  if (!record || record.type !== EMAIL_VERIFY || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { message: 'Email verified successfully' };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Don't reveal whether the account exists.
  if (user && !user.emailVerified) {
    const rawToken = await createVerificationToken(user.id, EMAIL_VERIFY, env.EMAIL_TOKEN_EXPIRES_HOURS);
    await sendVerificationEmail(user.email, rawToken);
  }
  return { message: 'If an unverified account exists, a verification email has been sent' };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = await createVerificationToken(user.id, PASSWORD_RESET, env.RESET_TOKEN_EXPIRES_HOURS);
    await sendPasswordResetEmail(user.email, rawToken);
  }
  // Always the same response to prevent account enumeration.
  return { message: 'If an account exists, a password reset email has been sent' };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const hashed = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({ where: { token: hashed } });
  if (!record || record.type !== PASSWORD_RESET || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Invalidate any other outstanding reset tokens for this user.
    prisma.verificationToken.updateMany({
      where: { userId: record.userId, type: PASSWORD_RESET, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return { message: 'Password reset successfully' };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw ApiError.unauthorized('User no longer exists');
  return issueTokens(user);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true, jobSeeker: true },
  });
  if (!user) throw ApiError.notFound('User not found');
  return {
    ...publicUser(user),
    company: user.company ?? undefined,
    jobSeeker: user.jobSeeker ?? undefined,
  };
}
