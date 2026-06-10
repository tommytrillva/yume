"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTier } from "@/three/useTierDetect";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

/** Scroll to an in-page target, respecting Lenis when active. */
export function scrollToTarget(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el as HTMLElement, { duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Lenis smooth scroll wired into GSAP's ticker so ScrollTrigger and the
 * 3D scene share one timeline (PRD §8). Disabled on reduced-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const tier = useTier();

  useEffect(() => {
    if (tier === "reduced" || tier === "pending") return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [tier]);

  return <>{children}</>;
}
