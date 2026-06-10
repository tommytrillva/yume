"use client";

import { philosophy, microLabels } from "@/content/copy";
import { Reveal, MaskReveal } from "@/components/ui/Reveal";
import { SystemLabel } from "@/components/ui/SystemLabel";

/** Philosophy (PRD §7.6): manifesto energy, lots of negative space. */
export function Philosophy() {
  return (
    <section
      id="philosophy"
      className="relative flex min-h-screen flex-col justify-center px-6 py-40 md:px-12"
    >
      <div className="absolute left-6 top-12 md:left-12">
        <SystemLabel>{microLabels.humanTaste}</SystemLabel>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <h2 className="text-[clamp(2.2rem,5.5vw,4.6rem)] font-semibold leading-[1.05] tracking-tight text-fg">
          <MaskReveal>AI does not replace taste.</MaskReveal>
          <MaskReveal delay={0.15} className="text-glow">
            It exposes who has it.
          </MaskReveal>
        </h2>

        <div className="mt-28 grid gap-x-12 gap-y-14 sm:grid-cols-2">
          {philosophy.quotes.map((quote, i) => (
            <Reveal key={quote} delay={i * 0.12}>
              <blockquote className="border-l border-glow-dim/50 pl-6">
                <p className="text-xl font-medium leading-snug tracking-tight text-fg md:text-2xl">
                  {quote}
                </p>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
