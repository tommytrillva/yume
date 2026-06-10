"use client";

import { Reveal } from "./Reveal";
import { SystemLabel } from "./SystemLabel";

/** Case study as a saved file / system entry (PRD §7.5). */
export function CaseFile({
  file,
  name,
  meta,
  desc,
  status,
  index,
}: {
  file: string;
  name: string;
  meta: string;
  desc: string;
  status: string;
  index: number;
}) {
  return (
    <Reveal delay={index * 0.1}>
      <article className="glass-panel edge-light group rounded-xl p-6 transition duration-500 ease-out hover:bg-ink-raise/80 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <span className="font-mono text-sm tracking-wide text-glow/90">
            {file}
          </span>
          <SystemLabel className="text-glow-dim">{status}</SystemLabel>
        </div>
        <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8">
          <h3 className="text-xl font-medium tracking-tight text-fg md:text-2xl">
            {name}
          </h3>
          <SystemLabel>{meta}</SystemLabel>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-dim transition-colors duration-500 group-hover:text-fg/85">
          {desc}
        </p>
      </article>
    </Reveal>
  );
}
