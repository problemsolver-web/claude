import pino from 'pino';
import { env, isProd } from './env';

/**
 * Structured logger. Pretty-prints in development, JSON in production.
 */
export const logger = pino({
  level: isProd ? 'info' : 'debug',
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
      },
  base: { env: env.NODE_ENV },
});
