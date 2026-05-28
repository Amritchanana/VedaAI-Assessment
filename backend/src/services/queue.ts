import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

export const GENERATION_QUEUE = 'generation';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const generationQueue = new Queue(GENERATION_QUEUE, {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    attempts: 1,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export interface GenerationJobData {
  assignmentId: string;
}
