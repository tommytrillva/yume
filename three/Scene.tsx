"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { DreamCore } from "./DreamCore";

/**
 * Dark studio: low ambient, one soft key, emerald rims, and a quiet
 * procedurally generated environment (no network HDRI). Bloom is gated by
 * luminance threshold so it only touches the un-tonemapped emissives —
 * the plasma and the mark — never the glass (PRD §6).
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
      <ambientLight intensity={0.12} />
      <directionalLight position={[3.5, 4, 2.5]} intensity={0.55} color="#e8f0ea" />
      <pointLight position={[-3.5, -0.5, -2]} intensity={1.1} color="#1fe079" />
      <pointLight position={[3, -2.5, -3]} intensity={0.7} color="#0b9d52" />

      <DreamCore quality={quality} />

      <Environment resolution={quality === "full" ? 256 : 64} frames={1}>
        <color attach="background" args={["#020403"]} />
        <Lightformer
          intensity={0.7}
          position={[0, 3, -2]}
          scale={[9, 2, 1]}
          color="#e8f0ea"
        />
        <Lightformer
          intensity={0.5}
          position={[-4, 0, 1]}
          rotation-y={Math.PI / 2}
          scale={[6, 1.6, 1]}
          color="#1fe079"
        />
        <Lightformer
          intensity={0.3}
          position={[4, -1, 0]}
          rotation-y={-Math.PI / 2}
          scale={[5, 1, 1]}
          color="#0b9d52"
        />
      </Environment>

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
