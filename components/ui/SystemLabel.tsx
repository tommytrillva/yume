import type { ReactNode } from "react";

/** Quiet mono micro-label (PRD §9): small, ≤55% opacity, discovered not shouted. */
export function SystemLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.22em] text-fg-dim select-none ${className}`}
    >
      {children}
    </span>
  );
}
