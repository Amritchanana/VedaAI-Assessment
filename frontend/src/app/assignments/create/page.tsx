'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { useAssignmentStore } from '@/store/assignment.store';
import { useJobSocket } from '@/hooks/useJobSocket';
import { createAssignment } from '@/lib/api';
import { validateAssignmentForm, hasErrors } from '@/lib/validators';
import { GenerationProgress } from '@/components/assignment/GenerationProgress';
import clsx from 'clsx';
import type { QuestionType, AssignmentFormData } from '@/types';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short_answer', label: 'Short Questions' },
  { value: 'long_answer', label: 'Long Answer Questions' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_in_blank', label: 'Fill in the Blank' },
];

interface QuestionRow { type: QuestionType; count: number; marks: number; }

const S = {
  label: { fontSize: 11, fontWeight: 500, color: '#9B9B8E', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6, display: 'block' },
  input: {
    width: '100%', background: '#fff', border: '1px solid #E8E8E3',
    borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#1A1A18',
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: '#fff', border: '1px solid #E8E8E3', borderRadius: 12,
    padding: '20px', marginBottom: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#1A1A18', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#9B9B8E', marginBottom: 16 },
  errMsg: { fontSize: 11, color: '#EF4444', marginTop: 4 },
  stepper: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  stepBtn: {
    width: 24, height: 24, borderRadius: 6, border: '1px solid #E8E8E3',
    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 14, color: '#6B6B60',
  },
  stepVal: { width: 28, textAlign: 'center' as const, fontSize: 13, fontWeight: 500, color: '#1A1A18' },
};

export default function CreateAssignmentPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { type: 'mcq', count: 4, marks: 1 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { assignmentId, jobStatus, generatedPaper, setAssignmentId } = useAssignmentStore();
  useJobSocket(assignmentId);

  if (jobStatus === 'completed' && generatedPaper) {
    router.push(`/result/${assignmentId}`);
  }

  const totalQuestions = questionRows.reduce((s, r) => s + r.count, 0);
  const totalMarks = questionRows.reduce((s, r) => s + r.count * r.marks, 0);

  function addRow() {
    const unused = QUESTION_TYPES.find(t => !questionRows.find(r => r.type === t.value));
    if (unused) setQuestionRows(p => [...p, { type: unused.value, count: 3, marks: 2 }]);
  }
  function removeRow(i: number) { setQuestionRows(p => p.filter((_, idx) => idx !== i)); }
  function adjustCount(i: number, d: number) {
    setQuestionRows(p => p.map((r, idx) => idx === i ? { ...r, count: Math.max(1, r.count + d) } : r));
  }
  function adjustMarks(i: number, d: number) {
    setQuestionRows(p => p.map((r, idx) => idx === i ? { ...r, marks: Math.max(1, r.marks + d) } : r));
  }
  function updateType(i: number, v: QuestionType) {
    setQuestionRows(p => p.map((r, idx) => idx === i ? { ...r, type: v } : r));
  }

  async function handleSubmit() {
    const formData: AssignmentFormData = {
      title, subject, grade, dueDate,
      questionTypes: questionRows.map(r => r.type),
      totalQuestions, totalMarks, difficulty,
      additionalInstructions, file,
    };
    const errs = validateAssignmentForm(formData);
    if (hasErrors(errs)) { setErrors(errs as Record<string, string>); return; }
    setErrors({}); setSubmitting(true); setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('subject', subject); fd.append('grade', grade);
      fd.append('dueDate', dueDate);
      questionRows.forEach(r => fd.append('questionTypes', r.type));
      fd.append('totalQuestions', String(totalQuestions)); fd.append('totalMarks', String(totalMarks));
      fd.append('difficulty', difficulty);
      if (additionalInstructions) fd.append('additionalInstructions', additionalInstructions);
      if (file) fd.append('file', file);
      const { assignmentId: id } = await createAssignment(fd);
      setAssignmentId(id);
    } catch (e: any) { setSubmitError(e.message || 'Something went wrong'); }
    finally { setSubmitting(false); }
  }

  if (assignmentId && jobStatus && jobStatus !== 'completed') {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F0' }}>
        <Sidebar />
        <Topbar showBack breadcrumb="Assignment" showProgress progressValue={30} />
        <main style={{ marginLeft: 220, marginTop: 110, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 110px)' }}>
          <GenerationProgress />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F0' }}>
      <Sidebar />
      <Topbar showBack breadcrumb="Assignment" showProgress progressValue={40} />

      <main style={{ marginLeft: 220, marginTop: 110, padding: '24px', background: '#F5F5F0' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>

          {/* File upload */}
          <div style={S.card}>
            <p style={S.cardTitle}>Assignment Details</p>
            <p style={S.cardSub}>Basic information about your assignment.</p>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.png,.jpg" style={{ display: 'none' }}
              onChange={e => setFile(e.target.files?.[0] || null)} />
            {file ? (
              <div style={{ border: '1px solid #E8E8E3', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, background: '#F9F9F7' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#6B6B60" strokeWidth="1.5"><path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7A1.5 1.5 0 0012 11.5V10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 12, color: '#1A1A18', flex: 1 }}>{file.name}</span>
                <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B9B8E', fontSize: 16 }}>×</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{
                width: '100%', border: '1.5px dashed #D4D4CC', borderRadius: 10,
                padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: '#FAFAF8', cursor: 'pointer',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0F0EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6B6B60" strokeWidth="1.5"><path d="M8 1v9M5 4l3-3 3 3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#1A1A18' }}>Choose a file or drag & drop it here</p>
                <p style={{ fontSize: 11, color: '#9B9B8E' }}>JPEG, PNG, PDF, up to 10 MB</p>
                <span style={{ marginTop: 4, padding: '5px 14px', border: '1px solid #E8E8E3', borderRadius: 6, fontSize: 11, color: '#6B6B60', background: '#fff' }}>Browse Files</span>
                <p style={{ fontSize: 11, color: '#C4C4BC' }}>Upload images of your preferred documents/image</p>
              </button>
            )}
          </div>

          {/* Fields */}
          <div style={S.card}>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Assignment Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 – Electricity Quiz" style={{ ...S.input, border: errors.title ? '1px solid #EF4444' : '1px solid #E8E8E3' }} />
              {errors.title && <p style={S.errMsg}>{errors.title}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={S.label}>Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Science"
                  style={{ ...S.input, border: errors.subject ? '1px solid #EF4444' : '1px solid #E8E8E3' }} />
                {errors.subject && <p style={S.errMsg}>{errors.subject}</p>}
              </div>
              <div>
                <label style={S.label}>Grade / Class</label>
                <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. Grade 8" style={S.input} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                style={{ ...S.input, border: errors.dueDate ? '1px solid #EF4444' : '1px solid #E8E8E3' }} />
              {errors.dueDate && <p style={S.errMsg}>{errors.dueDate}</p>}
            </div>
            <div>
              <label style={S.label}>Difficulty</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['easy', 'medium', 'hard', 'mixed'] as const).map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: difficulty === d ? '1px solid #1A1A18' : '1px solid #E8E8E3',
                    background: difficulty === d ? '#1A1A18' : '#fff',
                    color: difficulty === d ? '#fff' : '#6B6B60',
                    cursor: 'pointer', textTransform: 'capitalize',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question types */}
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={S.cardTitle}>Question Type</p>
              <div style={{ display: 'flex', gap: 48 }}>
                <span style={{ fontSize: 11, color: '#9B9B8E', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>No. of Questions</span>
                <span style={{ fontSize: 11, color: '#9B9B8E', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Marks</span>
              </div>
            </div>

            {errors.questionTypes && <p style={{ ...S.errMsg, marginBottom: 8 }}>{errors.questionTypes}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questionRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <select value={row.type} onChange={e => updateType(i, e.target.value as QuestionType)}
                      style={{ ...S.input, appearance: 'none', paddingRight: 28, cursor: 'pointer' }}>
                      {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9B9B8E" strokeWidth="1.5"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={S.stepper}>
                    <button onClick={() => adjustCount(i, -1)} style={S.stepBtn}>−</button>
                    <span style={S.stepVal}>{row.count}</span>
                    <button onClick={() => adjustCount(i, 1)} style={S.stepBtn}>+</button>
                  </div>
                  <span style={{ color: '#D4D4CC', fontSize: 14 }}>×</span>
                  <div style={S.stepper}>
                    <button onClick={() => adjustMarks(i, -1)} style={S.stepBtn}>−</button>
                    <span style={S.stepVal}>{row.marks}</span>
                    <button onClick={() => adjustMarks(i, 1)} style={S.stepBtn}>+</button>
                  </div>
                  <button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4C4BC', fontSize: 18, padding: '0 2px' }}>×</button>
                </div>
              ))}
            </div>

            {questionRows.length < QUESTION_TYPES.length && (
              <button onClick={addRow} style={{
                marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 500, color: '#D4520A', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#D4520A" strokeWidth="2"><path d="M6.5 2v9M2 6.5h9" strokeLinecap="round"/></svg>
                Add Question Type
              </button>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F0F0EC', display: 'flex', justifyContent: 'flex-end', gap: 24 }}>
              <span style={{ fontSize: 12, color: '#6B6B60' }}>Total Questions: <strong style={{ color: '#1A1A18' }}>{totalQuestions}</strong></span>
              <span style={{ fontSize: 12, color: '#6B6B60' }}>Total Marks: <strong style={{ color: '#1A1A18' }}>{totalMarks}</strong></span>
            </div>
          </div>

          {/* Additional instructions */}
          <div style={S.card}>
            <label style={S.label}>Additional Information (For better output)</label>
            <div style={{ position: 'relative' }}>
              <textarea rows={3} value={additionalInstructions}
                onChange={e => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Generate a question paper for a 3 hour exam duration..."
                style={{ ...S.input, resize: 'none', paddingRight: 36, lineHeight: 1.6 }} />
              <button style={{ position: 'absolute', right: 10, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#C4C4BC' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7.5 1v9M5 8l2.5 2L10 8M3 12h9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {submitError && <p style={{ color: '#EF4444', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>{submitError}</p>}

          {/* Nav buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 32 }}>
            <Link href="/assignments" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 8, border: '1px solid #E8E8E3',
              background: '#fff', fontSize: 13, fontWeight: 500, color: '#6B6B60',
              textDecoration: 'none',
            }}>
              ← Previous
            </Link>
            <button onClick={handleSubmit} disabled={submitting} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 22px', borderRadius: 8, border: 'none',
              background: submitting ? '#6B6B60' : '#1A1A18', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {submitting ? (
                <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
              ) : 'Next →'}
            </button>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
