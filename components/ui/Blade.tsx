"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SystemLabel } from "./SystemLabel";

/**
 * Dashboard blade (PRD §7.2): black glass panel with emerald edge light,
 * sliding in with a stagger. Modernized homage, not a skin.
 */
export function Blade({
  label,
  title,
  body,
  index,
}: {
  label: string;
  title: string;
  body: string;
  index: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      data-reveal
      className="glass-panel edge-light flex min-h-[230px] flex-col justify-between rounded-xl p-6 md:min-h-[280px]"
      initial={reduce ? false : { opacity: 0, x: 64 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, delay: index * 0.12, ease: [0.22, 0.08, 0.18, 1] }}
    >
      <SystemLabel>{label}</SystemLabel>
      <div>
        <h3 className="text-lg font-medium text-fg md:text-xl">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-dim">{body}</p>
      </div>
    </motion.div>
  );
}
