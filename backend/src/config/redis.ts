import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

/**
 * Shared Redis client used for caching and (later) session/token storage.
 * lazyConnect lets the app boot even if Redis is briefly unavailable.
 */
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

redis.on('error', (err) => logger.error({ err }, 'Redis connection error'));
redis.on('connect', () => logger.info('Redis connected'));

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (err) {
    logger.warn({ err }, 'Redis unavailable at startup; continuing without cache');
  }
}
