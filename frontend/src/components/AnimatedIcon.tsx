import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * Small animated icons for the marketing site.
 *
 * Each icon is an inline SVG on a 24px grid (rounded 1.6 strokes, navy line with
 * one blue accent) whose motion is plain CSS (`.mi-*` in index.css). Animations
 * run only while the icon is on screen and stop entirely for people who ask for
 * reduced motion.
 *
 * Iconly Pro: their animations are Lottie JSON, which this component can play
 * instead of the SVG. Download the icon from your Iconly account, put the file in
 * `public/animations/`, and add its path to ICONLY_LOTTIE below, e.g.
 *   chat: '/animations/chat-typing.json',
 * The SVG version is used for any icon without a Lottie file.
 */
export type MotionIconName =
  | 'chat' | 'bell' | 'sparkle' | 'cursor' | 'heart'
  | 'inbox' | 'workflow' | 'reply' | 'contact' | 'plane'
  | 'chart' | 'shield' | 'message-badge';

const ICONLY_LOTTIE: Partial<Record<MotionIconName, string>> = {};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const accent = 'var(--mi-accent, #1463FF)';

const ICONS: Record<MotionIconName, React.ReactNode> = {
  // Speech bubble whose three dots type in turn.
  chat: (
    <>
      <path {...stroke} d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h-.5A2.5 2.5 0 0 1 4 13.5z" />
      <circle className="mi-dot mi-d1" cx="8.5" cy="10" r="1.1" fill={accent} />
      <circle className="mi-dot mi-d2" cx="12" cy="10" r="1.1" fill={accent} />
      <circle className="mi-dot mi-d3" cx="15.5" cy="10" r="1.1" fill={accent} />
    </>
  ),
  // Bell that swings, with an unread badge that pops.
  bell: (
    <>
      <g className="mi-swing">
        <path {...stroke} d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z" />
        <path {...stroke} d="M10 20.5a2 2 0 0 0 4 0" />
      </g>
      <circle className="mi-pop" cx="17.5" cy="6" r="2.6" fill={accent} />
    </>
  ),
  // Four-point sparkle that twinkles, with a smaller one out of phase.
  sparkle: (
    <>
      <path className="mi-twinkle" fill={accent} d="M10.5 2.5c.7 5 2.4 6.7 7.5 7.5-5.1.8-6.8 2.5-7.5 7.5-.7-5-2.4-6.7-7.5-7.5 5.1-.8 6.8-2.5 7.5-7.5z" />
      <path className="mi-twinkle mi-late" {...stroke} d="M18.5 14c.4 2.3 1.2 3.1 3.5 3.5-2.3.4-3.1 1.2-3.5 3.5-.4-2.3-1.2-3.1-3.5-3.5 2.3-.4 3.1-1.2 3.5-3.5z" />
    </>
  ),
  // Pointer that taps, sending out a ripple.
  cursor: (
    <>
      <circle className="mi-ripple" cx="7" cy="6" r="4" fill="none" stroke={accent} strokeWidth="1.5" />
      <path className="mi-tap" {...stroke} fill={accent} fillOpacity={0.12} d="M7 6l3.8 13.5 2.6-5.7 5.7-2.6z" />
    </>
  ),
  // Heart that beats like a "like".
  heart: (
    <path className="mi-beat" fill={accent} stroke={accent} strokeWidth="1.2" strokeLinejoin="round" d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.1c0 5.1-7 9.4-7 9.4z" />
  ),
  // Tray with a message dropping in and an unread dot.
  inbox: (
    <>
      <path className="mi-drop" {...stroke} stroke={accent} d="M8.5 4.5h7v6l-3.5 2.5-3.5-2.5z" />
      <path {...stroke} d="M4 13.5l2-6.5h1.5M20 13.5l-2-6.5h-1.5M4 13.5v4A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-4h-4.5l-1.5 2h-4l-1.5-2z" />
      <circle className="mi-pulse" cx="19" cy="5.5" r="2" fill={accent} />
    </>
  ),
  // Three nodes on a branching path with a dot travelling along it.
  workflow: (
    <>
      <path {...stroke} d="M7 7h4.5a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2H17M13.5 12H17" />
      <rect {...stroke} x="3" y="4.5" width="4.5" height="5" rx="1.5" />
      <rect {...stroke} x="17" y="9.5" width="4" height="5" rx="1.5" stroke={accent} />
      <rect {...stroke} x="17" y="14.5" width="4" height="5" rx="1.5" />
      <circle className="mi-travel" cx="7.5" cy="7" r="1.3" fill={accent} />
    </>
  ),
  // Public comment that turns into a private reply.
  reply: (
    <>
      <path {...stroke} d="M3.5 6.5A2.5 2.5 0 0 1 6 4h8a2.5 2.5 0 0 1 2.5 2.5V10A2.5 2.5 0 0 1 14 12.5H9l-3 2.5v-2.5A2.5 2.5 0 0 1 3.5 10z" />
      <g className="mi-nudge">
        <path {...stroke} stroke={accent} d="M12 19h6.5a2 2 0 0 0 2-2v-2.5" />
        <path {...stroke} stroke={accent} d="M16 16.5l2.5 2.5L16 21.5" />
      </g>
    </>
  ),
  // Contact card that gets checked off.
  contact: (
    <>
      <rect {...stroke} x="3" y="5" width="18" height="14" rx="2.5" />
      <circle {...stroke} cx="8.5" cy="10.5" r="2" />
      <path {...stroke} d="M5.5 16c.5-1.5 1.6-2.3 3-2.3s2.5.8 3 2.3" />
      <path className="mi-draw" {...stroke} stroke={accent} strokeWidth="1.9" d="M14 12l1.8 1.8L19.5 10" pathLength={1} />
    </>
  ),
  // Paper plane that takes off and lands back in place.
  plane: (
    <g className="mi-fly">
      <path {...stroke} d="M20.5 3.5L3.5 10.5l6.5 2.6 2.6 6.4z" />
      <path {...stroke} stroke={accent} d="M20.5 3.5L10 13.1" />
    </g>
  ),
  // Bars that grow one after another under a rising trend.
  chart: (
    <>
      <path {...stroke} d="M4 20.5h16" />
      <rect className="mi-grow mi-g1" x="5" y="13" width="3" height="6" rx="1" fill="currentColor" opacity=".35" />
      <rect className="mi-grow mi-g2" x="10.5" y="10" width="3" height="9" rx="1" fill="currentColor" opacity=".55" />
      <rect className="mi-grow mi-g3" x="16" y="6.5" width="3" height="12.5" rx="1" fill={accent} />
      <path className="mi-draw" {...stroke} stroke={accent} d="M4.5 10.5l5-4 3 2.5 6-5" pathLength={1} />
    </>
  ),
  // Shield whose check is drawn in.
  shield: (
    <>
      <path {...stroke} d="M12 3.5l7 2.6v5.3c0 4.4-2.9 7.6-7 9.1-4.1-1.5-7-4.7-7-9.1V6.1z" />
      <path className="mi-draw" {...stroke} stroke={accent} strokeWidth="1.9" d="M8.8 12.2l2.2 2.2 4.3-4.6" pathLength={1} />
    </>
  ),
  // Message with a notification badge that pops in.
  'message-badge': (
    <>
      <path {...stroke} d="M4 7A2.5 2.5 0 0 1 6.5 4.5H14M20 10v4A2.5 2.5 0 0 1 17.5 16.5H11l-4 3.5v-3.5h-.5A2.5 2.5 0 0 1 4 14z" />
      <path {...stroke} d="M8 9.5h5M8 12.5h7" />
      <circle className="mi-pop" cx="18.5" cy="5.5" r="2.8" fill={accent} />
    </>
  ),
};

interface AnimatedIconProps {
  name: MotionIconName;
  size?: number;
  className?: string;
}

/** A decorative animated icon; hidden from assistive technology. */
export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ name, size = 24, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: '120px' });
  const lottie = ICONLY_LOTTIE[name];

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`mi ${inView ? 'is-playing' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {lottie ? (
        <DotLottieReact src={lottie} loop autoplay={inView && !prefersReducedMotion()} style={{ width: size, height: size }} />
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" focusable="false">{ICONS[name]}</svg>
      )}
    </span>
  );
};

export default AnimatedIcon;
