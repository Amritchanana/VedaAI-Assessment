'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { QuestionPaper } from '@/components/output/QuestionPaper';
import { getAssignment, regenerateAssignment } from '@/lib/api';
import { useJobSocket } from '@/hooks/useJobSocket';
import { useAssignmentStore } from '@/store/assignment.store';
import type { GeneratedPaper } from '@/types';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const { generatedPaper } = useAssignmentStore();
  useJobSocket(pollingId);

  useEffect(() => {
    if (generatedPaper?.assignmentId === id) { setPaper(generatedPaper); setLoading(false); }
  }, [generatedPaper, id]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssignment(id);
        if (data.status === 'completed' && data.result) { setPaper(data.result); setLoading(false); }
        else if (data.status === 'failed') { setError(data.error || 'Failed'); setLoading(false); }
        else {
          setPollingId(id);
          const iv = setInterval(async () => {
            const u = await getAssignment(id);
            if (u.status === 'completed') { setPaper(u.result); setLoading(false); clearInterval(iv); }
            else if (u.status === 'failed') { setError(u.error || 'Failed'); setLoading(false); clearInterval(iv); }
          }, 3000);
          return () => clearInterval(iv);
        }
      } catch (e: any) { setError(e.message); setLoading(false); }
    }
    load();
  }, [id]);

  async function handleRegenerate() {
    setRegenerating(true); setLoading(true); setPaper(null);
    try {
      await regenerateAssignment(id);
      setPollingId(id);
      const iv = setInterval(async () => {
        const d = await getAssignment(id);
        if (d.status === 'completed') { setPaper(d.result); setLoading(false); setRegenerating(false); clearInterval(iv); }
        else if (d.status === 'failed') { setError(d.error || 'Failed'); setLoading(false); setRegenerating(false); clearInterval(iv); }
      }, 3000);
    } catch (e: any) { setError(e.message); setLoading(false); setRegenerating(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-['DM_Sans',sans-serif]">
      <Sidebar />
      <Topbar showBack breadcrumb="Create New" />

      {/* 1. Fixed the main wrapper spacing so it clears the Topbar and Sidebar */}
      <main className="pb-24 md:ml-[220px] px-6 md:px-10 pt-28">

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
            <div style={{ width: 28, height: 28, border: '2px solid #E8E8E3', borderTopColor: '#1A1A18', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#9B9B8E' }}>{regenerating ? 'Regenerating paper...' : 'Loading question paper...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
            <p style={{ color: '#EF4444', fontSize: 14, fontWeight: 500 }}>{error}</p>
            <Link href="/assignments/create" style={{
              padding: '10px 24px', background: '#1A1A18', color: '#fff',
              borderRadius: 30, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              Create New Assignment
            </Link>
          </div>
        )}

        {/* 2. Separated Dark Banner & White Paper Cards */}
        {paper && !loading && (
          <div style={{ 
            maxWidth: 1000, 
            margin: '0 auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' /* Creates the gap between the dark and white cards */
          }}>
            
            {/* Card 1: Dark Header Area */}
            <div className="no-print" style={{ 
              background: '#2A2A2A', 
              borderRadius: 24, /* Fully rounded on all sides */
              padding: '28px 40px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <p style={{ fontSize: '15px', lineHeight: 1.5, color: '#FFFFFF', margin: 0, fontWeight: 500, maxWidth: 850 }}>
                Certainly, John! Here is customized <strong>Question Paper for your {paper.subject && paper.subject} {paper.grade && paper.grade} class on the NCERT chapters:</strong>
              </p>
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button onClick={() => window.print()} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 30,
                  background: '#fff', color: '#1A1A18',
                  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <svg width="15" height="15" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 9.5H1.5a1 1 0 01-1-1v-4a1 1 0 011-1h10a1 1 0 011 1v4a1 1 0 01-1 1h-1M3.5 6.5h6M4 9h5v3H4z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Download as PDF
                </button>

                <button onClick={handleRegenerate} disabled={regenerating} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 30,
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  background: 'transparent', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {regenerating ? (
                    <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 6A4.5 4.5 0 112.1 3.6M1.5 1.5v3h3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  Regenerate
                </button>
              </div>
            </div>

            {/* Card 2: White Paper Area */}
            <div style={{ 
              background: '#fff', 
              borderRadius: 24, /* Fully rounded on all sides */
              padding: '48px', 
              minHeight: 800,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <QuestionPaper paper={paper} />
            </div>

          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}