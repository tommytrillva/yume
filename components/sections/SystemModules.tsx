"use client";

import { modules, microLabels } from "@/content/copy";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { Reveal } from "@/components/ui/Reveal";
import { SystemLabel } from "@/components/ui/SystemLabel";

/** System modules (PRD §7.3): five console-UI tiles. */
export function SystemModules() {
  return (
    <section
      id="modules"
      className="relative px-6 py-32 md:px-12 md:py-40"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SystemLabel className="text-glow-dim">
            {microLabels.brandSignal}
          </SystemLabel>
          <h2 className="mt-4 text-[clamp(1.8rem,3.6vw,3rem)] font-semibold tracking-tight text-fg">
            {modules.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.items.map((mod, i) => (
            <ModuleCard key={mod.id} {...mod} tag={modules.tag} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
