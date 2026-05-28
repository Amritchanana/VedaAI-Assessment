// Assignment types shared across backend

export type QuestionType =
  | 'mcq'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_in_blank';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AssignmentInput {
  title: string;
  subject: string;
  grade?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: Difficulty | 'mixed';
  additionalInstructions?: string;
  fileContent?: string; // extracted text from uploaded PDF/txt
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[]; // for MCQ
  answer?: string;    // optional model answer
}

export interface GeneratedSection {
  title: string;       // "Section A"
  instruction: string; // "Attempt all questions"
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

export interface JobProgressUpdate {
  assignmentId: string;
  status: JobStatus;
  progress: number; // 0-100
  message: string;
}
