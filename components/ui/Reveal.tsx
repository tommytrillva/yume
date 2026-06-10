"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 0.08, 0.18, 1] as const;

/**
 * Standard in-view reveal: soft fade + gentle y. No bounce, no overshoot
 * (PRD §8). Reduced-motion users get the end state with no animation;
 * no-JS users get content via the global [data-reveal] noscript override.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Headline mask reveal: text rises out of an overflow-hidden clip. */
export function MaskReveal({
  children,
  delay = 0,
  className = "",
  animate,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** When provided, plays on this flag instead of in-view (hero boot). */
  animate?: boolean;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={`block ${className}`}>{children}</span>;
  }

  const hidden = { y: "108%" };
  const shown = { y: "0%" };
  const transition = { duration: 0.9, delay, ease: EASE };

  if (animate !== undefined) {
    return (
      <span className={`block overflow-hidden ${className}`}>
        <motion.span
          data-reveal
          className="block will-change-transform"
          initial={hidden}
          animate={animate ? shown : hidden}
          transition={transition}
        >
          {children}
        </motion.span>
      </span>
    );
  }

  // The clipped inner span never "intersects" (IntersectionObserver honors
  // ancestor clipping), so the in-view trigger must live on the outer clip
  // container and propagate to the child via variants.
  return (
    <motion.span
      className={`block overflow-hidden ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      <motion.span
        data-reveal
        className="block will-change-transform"
        variants={{ hidden, show: shown }}
        transition={transition}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
