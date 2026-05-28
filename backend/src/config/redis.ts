import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Shared connection for BullMQ (do not block on connect)
export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  tls: REDIS_URL.startsWith('rediss') ? {} : undefined, // TLS for Upstash
});

// Separate client for general caching
export const redisClient = new Redis(REDIS_URL, {
  tls: REDIS_URL.startsWith('rediss') ? {} : undefined, // TLS for Upstash
});

redisClient.on('error', (err) => console.error('[Redis] Error:', err));
redisClient.on('connect', () => console.log('[Redis] Connected'));

export default redisClient;
