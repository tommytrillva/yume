"use client";

import { dreamEngine, microLabels } from "@/content/copy";
import { Reveal, MaskReveal } from "@/components/ui/Reveal";
import { SystemLabel } from "@/components/ui/SystemLabel";
import { useTier } from "@/three/useTierDetect";

/**
 * The signature scroll moment (PRD §7.4). Full tier: the section is pinned
 * by the choreography and the core (on the fixed canvas behind) opens into
 * five layers while the `.engine-label`s sync to scroll progress. Every
 * other tier gets the static exploded diagram.
 */
export function DreamEngine() {
  const tier = useTier();

  if (tier !== "full") {
    return (
      <section id="engine" className="relative px-6 py-32 md:px-12 md:py-40">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-center text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-tight text-fg">
            <MaskReveal>{dreamEngine.headline}</MaskReveal>
          </h2>

          {/* static exploded diagram */}
          <div className="relative mx-auto mt-20 max-w-md">
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,224,121,0.16)_0%,transparent_70%)]"
            />
            <ol className="relative space-y-4">
              {dreamEngine.layers.map((layer, i) => (
                <Reveal key={layer} delay={i * 0.08}>
                  <li className="glass-panel edge-light flex items-center justify-between rounded-lg px-5 py-4">
                    <span className="font-mono text-xs tracking-[0.2em] text-fg">
                      {layer}
                    </span>
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_12px_rgba(31,224,121,0.8)]"
                    />
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          <div className="mt-16 text-center">
            <SystemLabel>{microLabels.creativeOps}</SystemLabel>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="engine" className="relative h-screen overflow-hidden">
      <div className="flex h-full flex-col justify-between px-6 py-16 md:px-12 md:py-20">
        <h2 className="max-w-xl text-[clamp(1.9rem,3.8vw,3.2rem)] font-semibold leading-[1.08] tracking-tight text-fg">
          <MaskReveal>{dreamEngine.headline}</MaskReveal>
        </h2>

        {/* layer labels, revealed by the pinned scroll timeline */}
        <div
          className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-end gap-[8.5vh] md:right-12"
          aria-label="Dream engine layers"
        >
          {dreamEngine.layers.map((layer) => (
            <div
              key={layer}
              className="engine-label flex items-center gap-4 opacity-0"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-fg md:text-sm">
                {layer}
              </span>
              <span
                aria-hidden
                className="h-px w-10 bg-gradient-to-l from-glow/70 to-transparent md:w-16"
              />
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between">
          <SystemLabel>{microLabels.creativeOps}</SystemLabel>
          <SystemLabel className="hidden md:inline">
            SCRUB TO OPEN
          </SystemLabel>
        </div>
      </div>
    </section>
  );
}
