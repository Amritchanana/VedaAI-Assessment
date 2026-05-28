'use client';
import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignment.store';
import type { AssignmentFormData, QuestionType, DifficultyFilter } from '@/types';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from '@/types';
import clsx from 'clsx';

const QUESTION_TYPES: QuestionType[] = ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_in_blank'];
const DIFFICULTIES: DifficultyFilter[] = ['easy', 'medium', 'hard', 'mixed'];

interface Props {
  onSubmit: (data: AssignmentFormData) => void;
  submitting: boolean;
}

export function AssignmentForm({ onSubmit, submitting }: Props) {
  const { form, formErrors, setField, toggleQuestionType } = useAssignmentStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Subject */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-white text-base">Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Assignment Title *</label>
            <input
              type="text"
              placeholder="e.g. Chapter 5 – Photosynthesis Test"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={clsx('input-field', formErrors.title && 'error')}
            />
            {formErrors.title && <p className="error-text">{formErrors.title}</p>}
          </div>
          <div>
            <label className="label">Subject *</label>
            <input
              type="text"
              placeholder="e.g. Biology"
              value={form.subject}
              onChange={(e) => setField('subject', e.target.value)}
              className={clsx('input-field', formErrors.subject && 'error')}
            />
            {formErrors.subject && <p className="error-text">{formErrors.subject}</p>}
          </div>
          <div>
            <label className="label">Grade / Class</label>
            <input
              type="text"
              placeholder="e.g. Grade 10 / Class X"
              value={form.grade}
              onChange={(e) => setField('grade', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Due Date *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
              className={clsx('input-field', formErrors.dueDate && 'error')}
            />
            {formErrors.dueDate && <p className="error-text">{formErrors.dueDate}</p>}
          </div>
        </div>
      </div>

      {/* Question Types */}
      <div className="card space-y-4">
        <div>
          <h2 className="font-semibold text-white text-base">Question Types *</h2>
          <p className="text-slate-500 text-xs mt-0.5">Select one or more types</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {QUESTION_TYPES.map((type) => {
            const selected = form.questionTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleQuestionType(type)}
                className={clsx(
                  'px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left',
                  selected
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                )}
              >
                {QUESTION_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
        {formErrors.questionTypes && <p className="error-text">{formErrors.questionTypes}</p>}
      </div>

      {/* Questions & Marks */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-white text-base">Paper Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Total Questions *</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.totalQuestions}
              onChange={(e) => setField('totalQuestions', Number(e.target.value))}
              className={clsx('input-field', formErrors.totalQuestions && 'error')}
            />
            {formErrors.totalQuestions && <p className="error-text">{formErrors.totalQuestions}</p>}
          </div>
          <div>
            <label className="label">Total Marks *</label>
            <input
              type="number"
              min={1}
              max={500}
              value={form.totalMarks}
              onChange={(e) => setField('totalMarks', Number(e.target.value))}
              className={clsx('input-field', formErrors.totalMarks && 'error')}
            />
            {formErrors.totalMarks && <p className="error-text">{formErrors.totalMarks}</p>}
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setField('difficulty', e.target.value as DifficultyFilter)}
              className="input-field"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card space-y-3">
        <div>
          <h2 className="font-semibold text-white text-base">Source Material <span className="text-slate-500 font-normal text-sm">(optional)</span></h2>
          <p className="text-slate-500 text-xs mt-0.5">Upload a PDF or text file — AI will generate questions based on it</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => setField('file', e.target.files?.[0] || null)}
        />
        {form.file ? (
          <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-800/40 rounded-xl px-4 py-3">
            <Upload size={16} className="text-blue-400" />
            <span className="text-sm text-blue-300 flex-1 truncate">{form.file.name}</span>
            <button
              type="button"
              onClick={() => { setField('file', null); if (fileRef.current) fileRef.current.value = ''; }}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl py-8
              flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-all duration-200"
          >
            <Upload size={20} />
            <span className="text-sm">Click to upload PDF or TXT</span>
            <span className="text-xs text-slate-600">Max 10 MB</span>
          </button>
        )}
      </div>

      {/* Additional Instructions */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-white text-base">Additional Instructions <span className="text-slate-500 font-normal text-sm">(optional)</span></h2>
        <textarea
          rows={3}
          placeholder="e.g. Focus on chapters 3 and 4. Include at least 2 application-based questions..."
          value={form.additionalInstructions}
          onChange={(e) => setField('additionalInstructions', e.target.value)}
          className="input-field resize-none"
        />
        {formErrors.additionalInstructions && <p className="error-text">{formErrors.additionalInstructions}</p>}
      </div>

      {/* Submit */}
      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-4 text-base">
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          '✦ Generate Question Paper'
        )}
      </button>
    </form>
  );
}
