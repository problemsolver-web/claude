import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { apiRateLimiter } from './middleware/rateLimit';
import { authRouter } from './modules/auth/auth.routes';
import { profileRouter } from './modules/profiles/profile.routes';
import { jobRouter } from './modules/jobs/job.routes';
import { applicationRouter } from './modules/applications/application.routes';
import { messageRouter } from './modules/messages/message.routes';
import { matchingRouter } from './modules/matching/matching.routes';
import { notificationRouter } from './modules/notifications/notification.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';

/** Builds and configures the Express application (no listening here). */
export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes (rate limited)
  app.use('/api', apiRateLimiter);
  app.use('/api/auth', authRouter);
  app.use('/api/profiles', profileRouter);
  app.use('/api/jobs', jobRouter);
  app.use('/api/applications', applicationRouter);
  app.use('/api/messages', messageRouter);
  app.use('/api/matching', matchingRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/analytics', analyticsRouter);

  // Fallbacks
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
