import React, { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { setLenis } from '../../lib/smoothScroll';

/**
 * Inertia scrolling for the marketing pages only (the app keeps native
 * scrolling). Off for people who ask for reduced motion, and touch scrolling
 * stays native so phones feel like phones. Regions that scroll on their own
 * opt out with `data-lenis-prevent`.
 */
export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      autoRaf: true,
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
