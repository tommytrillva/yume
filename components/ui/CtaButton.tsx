"use client";

import type { ReactNode } from "react";
import { scrollToTarget } from "@/lib/lenis";

/**
 * CTA as a real anchor: works without JS (hash target), routes through
 * Lenis when available, visible emerald focus ring via :focus-visible.
 */
export function CtaButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "solid";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-7 py-3.5 font-mono text-sm tracking-[0.12em] uppercase transition duration-300 ease-out";
  const variants = {
    primary:
      "border border-glow/60 bg-glow/5 text-glow hover:bg-glow/15 hover:border-glow hover:shadow-[0_0_36px_rgba(31,224,121,0.18)]",
    secondary:
      "border border-fg-dim/30 text-fg-dim hover:text-fg hover:border-fg-dim/60",
    solid:
      "bg-glow text-ink font-medium hover:shadow-[0_0_60px_rgba(31,224,121,0.35)] hover:brightness-110",
  };

  const isHash = href.startsWith("#");

  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={
        isHash
          ? (e) => {
              e.preventDefault();
              scrollToTarget(href);
            }
          : undefined
      }
    >
      {children}
    </a>
  );
}
