"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { coreState } from "./coreState";
import { useTier } from "@/three/useTierDetect";

gsap.registerPlugin(ScrollTrigger);

/** Boot: power the core on. Called by the hero when the boot sequence ends. */
export function activateCore(instant = false) {
  gsap.killTweensOf(coreState, "activation");
  if (instant) {
    coreState.activation = 1;
    return;
  }
  gsap.to(coreState, {
    activation: 1,
    duration: 1.8,
    ease: "power2.inOut",
    delay: 0.15,
  });
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The scroll spine (PRD §8). Each ScrollTrigger covers a non-overlapping
 * scroll range and writes *target* values into `coreState` as a pure
 * function of its progress — a single-owner design with no competing
 * tweens. The Dream Core's frame loop damps toward these targets, which
 * supplies the scrub smoothing. GSAP timelines are only used where GSAP
 * owns the DOM outright (pinning + the layer labels).
 */
export function Choreography() {
  const tier = useTier();

  useEffect(() => {
    if (tier !== "full" && tier !== "lite") return;

    const wide = window.innerWidth >= 1024;
    const HERO =
      tier === "full" && wide
        ? { x: 1.35, y: 0, scale: 1 }
        : { x: 0, y: 0.4, scale: 0.72 };

    coreState.x = HERO.x;
    coreState.y = HERO.y;
    coreState.scale = HERO.scale;
    coreState.opacity = 1;

    const ctx = gsap.context(() => {
      // Hero -> positioning: the core recedes into the background.
      ScrollTrigger.create({
        trigger: "#positioning",
        start: "top 95%",
        end: "top 15%",
        onUpdate: (self) => {
          const p = self.progress;
          coreState.opacity = lerp(1, 0.12, p);
          coreState.scale = lerp(HERO.scale, 0.55, p);
          coreState.x = lerp(HERO.x, 0, p);
          coreState.y = lerp(HERO.y, 0, p);
        },
      });

      if (tier === "full") {
        // Dream Engine: pinned, scrubbed open into 5 layers (PRD §7.4).
        // The timeline owns only the label DOM; the core's state comes
        // from the trigger's progress.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#engine",
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              const arrive = clamp01(p / 0.1);
              coreState.opacity = lerp(0.12, 1, arrive);
              coreState.scale = lerp(0.55, 0.78, arrive);
              coreState.openness = clamp01((p - 0.1) / 0.8);
              coreState.x = 0;
              coreState.y = 0;
            },
          },
        });

        gsap.utils.toArray<HTMLElement>(".engine-label").forEach((el, i) => {
          tl.fromTo(
            el,
            { opacity: 0, x: 28 },
            { opacity: 1, x: 0, duration: 0.07, ease: "none" },
            0.16 + i * 0.155,
          );
        });
        // pad the timeline so label positions map 1:1 onto trigger progress
        tl.to({}, { duration: 0.08 }, 0.92);

        // Engine -> work: recede again (still open).
        ScrollTrigger.create({
          trigger: "#work",
          start: "top 95%",
          end: "top 30%",
          onUpdate: (self) => {
            const p = self.progress;
            coreState.opacity = lerp(1, 0.1, p);
            coreState.scale = lerp(0.78, 0.5, p);
          },
        });

        // Final CTA: the core returns and reforms (PRD §7.7).
        ScrollTrigger.create({
          trigger: "#cta",
          start: "top 85%",
          end: "center 55%",
          onUpdate: (self) => {
            const p = self.progress;
            coreState.opacity = lerp(0.1, 0.85, p);
            coreState.scale = lerp(0.5, 0.9, p);
            coreState.openness = 1 - p;
          },
        });
      } else {
        // Lite: no scrubbed geometry — the intact lit core just returns
        // softly behind the final CTA.
        ScrollTrigger.create({
          trigger: "#cta",
          start: "top 90%",
          end: "center 60%",
          onUpdate: (self) => {
            const p = self.progress;
            coreState.opacity = lerp(0.12, 0.5, p);
            coreState.scale = lerp(0.55, 0.85, p);
          },
        });
      }
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => ctx.revert();
  }, [tier]);

  return null;
}
