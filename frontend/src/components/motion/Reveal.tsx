import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

/**
 * Scroll reveals for the marketing pages. Every component renders the element
 * it replaces, with the same className, so nothing about layout changes: only
 * opacity and transform animate, once, as the element enters the viewport.
 * Reduced motion is handled by the <MotionConfig reducedMotion="user"> around
 * the page, which drops the transforms.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type Tag = 'div' | 'section' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'li' | 'a' | 'article';

const VIEWPORT = { once: true, amount: 0.3 } as const;

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: Tag;
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  /** Animate on mount instead of on entering the viewport (the hero). */
  immediate?: boolean;
}

/** Fade and rise into place. */
export const Reveal: React.FC<RevealProps> = ({ as = 'div', delay = 0, y = 16, immediate, children, ...rest }) => {
  const Component = motion[as] as React.ElementType;
  const target = { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } };
  return (
    <Component
      initial={{ opacity: 0, y }}
      {...(immediate ? { animate: target } : { whileInView: target, viewport: VIEWPORT })}
      {...rest}
    >
      {children}
    </Component>
  );
};

const wordContainer = (delay: number, stagger: number): Variants => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: stagger } },
});

const wordVariants: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.8, ease: EASE } },
};

/** One masked token: the word rises out of a clipped line box. */
const Masked: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="reveal-mask">
    <motion.span className="reveal-word" variants={wordVariants}>{children}</motion.span>
  </span>
);

/**
 * Splits text children into words and reveals them one after another. Inline
 * elements inside (a coloured <span>, a <br />) stay whole, so their classes
 * and markup are untouched; the text itself stays real text for search and
 * screen readers.
 */
const splitWords = (children: React.ReactNode): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  React.Children.forEach(children, (child, i) => {
    if (typeof child === 'string' || typeof child === 'number') {
      String(child).split(/(\s+)/).forEach((part, j) => {
        if (!part) return;
        out.push(/^\s+$/.test(part) ? part : <Masked key={`${i}-${j}`}>{part}</Masked>);
      });
    } else if (React.isValidElement(child) && child.type === 'br') {
      out.push(child);
    } else if (child !== null && child !== undefined && child !== false) {
      out.push(<Masked key={i}>{child}</Masked>);
    }
  });
  return out;
};

interface RevealTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: Tag;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}

export const RevealText: React.FC<RevealTextProps> = ({ as = 'h2', delay = 0, stagger = 0.04, immediate, children, ...rest }) => {
  const Component = motion[as] as React.ElementType;
  return (
    <Component
      variants={wordContainer(delay, stagger)}
      initial="hidden"
      {...(immediate ? { animate: 'show' } : { whileInView: 'show', viewport: VIEWPORT })}
      {...rest}
    >
      {splitWords(children)}
    </Component>
  );
};

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** A grid or list whose StaggerItem children reveal one after another. */
export const Stagger: React.FC<RevealProps> = ({ as = 'div', children, ...rest }) => {
  const Component = motion[as] as React.ElementType;
  return (
    <Component variants={groupVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} {...rest}>
      {children}
    </Component>
  );
};

// Cards often carry `transition-all` for their hover; left as is, the browser
// would ease every per-frame transform the reveal writes and the motion lags.
// Hover transitions keep colour, border and shadow only.
const HOVER_TRANSITIONS = 'color, background-color, border-color, box-shadow';

export const StaggerItem: React.FC<RevealProps> = ({ as = 'div', children, style, ...rest }) => {
  const Component = motion[as] as React.ElementType;
  return (
    <Component variants={itemVariants} style={{ transitionProperty: HOVER_TRANSITIONS, ...style }} {...rest}>
      {children}
    </Component>
  );
};
