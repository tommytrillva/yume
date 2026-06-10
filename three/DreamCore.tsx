"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { coreState } from "@/lib/coreState";

/**
 * The Dream Core (PRD §6): a smoked-glass monolith of five stacked slices
 * around an emerald plasma source, with the 夢 mark floating inside the
 * volume. `coreState.activation` powers the internals on; `coreState.openness`
 * separates the slices into LAYER 01–05.
 */

const SLICES = 5;
const WIDTH = 1.5;
const DEPTH = 0.78;
const TOTAL_H = 2.3;
const SEAM = 0.008; // hairline seams even when closed — precision instrument
const SLICE_H = (TOTAL_H - SEAM * (SLICES - 1)) / SLICES;
const SPREAD = 0.38; // per-slice separation at openness = 1

const EMERALD = new THREE.Color("#1fe079");

function useKanjiTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);
      ctx.fillStyle = "#ffffff";
      ctx.font =
        "700 330px 'Hiragino Sans', 'Noto Sans CJK JP', 'Noto Sans JP', 'Yu Gothic', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 14;
      ctx.fillText("夢", 256, 272);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export function DreamCore({ quality }: { quality: "full" | "lite" }) {
  const group = useRef<THREE.Group>(null);
  const sliceRefs = useRef<(THREE.Group | null)[]>([]);
  const plasma = useRef<THREE.Mesh>(null);
  const plasmaMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const markMat = useRef<THREE.MeshBasicMaterial>(null);
  const innerLight = useRef<THREE.PointLight>(null);

  const kanji = useKanjiTexture();

  // One shared physical material -> a single transmission pass for all
  // five slices (much cheaper than per-mesh transmission buffers).
  const glass = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#dfe9e2"),
      transmission: 1,
      thickness: quality === "full" ? 1.1 : 0.7,
      roughness: 0.18,
      ior: 1.45,
      attenuationColor: new THREE.Color("#0a2e1c"),
      attenuationDistance: 0.55,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      metalness: 0,
      specularIntensity: 0.7,
      envMapIntensity: 0.55,
    });
  }, [quality]);

  useEffect(() => () => glass.dispose(), [glass]);

  // Damped "current" values trailing the targets in coreState — this is
  // the scrub smoothing, applied in one place for DOM and 3D alike.
  const cur = useRef({ openness: 0, x: 0, y: 0, scale: 1, opacity: 1 });
  const wrapper = useRef<HTMLElement | null>(null);

  useEffect(() => {
    cur.current = {
      openness: coreState.openness,
      x: coreState.x,
      y: coreState.y,
      scale: coreState.scale,
      opacity: coreState.opacity,
    };
    wrapper.current = document.getElementById("core-canvas");
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const { activation } = coreState;

    const c = cur.current;
    const damp = THREE.MathUtils.damp;
    c.openness = damp(c.openness, coreState.openness, 7, delta);
    c.x = damp(c.x, coreState.x, 6, delta);
    c.y = damp(c.y, coreState.y, 6, delta);
    c.scale = damp(c.scale, coreState.scale, 6, delta);
    c.opacity = damp(c.opacity, coreState.opacity, 6, delta);

    if (wrapper.current) {
      wrapper.current.style.opacity = c.opacity.toFixed(3);
    }

    const openness = c.openness;
    g.position.set(c.x, c.y, 0);
    g.scale.setScalar(c.scale);
    // Idle rotation: very subtle drift, calming further as the core opens.
    g.rotation.y = 0.42 + t * 0.06 * (1 - openness * 0.55);
    g.rotation.x = -0.05 + Math.sin(t * 0.21) * 0.015;

    const open = Math.pow(openness, 1.15);
    for (let i = 0; i < SLICES; i += 1) {
      const slice = sliceRefs.current[i];
      if (!slice) continue;
      const offset = i - (SLICES - 1) / 2;
      slice.position.y = offset * (SLICE_H + SEAM) + offset * SPREAD * open;
    }

    // Organic plasma pulse — slow compound sines, never a hard blink.
    const pulse =
      0.72 + 0.2 * Math.sin(t * 0.85) + 0.08 * Math.sin(t * 2.3 + 1.7);
    const energy = activation * pulse;

    if (plasmaMat.current) {
      plasmaMat.current.color
        .copy(EMERALD)
        .multiplyScalar(0.2 + energy * 2.9);
      // dormant core is empty dark glass, not a dead black sphere
      plasmaMat.current.opacity = Math.min(1, activation * 1.6);
    }
    if (plasma.current) {
      const breathe = 1 + 0.05 * Math.sin(t * 1.25) * activation;
      plasma.current.scale.setScalar(breathe);
    }
    if (haloMat.current) {
      haloMat.current.opacity = activation * 0.18 * pulse;
    }
    if (markMat.current) {
      markMat.current.opacity = activation * 0.92;
      markMat.current.color.copy(EMERALD).multiplyScalar(0.5 + energy * 1.9);
    }
    if (innerLight.current) {
      innerLight.current.intensity = energy * 2.6;
    }
  });

  const segments = quality === "full" ? 8 : 4;

  return (
    <group ref={group}>
      {Array.from({ length: SLICES }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            sliceRefs.current[i] = el;
          }}
        >
          <RoundedBox
            args={[WIDTH, SLICE_H, DEPTH]}
            radius={0.022}
            smoothness={segments}
            material={glass}
          />
        </group>
      ))}

      {/* plasma core */}
      <mesh ref={plasma}>
        <sphereGeometry args={[0.27, quality === "full" ? 48 : 24, quality === "full" ? 48 : 24]} />
        <meshBasicMaterial
          ref={plasmaMat}
          toneMapped={false}
          transparent
          opacity={0}
        />
      </mesh>
      {/* soft halo shell around the plasma */}
      <mesh scale={1.55}>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshBasicMaterial
          ref={haloMat}
          color={EMERALD}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 夢 — emissive mark floating inside the volume */}
      <mesh position={[0, 0, DEPTH / 2 - 0.14]}>
        <planeGeometry args={[0.92, 0.92]} />
        <meshBasicMaterial
          ref={markMat}
          alphaMap={kanji}
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        ref={innerLight}
        color="#1fe079"
        intensity={0}
        distance={6}
        decay={1.8}
      />
    </group>
  );
}
