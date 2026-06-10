"use client";

import { work, microLabels } from "@/content/copy";
import { CaseFile } from "@/components/ui/CaseFile";
import { Reveal } from "@/components/ui/Reveal";
import { SystemLabel } from "@/components/ui/SystemLabel";

/** Work / proof (PRD §7.5): case studies as saved system files. */
export function Work() {
  return (
    <section id="work" className="relative px-6 py-32 md:px-12 md:py-40">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <SystemLabel className="text-glow-dim">
            {microLabels.nonGeneric}
          </SystemLabel>
          <h2 className="mt-4 text-[clamp(1.8rem,3.6vw,3rem)] font-semibold tracking-tight text-fg">
            {work.title}
          </h2>
        </Reveal>

        <div className="mt-14 space-y-4">
          {work.cases.map((c, i) => (
            <CaseFile key={c.file} {...c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
