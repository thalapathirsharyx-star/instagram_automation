import React, { useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius of the element, so the clip keeps its rounded shape. */
  radius?: number;
  /** How far in the clip starts, as a % of each side. */
  inset?: number;
  /** Starting scale. */
  scale?: number;
  /** Starting vertical offset in px (the element rises into place). */
  rise?: number;
}

/**
 * A block that opens up as it scrolls in: the clip starts slightly inset
 * (rounded, like a window being drawn open) and the block settles from a small
 * scale and offset to its real size. Tied to scroll position, eased by a
 * spring, finished by the time the block's top reaches 55% of the viewport.
 * It only ever moves forward: scrolling back up leaves it open, so a block near
 * the fold does not shrink and reopen as the page moves up and down.
 * Static for reduced motion.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({ radius = 40, inset = 5, scale = 0.96, rise = 0, children, style, ...rest }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  // The furthest the block has got; progress never runs backwards.
  const reached = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > reached.get()) reached.set(v);
  });
  const p = useSpring(reached, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const clipPath = useTransform(p, (v) => {
    // At rest, no clip at all, so the element's own (responsive) radius shows.
    if (v >= 0.999) return 'none';
    const side = (1 - v) * inset;
    return `inset(${side}% ${side}% ${side}% ${side}% round ${radius}px)`;
  });
  const scaleValue = useTransform(p, [0, 1], [scale, 1]);
  const y = useTransform(p, [0, 1], [rise, 0]);

  return (
    <motion.div
      ref={ref}
      style={reduce ? style : { ...style, clipPath, scale: scaleValue, y }}
      {...(rest as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
