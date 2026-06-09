import nodemailer, { Transporter } from 'nodemailer';
import { env, isProd } from '../config/env';
import { logger } from '../config/logger';

let transporter: Transporter | null = null;

/**
 * Lazily create a transporter. When SMTP is not configured (typical in dev),
 * emails are logged to the console instead of being sent.
 */
function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const tx = getTransporter();
  if (!tx) {
    logger.info({ to, subject, html }, '[email:dev] SMTP not configured — logging email');
    return;
  }
  await tx.sendMail({ from: env.SMTP_FROM, to, subject, html });
  if (!isProd) logger.info({ to, subject }, 'Email sent');
}

export async function sendVerificationEmail(to: string, rawToken: string): Promise<void> {
  const url = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
  await sendMail(
    to,
    'Verify your JobMatch BD email',
    `<p>Welcome to JobMatch BD!</p>
     <p>Please verify your email by clicking the link below:</p>
     <p><a href="${url}">${url}</a></p>
     <p>This link expires in ${env.EMAIL_TOKEN_EXPIRES_HOURS} hours.</p>`,
  );
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const url = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
  await sendMail(
    to,
    'Reset your JobMatch BD password',
    `<p>We received a request to reset your password.</p>
     <p><a href="${url}">${url}</a></p>
     <p>This link expires in ${env.RESET_TOKEN_EXPIRES_HOURS} hour(s). If you didn't request this, ignore this email.</p>`,
  );
}
