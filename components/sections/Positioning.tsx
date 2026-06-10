"use client";

import { positioning, microLabels } from "@/content/copy";
import { Blade } from "@/components/ui/Blade";
import { Reveal, MaskReveal } from "@/components/ui/Reveal";
import { SystemLabel } from "@/components/ui/SystemLabel";

/** Dashboard / positioning (PRD §7.2): refined blade panels, not a skin. */
export function Positioning() {
  return (
    <section
      id="positioning"
      className="relative flex min-h-screen flex-col justify-center px-6 py-32 md:px-12"
    >
      <div className="absolute right-6 top-10 md:right-12">
        <SystemLabel>{microLabels.humanTaste}</SystemLabel>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <h2 className="max-w-4xl text-[clamp(1.9rem,4.2vw,3.6rem)] font-semibold leading-[1.08] tracking-tight text-fg">
          <MaskReveal>Your brand does not need another content calendar.</MaskReveal>
          <MaskReveal delay={0.12}>It needs an operating system.</MaskReveal>
        </h2>

        <Reveal delay={0.2} className="mt-8 max-w-2xl">
          <p className="text-base leading-relaxed text-fg-dim md:text-lg">
            {positioning.copy}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {positioning.blades.map((blade, i) => (
            <Blade key={blade.label} {...blade} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
