import React from 'react';
import { Mail, Phone, Info, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-main)',
        backgroundColor: '#ffffff',
        padding: '32px 24px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 24,
          }}
        >
          {/* Left Side: Brand Logo & Mission */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, maxWidth: '380px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #eff6ff 100%)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                boxShadow: '0 2px 10px rgba(2, 132, 199, 0.16)',
                padding: 4,
                flexShrink: 0,
              }}
            >
              <img src="/logo_transparent.png" alt="Eventora" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '1.15rem',
                    letterSpacing: '0.03em',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  EVENT
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '1.15rem',
                    letterSpacing: '0.03em',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ORA
                </span>
              </div>
              <div style={{ color: 'var(--ink-muted)', fontSize: '0.82rem', marginTop: 2, fontWeight: 500 }}>
                Crowd Admissions & Event Management
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 6, lineHeight: 1.45 }}>
                High-concurrency ticket dispatching and circular FIFO waitlist engine.
              </div>
            </div>
          </div>

          {/* Right Side: About Us & Direct Contact */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              alignItems: 'flex-start',
              maxWidth: '520px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  fontFamily: 'var(--font-display)',
                }}
              >
                About Us & Contact
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                }}
              >
                <Sparkles size={11} />
                Get in Touch
              </span>
            </div>

            <p
              style={{
                fontSize: '0.8125rem',
                color: '#64748b',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Eventora powers modern keynotes, tech symposiums, and conventions with strict real-time seat allocation and transparent queue dispatch. For inquiries, partnerships, or assistance, reach us directly:
            </p>

            {/* Contact Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 2,
              }}
            >
              <a
                href="mailto:nimmagaddasurya4@gmail.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#047857',
                  backgroundColor: '#ecfdf5',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(5, 150, 105, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d1fae5';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(5, 150, 105, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ecfdf5';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(5, 150, 105, 0.05)';
                }}
              >
                <Mail size={14} style={{ color: '#059669' }} />
                <span>nimmagaddasurya4@gmail.com</span>
              </a>

              <a
                href="tel:9256785566"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#b45309',
                  backgroundColor: '#fffbeb',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(245, 158, 11, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef3c7';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(245, 158, 11, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fffbeb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(245, 158, 11, 0.05)';
                }}
              >
                <Phone size={14} style={{ color: '#d97706' }} />
                <span>+91 92567 85566</span>
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-faint)',
            paddingTop: 16,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--ink-muted)',
            fontSize: '0.75rem',
            gap: 12,
          }}
        >
          <div>© 2026 Eventora Enterprise. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
