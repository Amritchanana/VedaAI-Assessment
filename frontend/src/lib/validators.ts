import type { AssignmentFormData } from '../types';

type Errors = Partial<Record<keyof AssignmentFormData, string>>;

export function validateAssignmentForm(form: AssignmentFormData): Errors {
  const errors: Errors = {};

  if (!form.title.trim()) errors.title = 'Title is required';
  else if (form.title.length > 200) errors.title = 'Title must be under 200 characters';

  if (!form.subject.trim()) errors.subject = 'Subject is required';

  if (!form.dueDate) errors.dueDate = 'Due date is required';
  else if (new Date(form.dueDate) < new Date()) errors.dueDate = 'Due date must be in the future';

  if (form.questionTypes.length === 0)
    errors.questionTypes = 'Select at least one question type';

  if (!form.totalQuestions || form.totalQuestions < 1)
    errors.totalQuestions = 'At least 1 question required';
  else if (form.totalQuestions > 100)
    errors.totalQuestions = 'Maximum 100 questions allowed';

  if (!form.totalMarks || form.totalMarks < 1)
    errors.totalMarks = 'Total marks must be at least 1';
  else if (form.totalMarks > 500)
    errors.totalMarks = 'Maximum 500 marks allowed';

  if (form.additionalInstructions && form.additionalInstructions.length > 1000)
    errors.additionalInstructions = 'Instructions too long (max 1000 chars)';

  return errors;
}

export function hasErrors(errors: Partial<Record<string, string>>): boolean {
  return Object.values(errors).some(Boolean);
}
