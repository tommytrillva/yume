/**
 * Mutable singleton driven by GSAP ScrollTrigger timelines and read every
 * frame by the Dream Core. Keeping it out of React state avoids re-renders
 * at scroll frequency — GSAP and R3F share this one source of truth.
 */
export const coreState = {
  /** 0 = dormant glass, 1 = fully lit (boot) */
  activation: 0,
  /** 0 = solid monolith, 1 = separated into 5 layers */
  openness: 0,
  /** world-space x offset of the core group */
  x: 0,
  /** world-space y offset of the core group */
  y: 0,
  /** uniform scale of the core group */
  scale: 1,
  /** opacity of the fixed canvas layer (applied to the DOM wrapper) */
  opacity: 1,
};
