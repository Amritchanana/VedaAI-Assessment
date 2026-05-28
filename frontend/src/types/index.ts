export type QuestionType =
  | 'mcq'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_in_blank';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type DifficultyFilter = Difficulty | 'mixed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer',
  true_false: 'True / False',
  fill_in_blank: 'Fill in the Blank',
};

export const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  mixed: 'Mixed (Recommended)',
};

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: DifficultyFilter;
  additionalInstructions: string;
  file?: File | null;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  answer?: string;
}

export interface GeneratedSection {
  title: string;
  instruction: string;
  questionType: QuestionType;
  questions: GeneratedQuestion[];
  totalMarks: number;
}

export interface GeneratedPaper {
  assignmentId: string;
  title: string;
  subject: string;
  grade?: string;
  dueDate: string;
  totalMarks: number;
  totalQuestions: number;
  duration?: string;
  sections: GeneratedSection[];
  generatedAt: string;
}

export interface AssignmentRecord {
  _id: string;
  title: string;
  subject: string;
  status: JobStatus;
  totalQuestions: number;
  totalMarks: number;
  result?: GeneratedPaper;
  error?: string;
  createdAt: string;
}

export interface JobProgress {
  assignmentId: string;
  status: JobStatus;
  progress: number;
  message: string;
}
