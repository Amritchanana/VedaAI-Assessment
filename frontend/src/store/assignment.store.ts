import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  AssignmentFormData,
  GeneratedPaper,
  JobProgress,
  JobStatus,
  QuestionType,
  DifficultyFilter,
} from '../types';

interface AssignmentStore {
  // Form state
  form: AssignmentFormData;
  formErrors: Partial<Record<keyof AssignmentFormData, string>>;

  // Job/generation state
  assignmentId: string | null;
  jobStatus: JobStatus | null;
  jobProgress: number;
  jobMessage: string;

  // Result
  generatedPaper: GeneratedPaper | null;

  // Form actions
  setField: <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => void;
  toggleQuestionType: (type: QuestionType) => void;
  setFormError: (key: keyof AssignmentFormData, error: string) => void;
  clearFormErrors: () => void;
  resetForm: () => void;

  // Job actions
  setAssignmentId: (id: string) => void;
  updateProgress: (progress: JobProgress) => void;
  setGeneratedPaper: (paper: GeneratedPaper) => void;
  setJobFailed: (error: string) => void;
  resetJob: () => void;
}

const defaultForm: AssignmentFormData = {
  title: '',
  subject: '',
  grade: '',
  dueDate: '',
  questionTypes: [],
  totalQuestions: 10,
  totalMarks: 50,
  difficulty: 'mixed',
  additionalInstructions: '',
  file: null,
};

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set) => ({
      form: { ...defaultForm },
      formErrors: {},
      assignmentId: null,
      jobStatus: null,
      jobProgress: 0,
      jobMessage: '',
      generatedPaper: null,

      setField: (key, value) =>
        set((state) => ({
          form: { ...state.form, [key]: value },
          formErrors: { ...state.formErrors, [key]: undefined },
        })),

      toggleQuestionType: (type) =>
        set((state) => {
          const current = state.form.questionTypes;
          const next = current.includes(type)
            ? current.filter((t) => t !== type)
            : [...current, type];
          return { form: { ...state.form, questionTypes: next } };
        }),

      setFormError: (key, error) =>
        set((state) => ({ formErrors: { ...state.formErrors, [key]: error } })),

      clearFormErrors: () => set({ formErrors: {} }),

      resetForm: () => set({ form: { ...defaultForm }, formErrors: {} }),

      setAssignmentId: (id) => set({ assignmentId: id, jobStatus: 'pending', jobProgress: 0 }),

      updateProgress: (progress) =>
        set({
          jobStatus: progress.status,
          jobProgress: progress.progress,
          jobMessage: progress.message,
        }),

      setGeneratedPaper: (paper) =>
        set({ generatedPaper: paper, jobStatus: 'completed', jobProgress: 100 }),

      setJobFailed: (error) =>
        set({ jobStatus: 'failed', jobMessage: error, jobProgress: 0 }),

      resetJob: () =>
        set({ assignmentId: null, jobStatus: null, jobProgress: 0, jobMessage: '', generatedPaper: null }),
    }),
    { name: 'AssignmentStore' }
  )
);
