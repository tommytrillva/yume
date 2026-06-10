"use client";

import { Reveal } from "./Reveal";
import { SystemLabel } from "./SystemLabel";

/** System module tile (PRD §7.3): console-UI feel, tasteful hover. */
export function ModuleCard({
  id,
  name,
  desc,
  tag,
  index,
}: {
  id: string;
  name: string;
  desc: string;
  tag: string;
  index: number;
}) {
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <div className="glass-panel edge-light group flex h-full flex-col rounded-xl p-6 transition duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_12px_50px_rgba(31,224,121,0.10)]">
        <div className="flex items-baseline justify-between">
          <SystemLabel className="text-glow-dim transition-colors duration-500 group-hover:text-glow">
            {id}
          </SystemLabel>
          <SystemLabel>{tag}</SystemLabel>
        </div>
        <h3 className="mt-8 text-xl font-medium tracking-tight text-fg md:text-2xl">
          {name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-dim">{desc}</p>
        <div className="mt-auto pt-6">
          <div className="h-px w-full bg-gradient-to-r from-glow-dim/40 via-transparent to-transparent transition-opacity duration-500 group-hover:from-glow-dim" />
        </div>
      </div>
    </Reveal>
  );
}
