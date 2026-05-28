'use client';
import { Bricolage_Grotesque } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const NAV = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/groups', label: 'My Groups', icon: 'groups' },
  { href: '/assignments', label: 'Assignments', icon: 'assignments', badge: true },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: 'toolkit' },
  { href: '/library', label: 'My Library', icon: 'library' },
];
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700'] });
function NavIcon({ type }: { type: string }) {
  const cls = 'w-[16px] h-[16px] flex-shrink-0';

  if (type === 'home') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 9.5V20h14V9.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (type === 'groups') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 11a4 4 0 100-8 4 4 0 000 8z"/>
        <path d="M8 13a4 4 0 100-8 4 4 0 000 8z"/>
        <path d="M2 21a6 6 0 016-6h8a6 6 0 016 6"/>
      </svg>
    );
  }

  if (type === 'assignments') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="3" width="14" height="18" rx="2"/>
        <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round"/>
      </svg>
    );
  }

  if (type === 'toolkit') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a3 3 0 10-4.2 4.2L4 17v3h3l6.5-6.5a3 3 0 004.2-4.2z"/>
      </svg>
    );
  }

  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 4v16M10 4v16M14 4l4 16" strokeLinecap="round"/>
    </svg>
  );
}

interface Props {
  assignmentCount?: number;
}

export function Sidebar({ assignmentCount = 10 }: Props) {
  const path = usePathname();

  const isActive = (href: string) =>
    href === '/assignments'
      ? path.startsWith('/assignments') || path.startsWith('/result')
      : href === '/'
      ? path === '/'
      : path.startsWith(href);

  return (
    <aside
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        bottom: 12,
        width: 292,
        background: '#F7F7F5',
        border: '1px solid #E6E6E2',
        borderRadius: 22,
        boxShadow: '0 4px 80px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 86,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          borderBottom: '1px solid #ECECE8',
        }}
      >
        {/* Corrected Image Component */}
        <Image
          src="/logo3.png"
          alt="VedaAI Logo"
          width={46}
          height={46}
          style={{
            borderRadius: 14,
            flexShrink: 0,
            objectFit: 'contain',
          }}
        />

        <span
          className={bricolage.className} /* This applies the Bricolage Grotesque font! */
          style={{
            fontSize: 24, 
            fontWeight: 800, 
            color: '#1A1A18',
            letterSpacing: '-0.04em', 
            marginTop: 2, 
          }}
        >
          VedaAI
        </span>
      </div>

      {/* CREATE BUTTON */}
      <div style={{ padding: '18px 16px 14px' }}>
        <Link
          href="/assignments/create"
          style={{
            height: 52,
            borderRadius: 999,
            background: '#212125',
            border: '2.5px solid #E56B2F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 0 0 2px rgba(229,107,47,0.14)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5L9.2 5.2L13 6.4L9.2 7.6L8 11.3L6.8 7.6L3 6.4L6.8 5.2L8 1.5Z"
              fill="#FF7A33"
            />
            <path
              d="M12.5 10.5L13 12L14.5 12.5L13 13L12.5 14.5L12 13L10.5 12.5L12 12L12.5 10.5Z"
              fill="#FF7A33"
            />
          </svg>

          Create Assignment
        </Link>
      </div>

      {/* NAV */}
      <nav
        style={{
          flex: 1,
          padding: '4px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {NAV.map(({ href, label, icon, badge }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              style={{
                height: 44,
                padding: '0 14px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                background: active ? '#ECECE8' : 'transparent',
                color: active ? '#1D1D1B' : '#6D6D66',
                fontSize: 14,
                fontWeight: active ? 500 : 400,
              }}
            >
              <NavIcon type={icon} />

              <span style={{ flex: 1 }}>{label}</span>

              {badge && assignmentCount > 0 && (
                <div
                  style={{
                    minWidth: 28,
                    height: 24,
                    borderRadius: 999,
                    background: '#D85A09',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {assignmentCount}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div
        style={{
          borderTop: '1px solid #ECECE8',
          padding: 14,
        }}
      >
        {/* SETTINGS */}
        <div
          style={{
            height: 42,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#6D6D66',
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          ⚙️ Settings
        </div>

        {/* SCHOOL CARD */}
        <div
          style={{
            background: '#F1F1EE',
            border: '1px solid #E4E4DF',
            borderRadius: 16,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
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

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#1D1D1B',
                marginBottom: 2,
              }}
            >
              Delhi Public School
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#8B8B84',
              }}
            >
              Bokaro Steel City
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}