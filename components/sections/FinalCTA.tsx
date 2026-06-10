"use client";

import { finalCta, microLabels } from "@/content/copy";
import { CtaButton } from "@/components/ui/CtaButton";
import { Reveal, MaskReveal } from "@/components/ui/Reveal";
import { SystemLabel } from "@/components/ui/SystemLabel";

/**
 * Final CTA (PRD §7.7): the core reforms behind this section (handled by
 * the scroll choreography) and the button is the page's climax.
 */
export function FinalCTA() {
  return (
    <section
      id="cta"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-32 text-center md:px-12"
    >
      <SystemLabel className="text-glow-dim">
        {microLabels.dreamEngineOnline}
      </SystemLabel>

      <h2 className="mt-8 text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.04] tracking-tight text-fg">
        <MaskReveal>{finalCta.headline}</MaskReveal>
      </h2>

      <Reveal delay={0.15} className="mt-7 max-w-xl">
        <p className="text-base leading-relaxed text-fg-dim md:text-lg">
          {finalCta.subcopy}
        </p>
      </Reveal>

      <Reveal delay={0.3} className="mt-12">
        <CtaButton
          href={finalCta.href}
          variant="solid"
          className="px-10 py-5 text-base"
        >
          {finalCta.button}
        </CtaButton>
      </Reveal>
    </section>
  );
}
