"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { DreamCore } from "./DreamCore";

/**
 * The particle orb is entirely self-lit (additive shader particles +
 * emissive mark), so no scene lighting is needed. Bloom is gated by
 * luminance threshold so it only touches values pushed past 1.0 —
 * the orb's rim and the mark — never the dim dust (PRD §6).
 */
export default function Scene({
  quality,
  onReady,
}: {
  quality: "full" | "lite";
  onReady?: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 35 }}
      dpr={quality === "full" ? [1, 2] : [1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={() => onReady?.()}
    >
      <DreamCore quality={quality} />

      {quality === "full" && (
        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={0.85}
            luminanceThreshold={1}
            luminanceSmoothing={0.25}
            radius={0.7}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
