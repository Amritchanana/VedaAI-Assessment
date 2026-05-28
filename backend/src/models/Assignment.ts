import mongoose, { Schema, Document } from 'mongoose';
import type { AssignmentInput, GeneratedPaper, JobStatus } from '../types';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade?: string;
  dueDate: Date;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  fileContent?: string;
  status: JobStatus;
  jobId?: string;
  result?: GeneratedPaper;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String },
    dueDate: { type: Date, required: true },
    questionTypes: [{ type: String }],
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    difficulty: { type: String, default: 'mixed' },
    additionalInstructions: { type: String },
    fileContent: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
