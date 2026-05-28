import type { Request, Response } from 'express';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { generationQueue } from '../services/queue';
import redisClient from '../config/redis';

const QUESTION_TYPES = ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_in_blank'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'] as const;

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  grade: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z
    .array(z.enum(QUESTION_TYPES))
    .min(1, 'Select at least one question type'),
  totalQuestions: z.number().int().min(1).max(100),
  totalMarks: z.number().int().min(1).max(500),
  difficulty: z.enum(DIFFICULTIES).default('mixed'),
  additionalInstructions: z.string().max(1000).optional(),
});

// POST /api/assignments
export async function createAssignment(req: Request, res: Response) {
  try {
    const parsed = CreateAssignmentSchema.safeParse({
      ...req.body,
      totalQuestions: Number(req.body.totalQuestions),
      totalMarks: Number(req.body.totalMarks),
    });

    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const data = parsed.data;

    // Extract text from uploaded file if present
    let fileContent: string | undefined;
    if (req.file) {
      // For text files read directly; PDF parsing handled in middleware
      fileContent = (req as any).extractedText;
    }

    const assignment = await Assignment.create({
      ...data,
      dueDate: new Date(data.dueDate),
      fileContent,
      status: 'pending',
    });

    // Add to generation queue
    const job = await generationQueue.add(
      'generate',
      { assignmentId: assignment._id.toString() },
      { jobId: assignment._id.toString() }
    );

    await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

    return res.status(201).json({
      success: true,
      assignmentId: assignment._id.toString(),
      message: 'Assignment created and queued for generation',
    });
  } catch (err: any) {
    console.error('[Controller] createAssignment error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

// GET /api/assignments/:id
export async function getAssignment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check cache first
    const cached = await redisClient.get(`assignment:${id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Cache completed results for 1 hour
    if (assignment.status === 'completed') {
      await redisClient.setex(`assignment:${id}`, 3600, JSON.stringify(assignment));
    }

    return res.json(assignment);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

// GET /api/assignments
export async function listAssignments(req: Request, res: Response) {
  try {
    const assignments = await Assignment.find()
      .select('-fileContent -result') // exclude heavy fields from list
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json(assignments);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/assignments/:id/regenerate
export async function regenerateAssignment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Clear cache
    await redisClient.del(`assignment:${id}`);

    // Reset status
    await Assignment.findByIdAndUpdate(id, {
      status: 'pending',
      result: null,
      error: null,
    });

    const job = await generationQueue.add(
      'generate',
      { assignmentId: id },
      { jobId: `${id}-${Date.now()}` }
    );

    return res.json({ success: true, jobId: job.id, message: 'Regeneration queued' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

// DELETE /api/assignments/:id
export async function deleteAssignment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Clear cache
    await redisClient.del(`assignment:${id}`);

    // Delete the assignment
    await Assignment.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
