'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { AssignmentForm } from '@/components/assignment/AssignmentForm';
import { GenerationProgress } from '@/components/assignment/GenerationProgress';
import { useAssignmentStore } from '@/store/assignment.store';
import { useJobSocket } from '@/hooks/useJobSocket';
import { createAssignment } from '@/lib/api';
import { validateAssignmentForm, hasErrors } from '@/lib/validators';
import type { AssignmentFormData } from '@/types';

export default function CreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    form,
    formErrors,
    assignmentId,
    jobStatus,
    generatedPaper,
    setFormError,
    clearFormErrors,
    setAssignmentId,
  } = useAssignmentStore();

  // Connect WebSocket once we have an assignmentId
  useJobSocket(assignmentId);

  // Redirect to result page when generation completes
  if (jobStatus === 'completed' && generatedPaper) {
    router.push(`/result/${assignmentId}`);
  }

  async function handleSubmit(data: AssignmentFormData) {
    clearFormErrors();
    const errors = validateAssignmentForm(data);
    if (hasErrors(errors)) {
      Object.entries(errors).forEach(([k, v]) => {
        if (v) setFormError(k as keyof AssignmentFormData, v);
      });
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('subject', data.subject);
      fd.append('grade', data.grade);
      fd.append('dueDate', data.dueDate);
      data.questionTypes.forEach((t) => fd.append('questionTypes', t));
      fd.append('totalQuestions', String(data.totalQuestions));
      fd.append('totalMarks', String(data.totalMarks));
      fd.append('difficulty', data.difficulty);
      if (data.additionalInstructions) fd.append('additionalInstructions', data.additionalInstructions);
      if (data.file) fd.append('file', data.file);

      const { assignmentId: id } = await createAssignment(fd);
      setAssignmentId(id);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-bold text-white">VedaAI</span>
        </div>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 text-sm">Create Assessment</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Assessment</h1>
          <p className="text-slate-400">Fill in the details below to generate your question paper.</p>
        </div>

        {/* Show progress overlay if job is running */}
        {assignmentId && jobStatus && jobStatus !== 'completed' ? (
          <GenerationProgress />
        ) : (
          <>
            {submitError && (
              <div className="mb-6 bg-red-900/30 border border-red-800/50 rounded-xl p-4 text-red-300 text-sm">
                {submitError}
              </div>
            )}
            <AssignmentForm onSubmit={handleSubmit} submitting={submitting} />
          </>
        )}
      </div>
    </main>
  );
}
