import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { scrollToY } from '../../lib/smoothScroll';
import { Database, Workflow, Send, Shield } from 'lucide-react';
import { Reveal, RevealText } from '../../components/motion/Reveal';

const STEP_META = [
  { label: 'Step 1: Secure Integration', tag: 'Meta login' },
  { label: 'Step 2: Intent Engine', tag: 'Flazly AI' },
  { label: 'Step 3: Webhook Pipeline', tag: 'Webhooks' },
];

// Step 3 is laid out in pixels from the stage's measured width, and the SVG
// connectors use the same numbers as the cards, so every line starts at the
// Flazly tile and ends exactly on the left edge of its destination, at any width.
const FLOW_H = 204;
const NODE_SIZE = 56;
const NODE_CY = FLOW_H / 2;
const DEST_H = 52;
const DEST_GAP = 24;
const DESTINATIONS = [
  { label: 'Google Sheets Sync', icon: Database, tone: 'is-mint' },
  { label: 'HubSpot CRM Deal', icon: Workflow, tone: 'is-peach' },
  { label: 'Slack Lead Alert', icon: Send, tone: 'is-lavender' },
].map((d, i) => ({ ...d, cy: DEST_H / 2 + i * (DEST_H + DEST_GAP) }));

const connector = (fromX: number, toX: number, toY: number) => {
  const mid = (fromX + toX) / 2;
  return `M ${fromX} ${NODE_CY} C ${mid} ${NODE_CY}, ${mid} ${toY}, ${toX} ${toY}`;
};

