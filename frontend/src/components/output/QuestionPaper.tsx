'use client';
import { useState } from 'react';
import type { GeneratedPaper, GeneratedQuestion, Difficulty } from '@/types';
import { QUESTION_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';

interface Props { paper: GeneratedPaper; }

// FIX 1: Added a safety check (!d) so the app doesn't crash if difficulty is missing
function DiffTag({ d }: { d?: Difficulty }) {
  if (!d) return null; 
  const label = d === 'medium' ? 'Moderate' : d.charAt(0).toUpperCase() + d.slice(1);
  return <span style={{ color: '#6B6B60' }}>[{label}]</span>;
}

function QuestionItem({ q, num }: { q: GeneratedQuestion; num: number }) {
  // Safe fallback for marks
  const marks = q.marks || 1;

  return (
    <div style={{ marginBottom: 8, display: 'flex', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#6B6B60', minWidth: 20, flexShrink: 0 }}>
        {num}.
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: '#1A1A18', lineHeight: 1.6, marginBottom: 8 }}>{q.text}</p>

        {/* MCQ options - Kept Copilot's nice circle design */}
        {q.options && q.options.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 8 }}>
            {q.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B6B60' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #D4D4CC', flexShrink: 0 }} />
                {opt}
              </div>
            ))}
          </div>
        )}

        {/* True/False - Kept Copilot's nice circle design */}
        {q.type === 'true_false' && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            {['True', 'False'].map(v => (
              <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B6B60' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #D4D4CC' }} />
                {v}
              </div>
            ))}
          </div>
        )}

        {/* Fill blank */}
        {q.type === 'fill_in_blank' && (
          <div style={{ marginBottom: 8, borderBottom: '1px solid #9B9B8E', width: 160, height: 16 }} />
        )}

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <DiffTag d={q.difficulty} />
          <span style={{ fontSize: 11, color: '#9B9B8E' }}>
            [{marks} {marks === 1 ? 'Mark' : 'Marks'}]
          </span>
        </div>
      </div>
    </div>
  );
}

export function QuestionPaper({ paper }: Props) {
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [sec, setSec] = useState('');

  let qNum = 1;

  return (
    <div className="print-paper" style={{ color: '#1A1A18' }}>
      <div>
        
        {/* School name header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Delhi Public School, Sector-4, Bokaro
          </h1>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Subject: {paper.subject}</p>
          {paper.grade && <p style={{ fontSize: 18, fontWeight: 600 }}>Class: {paper.grade}</p>}
        </div>

        {/* Time + Marks row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, marginBottom: 32 }}>
          <span>{paper.duration ? `Time Allowed: ${paper.duration}` : `Time Allowed: 45 minutes`}</span>
          <span>Maximum Marks: {paper.totalMarks}</span>
        </div>

        {/* General instruction */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>All questions are compulsory unless stated otherwise.</p>
        </div>

        {/* Student info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48, fontSize: 15, fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <span>Name:</span>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              style={{
                width: 200, border: 'none', borderBottom: '1px solid #1A1A18',
                background: 'transparent', fontSize: 15, color: '#1A1A18',
                outline: 'none', padding: '0 4px', fontWeight: 500
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <span>Roll Number:</span>
            <input
              type="text" value={roll} onChange={e => setRoll(e.target.value)}
              style={{
                width: 150, border: 'none', borderBottom: '1px solid #1A1A18',
                background: 'transparent', fontSize: 15, color: '#1A1A18',
                outline: 'none', padding: '0 4px', fontWeight: 500
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <span>Class: {paper.grade || ''} Section:</span>
            <input
              type="text" value={sec} onChange={e => setSec(e.target.value)}
              style={{
                width: 100, border: 'none', borderBottom: '1px solid #1A1A18',
                background: 'transparent', fontSize: 15, color: '#1A1A18',
                outline: 'none', padding: '0 4px', fontWeight: 500
              }}
            />
          </div>
        </div>

        {/* Sections */}
        {paper.sections.map((section) => {
          const startNum = qNum;
          qNum += section.questions.length;

          return (
            <div key={section.title} style={{ marginBottom: 40 }}>
              
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                  {section.title}
                </h2>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                  {QUESTION_TYPE_LABELS[section.questionType] || section.questionType}
                </p>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: '#4A4A4A' }}>
                  {section.instruction} Each question carries {section.questions[0]?.marks || 1} mark{(section.questions[0]?.marks || 1) > 1 ? 's' : ''}.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {section.questions.map((q, i) => (
                  <QuestionItem key={q.id || i} q={q} num={startNum + i} />
                ))}
              </div>
            </div>
          );
        })}

        {/* FIX 2: Restored the Answer Key logic that Copilot deleted */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '2px dashed #E8E8E3' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Answer Key:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {paper.sections.flatMap((s, si) =>
              s.questions.map((q, qi) => {
                const num = paper.sections.slice(0, si).reduce((a, sec) => a + sec.questions.length, 0) + qi + 1;
                return (
                  <div key={q.id || num} style={{ fontSize: 14, lineHeight: 1.6, display: 'flex', gap: 12 }}>
                    <span style={{ minWidth: 24, fontWeight: 700, flexShrink: 0 }}>{num}.</span>
                    <span style={{ color: '#4A4A4A', fontWeight: 500 }}>
                      {q.answer || (q.type === 'mcq' && q.options ? `Correct answer: ${q.options[0]}` : 'Refer to textbook for detailed answer.')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FIX 3: Restored the Footer that Copilot deleted */}
        <div style={{ marginTop: 64, textAlign: 'center', opacity: 0.6 }}>
          <p style={{ fontSize: 12 }}>
            Generated by VedaAI · {format(new Date(paper.generatedAt || new Date()), 'dd MMM yyyy, HH:mm')}
          </p>
        </div>

      </div>
    </div>
  );
}