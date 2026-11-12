import type Lenis from 'lenis';

/**
 * The page's Lenis instance while a marketing page has smooth scrolling on,
 * otherwise null (the app, reduced motion, before mount). Scrolling helpers go
 * through Lenis when it runs, so a jump does not fight its inertia, and fall
 * back to native scrolling everywhere else.
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const scrollToElement = (el: HTMLElement) => {
  if (instance) {
    // The sections' own scroll-margin-top (index.css) leaves room for the fixed
    // navbar; Lenis honours it, exactly as scrollIntoView does.
    instance.scrollTo(el);
  } else {
    el.scrollIntoView({ block: 'start' });
  }
};

export const scrollToTop = () => {
  if (instance) {
    instance.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
};

/** Scroll to an absolute page offset, smoothly when Lenis is running. */
export const scrollToY = (y: number) => {
  if (instance) {
    instance.scrollTo(y);
  } else {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};
