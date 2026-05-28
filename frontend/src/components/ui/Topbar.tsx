'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  breadcrumb?: string;
  title?: string;
  showBack?: boolean;
  showProgress?: boolean;
  progressValue?: number; // 0-100
}

export function Topbar({ breadcrumb, title, showBack = false, showProgress = false, progressValue = 0 }: Props) {
  const router = useRouter();

  return (
    <div style={{
      position: 'fixed', top: 13, right: 7, left: 320, zIndex: 10, borderRadius: 18,
      background: '#fff', borderBottom: '1px solid #EBEBEB',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Main bar */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px',
      }}>
        {/* Left: back arrow + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {showBack && (
            <button onClick={() => router.back()} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6,
              color: '#6B6B60',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          {breadcrumb && (
            <span style={{ fontSize: 13, color: '#6B6B60', fontWeight: 400 }}>{breadcrumb}</span>
          )}
          {title && breadcrumb && (
            <span style={{ color: '#D4D4CC', fontSize: 13 }}>/</span>
          )}
          {title && (
            <span style={{ fontSize: 13, color: '#1A1A18', fontWeight: 500 }}>{title}</span>
          )}
        </div>

        {/* Right: bell + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Bell */}
          <button style={{
            position: 'relative', background: 'none', border: 'none',
            cursor: 'pointer', padding: 6, borderRadius: 8,
            display: 'flex', alignItems: 'center', color: '#6B6B60',
          }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8.5 2a5 5 0 00-5 5v2.5L2 11h13l-1.5-1.5V7a5 5 0 00-5-5z"/>
              <path d="M7 13a1.5 1.5 0 003 0" strokeLinecap="round"/>
            </svg>
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 7, height: 7, background: '#D4520A',
              borderRadius: '50%', border: '1.5px solid #fff',
            }} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: '#EBEBEB' }} />

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image
              src="/Avatar.png"
              alt="User Avatar"
              width={44}
              height={44}
              style={{
                borderRadius: '50%',
                objectFit: 'cover', /* Ensures the image doesn't stretch weirdly */
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18' }}>John Doe</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9B9B8E" strokeWidth="1.5">
              <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Progress bar row — shown on create page */}
      {showProgress && (
        <div style={{
          padding: '8px 20px 10px',
          background: '#FAFAF8',
          borderTop: '1px solid #F0F0EC',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Green dot + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>Create Assignment</span>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#9B9B8E', marginTop: 2, marginLeft: 14 }}>
            Set up a new assignment for your students
          </p>
          {/* Step progress bar */}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              flex: 1, height: 4, background: '#E8E8E3', borderRadius: 99, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: '#1A1A18', borderRadius: 99,
                width: `${progressValue}%`, transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{
              flex: 1, height: 4, background: '#E8E8E3', borderRadius: 99,
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
