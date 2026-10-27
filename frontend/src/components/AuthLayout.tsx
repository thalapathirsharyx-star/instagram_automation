import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, Sparkles } from 'lucide-react';

/** Instagram's camera glyph, drawn inline: lucide no longer ships brand icons. */
const InstagramGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

// What Flazly actually does, in the words the landing page uses.
const BENEFITS = [
  'Replies to DMs, comments and story replies in seconds',
  'Scores every lead and captures contact details',
  'Hand any conversation to your team in one click',
];

const Logo: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({ className = '', size = 'md' }) => (
  <Link to="/" className={`auth-logo ${size === 'sm' ? 'is-small' : ''} ${className}`} aria-label="Flazly home">
    <span className="auth-logo-mark">
      <img src="/Light Theme.png" alt="" />
    </span>
    <span className="auth-logo-word">Flazly</span>
  </Link>
);

interface AuthLayoutProps {
  /** Headline on the brand panel. */
  title: React.ReactNode;
  /** One supporting sentence under it. */
  description: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The frame every signed-out account page shares: a cobalt brand panel on the
 * left (wide screens) and the page's form, centred, on the right. On narrow
 * screens the brand panel collapses into a compact header above the form.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children }) => (
  <div className="auth-surface auth-split">
    <aside className="auth-brand" aria-label="About Flazly">
      {/* Geometry: two rings, a soft disc and a faint dot grid, all decorative. */}
      <div className="auth-brand-art" aria-hidden="true">
        <span className="auth-ring is-large" />
        <span className="auth-ring is-small" />
        <span className="auth-disc" />
        <span className="auth-dots" />
      </div>

      <div className="auth-brand-inner">
        <Logo />

        <div className="auth-brand-copy">
          <span className="auth-brand-badge">
            <Sparkles size={14} aria-hidden="true" />
            Instagram sales agent &amp; CRM
          </span>
          <h2 className="auth-brand-title">{title}</h2>
          <p className="auth-brand-text">{description}</p>

          {/* A compact picture of one conversation: message, reply, lead. */}
          <div className="auth-preview" aria-hidden="true">
            <div className="auth-preview-row">
              <span className="auth-preview-avatar"><InstagramGlyph size={14} /></span>
              <div className="min-w-0">
                <p className="auth-preview-name">maya.designs <span>· DM</span></p>
                <p className="auth-bubble is-in">Hi! Is the linen set still in stock?</p>
              </div>
            </div>
            <div className="auth-preview-row is-out">
              <p className="auth-bubble is-out">Yes, every size. Want me to send the link?</p>
            </div>
            <div className="auth-preview-foot">
              <span className="auth-chip is-go"><Check size={12} strokeWidth={3} /> Lead captured</span>
              <span className="auth-chip">High intent</span>
              <span className="auth-preview-time">Replied in 2s</span>
            </div>
          </div>
        </div>

        <ul className="auth-benefits">
          {BENEFITS.map((benefit) => (
            <li key={benefit}>
              <span className="auth-benefit-tick"><Check size={12} strokeWidth={3} aria-hidden="true" /></span>
              {benefit}
            </li>
          ))}
          <li className="auth-benefits-meta">
            <ShieldCheck size={15} aria-hidden="true" />
            Built on the official Meta Graph API
          </li>
        </ul>
      </div>
    </aside>

    <main className="auth-main">
      {/* Narrow screens: the brand panel becomes this header. */}
      <header className="auth-mobile-head">
        <Logo size="sm" />
      </header>

      <div className="auth-topbar">
        <Link to="/" className="auth-back">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to home
        </Link>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-enter w-full">{children}</div>
      </div>

      <footer className="auth-foot">
        <span>© {new Date().getFullYear()} Flazly</span>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </footer>
    </main>
  </div>
);

/** Page heading for the form side: title and one line of context. */
export const AuthHeading: React.FC<{ title: string; subtitle: React.ReactNode }> = ({ title, subtitle }) => (
  <div className="mb-7">
    <h1 className="auth-title">{title}</h1>
    <p className="auth-subtitle">{subtitle}</p>
  </div>
);

export default AuthLayout;