/** Webhook fan-out: Flazly on the left, one connector to each destination. */
const WebhookFlow: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(340);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cards start a little past the middle; the gap left of them carries the curves.
  // Narrow phones get compact cards, so the labels still fit whole.
  const compact = width < 320;
  const destX = Math.round(Math.min(Math.max(width * 0.36, NODE_SIZE + (compact ? 36 : 52)), width - (compact ? 150 : 170)));
  const fromX = NODE_SIZE;

  return (
    <div ref={ref} className="relative w-full max-w-[380px]" style={{ height: FLOW_H }}>
      <svg className="absolute inset-0" width={width} height={FLOW_H} viewBox={`0 0 ${width} ${FLOW_H}`} aria-hidden="true">
        {DESTINATIONS.map((d) => (
          <g key={d.label}>
            <path d={connector(fromX, destX, d.cy)} className="lp-flow-path" />
            <path d={connector(fromX, destX, d.cy)} className="lp-flow-path is-moving" />
            <circle cx={destX} cy={d.cy} r={3.5} className="lp-flow-end" />
          </g>
        ))}
        <circle cx={fromX} cy={NODE_CY} r={3.5} className="lp-flow-end" />
      </svg>

      <div className="absolute left-0 flex flex-col items-center gap-2" style={{ top: NODE_CY - NODE_SIZE / 2 }}>
        <span className="lp-flow-node is-flazly"><img src="/Light Theme.png" alt="Flazly" width={40} height={40} /></span>
        <span className="lp-flow-caption is-accent">Flazly AI</span>
      </div>

      {DESTINATIONS.map(({ label, icon: Icon, tone, cy }) => (
        <div key={label} className={`lp-flow-dest absolute right-0 ${compact ? 'is-compact' : ''}`} style={{ left: destX, top: cy - DEST_H / 2, height: DEST_H }}>
          <span className={`lp-flow-icon ${tone}`}><Icon size={compact ? 13 : 15} /></span>
          <span className={`truncate font-semibold text-[#0E0B3D] ${compact ? 'text-[12px]' : 'text-[13px]'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
};

// Steps share one cell and crossfade, so a change never leaves the card blank.
const stepMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
};

export const IntegrationsFlowCanvas: React.FC<{ activeStep: number }> = ({ activeStep }) => {
  const meta = STEP_META[activeStep] ?? STEP_META[0];

  return (
    <div className="lp-flow-card relative w-full max-w-[440px] text-left">
      <div className="lp-flow-head">
        <span className="flex items-center gap-2">
          <span className="lp-flow-live" aria-hidden="true" />
          {meta.label}
        </span>
        <span className="lp-flow-tag">{meta.tag}</span>
      </div>

      <div className="lp-flow-body">
        <AnimatePresence initial={false}>
          {activeStep === 0 && (
            <motion.div key="step-0" {...stepMotion} className="lp-flow-step flex-col">
              <div className="flex w-full max-w-[320px] items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="lp-flow-node is-instagram">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </span>
                  <span className="lp-flow-caption">Instagram DM</span>
                </div>

                {/* The link between the two, with the handshake sitting on it. */}
                <div className="relative mx-3 -mt-6 flex flex-1 items-center justify-center">
                  <span className="lp-flow-line absolute inset-x-0 top-1/2" aria-hidden="true" />
                  <span className="lp-flow-pill relative">OAuth Handshake</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="lp-flow-node is-flazly"><img src="/Light Theme.png" alt="Flazly" width={40} height={40} /></span>
                  <span className="lp-flow-caption is-accent">Flazly AI</span>
                </div>
              </div>

              <div className="lp-flow-note mt-7">
                <span className="lp-flow-icon is-mint"><Shield size={16} /></span>
                <span className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#0E0B3D]">Meta API Compliance Verified</span>
                  <span className="text-[12px] text-[#6c6f93]">SSL Encrypted token rotation key</span>
                </span>
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div key="step-1" {...stepMotion} className="lp-flow-step">
              <div className="w-full max-w-[340px] space-y-3">
              <div className="flex items-end gap-2.5">
                <span className="lp-flow-avatar">US</span>
                <p className="lp-flow-bubble is-in">"Can I buy the hoodie? Do you ship to Germany?"</p>
              </div>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-[#E8EBF4]" />
                <span className="lp-flow-pill flex items-center gap-1.5">
                  <span className="lp-flow-live is-accent" aria-hidden="true" />
                  Flazly NLP Processing
                </span>
                <span className="h-px flex-1 bg-[#E8EBF4]" />
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="lp-flow-bubble is-out">"Yes! Shipping to Germany is €4.99. What color would you like?"</p>
                <div className="flex gap-1.5">
                  <span className="lp-flow-chip">✓ Intent: Shipping</span>
                  <span className="lp-flow-chip">✓ Location: Germany</span>
                </div>
              </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div key="step-2" {...stepMotion} className="lp-flow-step">
              <WebhookFlow />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="lp-flow-foot">
        <span>Pipeline Activity Monitor</span>
        <span>Secure connection active</span>
      </div>
    </div>
  );
};

/** True from 1024px up: the width where the steps pin and follow the scroll. */
const useIsDesktop = () => {
  const query = '(min-width: 1024px)';
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return matches;
};

// Below this top offset the pinned grid sits under the fixed navbar.
const PIN_TOP = 96;

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });

  // On desktop the steps pin while the page scrolls past a taller track, and
  // scroll position picks the step. Phones, tablets and reduced motion keep
  // the original behaviour: tap a step, or let it rotate on its own.
  const reduce = useReducedMotion();
  const isPinned = useIsDesktop() && !reduce;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: [`start ${PIN_TOP}px`, 'end end'] });

  // A step changes only once the scroll is clearly past a boundary, so a small
  // back-and-forth right on the line does not flicker between two steps.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!isPinned) return;
    setActiveStep((current) => {
      const raw = v * 3;
      const BUFFER = 0.12;
      if (raw > current + 1 + BUFFER || raw < current - BUFFER) {
        return Math.min(2, Math.max(0, Math.floor(raw)));
      }
      return current;
    });
  });

  // A step clicked while pinned scrolls to the middle of its segment, so the
  // page and the highlighted step agree.
  const goToStep = (idx: number) => {
    const track = trackRef.current;
    if (!isPinned || !track) {
      setActiveStep(idx);
      setAutoRotate(false);
      return;
    }
    const top = track.getBoundingClientRect().top + window.scrollY;
    const start = top - PIN_TOP;
    const end = top + track.offsetHeight - window.innerHeight;
    scrollToY(start + ((idx + 0.5) / 3) * (end - start));
  };

  useEffect(() => {
    if (isPinned || !autoRotate || !isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoRotate, isInView, isPinned]);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-28 border-t border-zinc-200/80 dark:border-white/5 relative overflow-x-clip bg-gradient-to-b from-[#fafafa] via-zinc-100/50 to-[#fafafa] dark:from-[#09090b] dark:via-[#121826]/30 dark:to-[#09090b]">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* The scroll track: tall only while pinned, so each step gets its share of scroll. */}
        <div ref={trackRef} className={isPinned ? 'h-[230vh]' : undefined}>
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${isPinned ? 'sticky' : ''}`} style={isPinned ? { top: PIN_TOP } : undefined}>
          {/* Left Column: 3 Steps */}
          <div className="flex flex-col text-left">
            <Reveal as="span" y={8} className="lp-eyebrow is-violet">How It Works</Reveal>
            <RevealText as="h2" className="lp-title text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 mb-6">
              3 Steps to Automated Lead Capture
            </RevealText>
            <Reveal as="p" delay={0.15} className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium mb-12">
              Turn your Instagram profile into a 24/7 lead generation engine in minutes.
            </Reveal>

            <div className="relative space-y-6" role="tablist" aria-label="How Flazly Works Steps">
              {/* Progress rail beside the steps while they follow the scroll. */}
              {isPinned && (
                <span className="absolute -left-4 top-2 bottom-2 w-[2px] rounded-full bg-zinc-200/80" aria-hidden="true">
                  <motion.span className="absolute inset-x-0 top-0 block h-full origin-top rounded-full bg-[#1463FF]" style={{ scaleY: scrollYProgress }} />
                </span>
              )}
              {[
                {
                  step: "01",
                  title: "Connect Instagram Business Account",
                  desc: "Connect your Instagram profile securely with one-click Meta OAuth login. No password sharing required."
                },
                {
                  step: "02",
                  title: "Flazly AI Responds & Qualifies Leads Automatically",
                  desc: "Flazly instantly greets prospects, answers FAQs using your knowledge docs, and qualifies their intent."
                },
                {
                  step: "03",
                  title: "Capture Lead Details And Convert More Customers",
                  desc: "Automatically extract emails, phone numbers, and interests, syncing them immediately to your lead lists."
                }
              ].map((step, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={activeStep === idx}
                  onClick={() => goToStep(idx)}
                  className={`flex gap-6 p-4 rounded-2xl cursor-pointer transition-all duration-300 border text-left w-full ${
                    activeStep === idx
                      ? "bg-white dark:bg-[#121826]/40 border-zinc-200/80 dark:border-white/5 shadow-sm"
                      : "border-transparent opacity-65 hover:opacity-100"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold tabular-nums shrink-0 transition-all duration-300 ${
                    activeStep === idx
                      ? "bg-[#4F39F6] text-[#FFFFFF] shadow-md shadow-[#4F39F6]/20"
                      : "bg-[#3B82F6]/10 text-[#38BDF8]"
                  }`}>
                    {step.step}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold mb-1 transition-colors duration-300 ${
                      activeStep === idx ? "text-[#4F39F6] dark:text-[#818CF8]" : "text-zinc-900 dark:text-white"
                    }`}>{step.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Platform Pipeline */}
          <div className="flex flex-col items-center justify-center">
            <IntegrationsFlowCanvas activeStep={activeStep} />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-6">
              Interactive Platform Pipeline
            </span>
          </div>
        </div>

        </div>

        {/* Real-time captured entity cards */}
        <div className="bg-zinc-100/50 dark:bg-[#121826]/20 border border-zinc-200/80 dark:border-white/5 p-8 rounded-3xl max-w-4xl mx-auto mt-20">
          <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest text-center mb-8">
            What Flazly AI Captures In Real-Time
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Email Collected", detail: "alex@example.com", badge: "Contact" },
              { label: "Phone Captured", detail: "+1 (555) 019-2834", badge: "Contact" },
              { label: "Product Interest", detail: "Standard Hoodie (L)", badge: "Intent" },
              { label: "Consultation Request", detail: "Prefers Morning slots", badge: "Action" },
              { label: "Purchase Intent", detail: "Ready to order", badge: "Intent" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-[#121826]/60 border border-zinc-200/80 dark:border-white/5 p-4 rounded-2xl text-left shadow-sm">
                <span className="text-[8px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
                <span className="text-xs font-bold text-zinc-800 dark:text-white block mt-3 mb-1">{item.label}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
