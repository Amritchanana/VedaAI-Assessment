import { Worker } from 'bullmq';
import { GENERATION_QUEUE, type GenerationJobData } from '../services/queue';
import { generateQuestionPaper } from '../services/ai.service';
import { Assignment } from '../models/Assignment';
import { emitProgress, emitComplete, emitFailed } from '../sockets';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';
dotenv.config();

// Get Redis connection string
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Connect to DB when running worker standalone
connectDB();

const worker = new Worker<GenerationJobData>(
  GENERATION_QUEUE,
  async (job) => {
    const { assignmentId } = job.data;
    console.log(`[Worker] Processing job ${job.id} for assignment ${assignmentId}`);

    // Mark as processing
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

    emitProgress({ assignmentId, status: 'processing', progress: 5, message: 'Starting generation...' });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    const input = {
      title: assignment.title,
      subject: assignment.subject,
      grade: assignment.grade,
      dueDate: assignment.dueDate.toISOString(),
      questionTypes: assignment.questionTypes as any[],
      totalQuestions: assignment.totalQuestions,
      totalMarks: assignment.totalMarks,
      difficulty: assignment.difficulty as any,
      additionalInstructions: assignment.additionalInstructions,
      fileContent: assignment.fileContent,
    };

    const result = await generateQuestionPaper(input, (progress, message) => {
      emitProgress({ assignmentId, status: 'processing', progress, message });
      job.updateProgress(progress);
    });

    result.assignmentId = assignmentId;

    // Store result
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      result,
    });

    emitComplete(assignmentId, result);
    console.log(`[Worker] Completed job ${job.id}`);

    return result;
  },
  {
    connection: {
      url: REDIS_URL,
      ...(REDIS_URL.startsWith('rediss') && { tls: {} }),
    },
    concurrency: 3,
  }
);

worker.on('failed', async (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  if (job?.data?.assignmentId) {
    await Assignment.findByIdAndUpdate(job.data.assignmentId, {
      status: 'failed',
      error: err.message,
    });
    emitFailed(job.data.assignmentId, err.message);
  }
});

worker.on('ready', () => console.log('[Worker] Generation worker ready'));

export default worker;
