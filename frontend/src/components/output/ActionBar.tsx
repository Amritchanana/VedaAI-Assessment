'use client';
import { RefreshCw, Download, Loader2 } from 'lucide-react';
import type { GeneratedPaper } from '@/types';

interface Props {
  paper: GeneratedPaper;
  onRegenerate: () => void;
  regenerating: boolean;
}

export function ActionBar({ paper, onRegenerate, regenerating }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="no-print sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-white truncate">{paper.title}</h2>
          <p className="text-slate-400 text-xs">
            {paper.totalQuestions} questions · {paper.totalMarks} marks
            {paper.duration ? ` · ${paper.duration}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="btn-secondary text-sm gap-1.5 py-2 px-3"
          >
            {regenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Regenerate
          </button>
          <button onClick={handlePrint} className="btn-primary text-sm py-2 px-4 gap-1.5">
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
