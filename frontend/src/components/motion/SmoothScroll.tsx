import React, { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { setLenis } from '../../lib/smoothScroll';

/**
 * Lenis inertia scrolling is switched off: on Windows with a notched mouse
 * wheel it read as jitter when changing direction. The page scrolls natively
 * and every scroll animation still runs (they read native scroll position).
 * Set to true to try it again.
 */
const SMOOTH_SCROLL_ENABLED = false;

/**
 * Inertia scrolling for the marketing pages only (the app keeps native
 * scrolling). Off for people who ask for reduced motion, and touch scrolling
 * stays native so phones feel like phones. Inner scrolling panels (the product
 * preview's lists) are handled by allowNestedScroll: they scroll while they
 * can, and Lenis takes over at their ends, so the two never fight.
 */
export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (!SMOOTH_SCROLL_ENABLED) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      autoRaf: true,
      allowNestedScroll: true,
    });
    setLenis(lenis);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
