"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hero, microLabels, footer } from "@/content/copy";
import { activateCore } from "@/lib/choreography";
import { useTier } from "@/three/useTierDetect";
import { CtaButton } from "@/components/ui/CtaButton";
import { MaskReveal } from "@/components/ui/Reveal";
import { SystemLabel } from "@/components/ui/SystemLabel";

const EASE = [0.22, 0.08, 0.18, 1] as const;

/**
 * Boot screen hero (PRD §7.1): mono system text types in, the core powers
 * on, the headline mask-reveals. Under ~2s, skippable on scroll/keypress.
 * SSR renders the full end-state so no-JS and crawlers see everything.
 */
export function BootHero() {
  const tier = useTier();
  const reduce = useReducedMotion();

  // SSR/no-JS default: fully booted, all text visible.
  const [booted, setBooted] = useState(true);
  const [line1, setLine1] = useState(hero.systemText);
  const [line2, setLine2] = useState(hero.loadingText);
  const [posterGone, setPosterGone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const onSceneReady = () => setPosterGone(true);
    window.addEventListener("yume:scene-ready", onSceneReady);
    return () => window.removeEventListener("yume:scene-ready", onSceneReady);
  }, []);

  useEffect(() => {
    if (tier === "pending" || started.current) return;
    started.current = true;

    if (tier === "reduced" || tier === "none" || reduce) {
      activateCore(true);
      return; // lit end-state immediately, no flicker (PRD §7.1 AC)
    }

    // Run the boot: clear, type, resolve. Total < 2s.
    setBooted(false);
    setLine1("");
    setLine2("");

    const timers: ReturnType<typeof setTimeout>[] = [];
    let intervals: ReturnType<typeof setInterval>[] = [];
    let finished = false;

    const typeLine = (
      text: string,
      set: (s: string) => void,
      startAt: number,
      speed = 26,
    ) => {
      timers.push(
        setTimeout(() => {
          let i = 0;
          const iv = setInterval(() => {
            i += 1;
            set(text.slice(0, i));
            if (i >= text.length) clearInterval(iv);
          }, speed);
          intervals.push(iv);
        }, startAt),
      );
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      intervals = [];
      setLine1(hero.systemText);
      setLine2(hero.loadingText);
      setBooted(true);
      activateCore();
      removeSkips();
    };

    const skipEvents = ["wheel", "touchstart", "keydown"] as const;
    const removeSkips = () =>
      skipEvents.forEach((ev) => window.removeEventListener(ev, finish));
    skipEvents.forEach((ev) =>
      window.addEventListener(ev, finish, { passive: true }),
    );

    typeLine(hero.systemText, setLine1, 250);
    typeLine(hero.loadingText, setLine2, 850);
    timers.push(setTimeout(finish, 1900));

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      removeSkips();
    };
  }, [tier, reduce]);

  const showPoster =
    tier === "pending" || tier === "none" || tier === "reduced" || !posterGone;

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      {/* boot flicker — brief, removed once booted, never on reduced-motion */}
      {!booted && (
        <div
          aria-hidden
          className="scanlines boot-flicker pointer-events-none absolute inset-0 z-20"
        />
      )}

      <div className="hero-vignette pointer-events-none absolute inset-0 z-10" />

      {/* CSS poster of the core: no-WebGL/reduced fallback + canvas placeholder */}
      <div
        aria-hidden
        className={`absolute inset-0 z-0 flex items-center justify-center transition-opacity duration-1000 lg:justify-end lg:pr-[9vw] ${
          showPoster ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="core-poster opacity-70 lg:opacity-100">
          <span className="core-poster-mark">{footer.kanji}</span>
        </div>
      </div>

      {/* top system bar */}
      <header className="relative z-20 flex items-center justify-between px-6 pt-7 md:px-12">
        <span className="font-mono text-xs tracking-[0.3em] text-fg">
          STUDIO YUME
        </span>
        <SystemLabel>{microLabels.dreamEngineOnline}</SystemLabel>
      </header>

      <div className="relative z-20 flex flex-1 items-center px-6 md:px-12">
        <div className="max-w-2xl">
          <div className="min-h-[3.25rem] font-mono text-xs leading-6 tracking-[0.2em] text-fg-dim">
            <p>{line1 || " "}</p>
            <p className={booted ? "" : "boot-caret"}>
              {line2 || " "}
              {booted && (
                <span className="ml-2 text-glow">OK</span>
              )}
            </p>
          </div>

          <h1 className="mt-8 text-[clamp(2.6rem,6.5vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-fg">
            <MaskReveal animate={booted} delay={0.15}>
              Boot the dream engine.
            </MaskReveal>
          </h1>

          <motion.p
            data-reveal
            className="mt-7 max-w-xl text-base leading-relaxed text-fg-dim md:text-lg"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          >
            {hero.subcopy}
          </motion.p>

          <motion.div
            data-reveal
            className="mt-10 flex flex-wrap gap-4"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          >
            <CtaButton href="#modules" variant="primary">
              {hero.ctaPrimary}
            </CtaButton>
            <CtaButton href="#cta" variant="secondary">
              {hero.ctaSecondary}
            </CtaButton>
          </motion.div>
        </div>
      </div>

      <div className="relative z-20 flex items-center justify-between px-6 pb-7 md:px-12">
        <SystemLabel>{microLabels.creativeOps}</SystemLabel>
        <SystemLabel className="hidden md:inline">SCROLL ▼</SystemLabel>
      </div>
    </section>
  );
}
