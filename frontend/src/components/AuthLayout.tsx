import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, BarChart3 } from 'lucide-react';

/** Instagram's camera glyph, drawn inline: lucide no longer ships brand icons. */
const InstagramGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

// What happens to a message, as one thread. These are real steps in order,
// so they sit on a rail; each actor keeps its tone (customer, Flazly, score).
const steps = [
  {
    tone: 'tone-peach',
    icon: <InstagramGlyph size={15} />,
    title: 'Someone sends a DM',
    note: 'A customer asks about a product',
    body: <p className="mt-2 w-fit rounded-[12px] rounded-tl-[4px] bg-porcelain px-3 py-2 text-[14px] text-ink">Hi! Do you have this in stock?</p>,
  },
  {
    tone: 'tone-lavender',
    icon: <Sparkles size={15} />,
    title: 'Flazly answers',
    note: 'From your brain base and catalogue',
    body: <p className="mt-2 w-fit rounded-[12px] rounded-tl-[4px] bg-viridian-tint px-3 py-2 text-[14px] text-ink">Yes, it's in stock in all sizes. Want the link?</p>,
  },
  {
    tone: 'tone-mint',
    icon: <BarChart3 size={15} />,
    title: 'The lead is scored',
    note: 'Ready for you to pick up',
    body: <span className="chip tone-mint mt-2">High intent</span>,
  },
];

// Tightens the rhythm on short screens (a 720px laptop) so the form never
// falls below the fold.
const SHORT = '[@media(max-height:760px)]:';

/**
 * The frame shared by sign-in and sign-up: the product story on the left
 * (wide screens only) and the page's own card on the right.
 */
const AuthLayout: React.FC<{ title: React.ReactNode; description: React.ReactNode; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="auth-surface min-h-screen w-full overflow-x-hidden bg-porcelain">
    <div className={`mx-auto grid min-h-screen w-full max-w-[1120px] items-center gap-10 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:px-8 ${SHORT}py-3`}>

      {/* Product story. Hidden on small screens, where the form is the page. */}
      <section className="hidden max-w-[520px] lg:block" aria-label="How Flazly works">
        <Link to="/" className={`mb-8 flex w-fit items-center gap-2.5 ${SHORT}mb-5`}>
          <img src="/Light Theme.png" alt="" className="h-9 w-9 object-contain" />
          <span className="text-[24px] font-bold tracking-[-0.02em] text-ink">Flazly</span>
        </Link>

        <h2 className="text-[40px] font-bold leading-[1.1] tracking-[-0.03em] text-ink">{title}</h2>
        <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft">{description}</p>

        <ol className={`surface mt-8 p-5 ${SHORT}mt-5 ${SHORT}p-4`}>
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-10 w-px bg-hairline-strong" />
              )}
              <span className={`icon-tile ${step.tone} relative z-10 h-9 w-9 rounded-full`}>{step.icon}</span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[15px] font-semibold text-ink">{step.title}</p>
                <p className="text-[13px] text-ink-soft">{step.note}</p>
                <div aria-hidden="true">{step.body}</div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 flex items-center gap-2 text-[13px] text-ink-soft">
          <Shield size={14} /> Built on the Meta Graph API
        </p>
      </section>

      <div className="mx-auto w-full max-w-[420px]">{children}</div>
    </div>
  </div>
);

export default AuthLayout;
