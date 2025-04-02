// services/queueService.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config';

export const redisConnection = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null
});

// Create a persistent Redis-backed queue named "emailQueue"
export const emailQueue = new Queue('emailQueue', { connection: redisConnection });
