"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTier } from "./useTierDetect";

// Never block first paint on Three.js (PRD §10).
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Fixed full-viewport canvas behind all content. The outer wrapper's
 * opacity belongs to GSAP (scroll choreography); the inner div handles
 * the one-time fade-in once the scene is live.
 */
export function CoreCanvas() {
  const tier = useTier();
  const [ready, setReady] = useState(false);

  if (tier !== "full" && tier !== "lite") return null;

  return (
    <div
      id="core-canvas"
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    >
      <div
        className={`h-full w-full transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <Scene
          quality={tier}
          onReady={() => {
            setReady(true);
            window.dispatchEvent(new Event("yume:scene-ready"));
          }}
        />
      </div>
    </div>
  );
}
