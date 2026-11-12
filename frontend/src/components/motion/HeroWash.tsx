import React from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/**
 * The soft blue slab behind the product preview. As the page scrolls toward
 * the preview it flattens out (18deg to 6deg) and drifts up a little slower
 * than the content, the "product straightens as you arrive" move. Static for
 * reduced motion. Hidden below md, as before.
 */
export const HeroWash: React.FC = () => {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const progress = useSpring(useTransform(scrollY, [0, 700], [0, 1], { clamp: true }), { stiffness: 120, damping: 30 });
  const tilt = useTransform(progress, (p) => `${18 - p * 12}deg`);
  const shift = useTransform(progress, (p) => `${p * -60}px`);

  return (
    <motion.div
      className="lp-hero-wash hidden md:block"
      aria-hidden="true"
      style={reduce ? undefined : ({ '--wash-tilt': tilt, '--wash-y': shift } as unknown as React.CSSProperties)}
    />
  );
};

export default HeroWash;
