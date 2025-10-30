import redisClient from '../config/redis';
import { env } from '../config/env';

export class CacheService {
  private defaultTTL = env.cacheTtl;

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await redisClient.setEx(
        key,
        ttl || this.defaultTTL,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidate(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      await this.del(pattern);
    }
  }

  buildKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join(':');
    return `${prefix}:${sortedParams}`;
  }
}

export default new CacheService();
