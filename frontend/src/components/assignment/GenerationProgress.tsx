'use client';
import { useAssignmentStore } from '@/store/assignment.store';
import { AlertCircle, Zap } from 'lucide-react';

const STEPS = [
  { label: 'Checking cache', threshold: 0 },
  { label: 'Building prompt', threshold: 15 },
  { label: 'Sending to AI', threshold: 25 },
  { label: 'Generating questions', threshold: 40 },
  { label: 'Parsing response', threshold: 65 },
  { label: 'Structuring sections', threshold: 80 },
  { label: 'Saving result', threshold: 90 },
  { label: 'Done!', threshold: 99 },
];

export function GenerationProgress() {
  const { jobProgress, jobMessage, jobStatus } = useAssignmentStore();

  if (jobStatus === 'failed') {
    return (
      <div className="card p-8 max-w-md w-full mx-auto">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-[#1A1A18] mb-1 text-[14px]">Generation Failed</h3>
            <p className="text-[12px] text-[#9B9B8E] mb-4">{jobMessage}</p>
            <button onClick={() => window.location.reload()} className="btn-outline text-[12px]">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 max-w-md w-full mx-auto fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#1A1A18] flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A1A18] text-[14px]">Generating Question Paper</h3>
          <p className="text-[12px] text-[#9B9B8E]">This usually takes 15-30 seconds</p>
        </div>
      </div>
      <div className="mb-5">
        <div className="flex justify-between text-[11px] text-[#9B9B8E] mb-1.5">
          <span>{jobMessage || 'Starting...'}</span>
          <span>{jobProgress}%</span>
        </div>
        <div className="h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
          <div className="h-full progress-shimmer rounded-full transition-all duration-700"
            style={{ width: `${Math.max(5, jobProgress)}%` }} />
        </div>
      </div>
      <div className="space-y-2">
        {STEPS.map((step) => {
          const done = jobProgress > step.threshold + 10;
          const active = jobProgress >= step.threshold && !done;
          return (
            <div key={step.label} className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${done ? 'bg-[#1A1A18]' : active ? 'border-2 border-[#1A1A18]' : 'border border-[#E8E8E3]'}`}>
                {done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 5l2.5 2.5L8 3" />
                  </svg>
                )}
                {active && <div className="w-1.5 h-1.5 bg-[#1A1A18] rounded-full animate-pulse" />}
              </div>
              <span className={`text-[12px] transition-colors
                ${done ? 'text-[#9B9B8E] line-through' : active ? 'text-[#1A1A18] font-medium' : 'text-[#D4D4CC]'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
