"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Render tiers (PRD §10):
 *  - "full":    desktop, capable GPU — transmission, bloom, scrubbed 3D
 *  - "lite":    mobile / low-power — simplified material, no bloom, no scrubbed
 *               geometry separation (static exploded diagram instead)
 *  - "reduced": prefers-reduced-motion — lit end-states, no scrubbed 3D
 *  - "none":    no WebGL — CSS poster, zero 3D
 *  - "pending": pre-hydration default (renders the static fallback)
 */
export type Tier = "full" | "lite" | "reduced" | "none" | "pending";

const TierContext = createContext<Tier>("pending");

function detectTier(): Tier {
  if (typeof window === "undefined") return "pending";

  // Debug/QA escape hatch: ?tier=full|lite|reduced|none
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "full" || forced === "lite" || forced === "reduced" || forced === "none") {
    return forced;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "reduced";
  }

  let hasWebGL = false;
  try {
    const canvas = document.createElement("canvas");
    hasWebGL = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    hasWebGL = false;
  }
  if (!hasWebGL) return "none";

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallViewport = window.innerWidth < 900;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= 4;
  const lowConcurrency =
    navigator.hardwareConcurrency !== undefined &&
    navigator.hardwareConcurrency <= 4;

  if (coarsePointer || smallViewport || lowMemory || lowConcurrency) {
    return "lite";
  }
  return "full";
}

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>("pending");

  useEffect(() => {
    setTier(detectTier());
  }, []);

  return <TierContext.Provider value={tier}>{children}</TierContext.Provider>;
}

export function useTier(): Tier {
  return useContext(TierContext);
}
