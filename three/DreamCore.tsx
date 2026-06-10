"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { coreState } from "@/lib/coreState";

/**
 * The Dream Core (PRD §6, revised direction): an animated particle orb —
 * a shimmering emerald particle sphere with a bright silhouette rim,
 * interior plasma wisps, and a tilted orbiting dust ring.
 * `coreState.activation` powers it on; `coreState.openness` flattens the
 * orb into five separated particle rings (LAYER 01–05) for the Dream
 * Engine scrub, and reforms it at the final CTA.
 */

const EMERALD = new THREE.Color("#1fe079");
const EMERALD_DEEP = new THREE.Color("#0b9d52");
const ORB_RADIUS = 1.12;
const LAYER_GAP = 0.55; // per-band Y separation at openness = 1

// Deterministic RNG so geometry is identical across mounts.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setParticleAttributes(
  geo: THREE.BufferGeometry,
  pos: Float32Array,
  seed: Float32Array,
  band: Float32Array,
  shell: Float32Array,
) {
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aBand", new THREE.BufferAttribute(band, 1));
  geo.setAttribute("aShell", new THREE.BufferAttribute(shell, 1));
}

/** Sphere: mostly surface shell (bright) + interior wisps (dim). */
function makeOrbGeometry(count: number) {
  const rng = mulberry32(1337);
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const band = new Float32Array(count);
  const shell = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const u = rng() * 2 - 1; // cos(lat), uniform on sphere
    const phi = rng() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const isShell = rng() > 0.3;
    const r = isShell
      ? ORB_RADIUS * (0.95 + rng() * 0.08)
      : ORB_RADIUS * (0.25 + rng() * 0.68);

    pos[i * 3] = s * Math.cos(phi) * r;
    pos[i * 3 + 1] = u * r;
    pos[i * 3 + 2] = s * Math.sin(phi) * r;
    seed[i] = rng();
    band[i] = Math.min(4, Math.floor((u + 1) * 2.5));
    shell[i] = isShell ? 1 : 0;
  }

  const geo = new THREE.BufferGeometry();
  setParticleAttributes(geo, pos, seed, band, shell);
  return geo;
}

/** Tilted spiral dust ring orbiting the orb. */
function makeRingGeometry(count: number) {
  const rng = mulberry32(7331);
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const band = new Float32Array(count);
  const shell = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const t = rng();
    const radius = ORB_RADIUS * (1.25 + 1.05 * Math.pow(t, 1.6));
    // loose double spiral with scatter
    const theta =
      t * Math.PI * 4 + (i % 2) * Math.PI + (rng() - 0.5) * 1.6;
    const y = (rng() - 0.5) * 0.07 * radius;

    pos[i * 3] = Math.cos(theta) * radius;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(theta) * radius;
    seed[i] = rng();
    band[i] = 2; // center band: never separates
    shell[i] = 1;
  }

  const geo = new THREE.BufferGeometry();
  setParticleAttributes(geo, pos, seed, band, shell);
  return geo;
}

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uActivation;
  uniform float uOpenness;
  uniform float uSize;
  uniform float uPR;
  attribute float aSeed;
  attribute float aBand;
  attribute float aShell;
  varying float vBright;
  varying float vMixC;
  varying float vAlpha;

  void main() {
    vec3 dir = normalize(position);
    float r = length(position);

    // gentle organic drift, never a hard blink
    float w = sin(uTime * 0.55 + aSeed * 6.2831) * 0.035
            + sin(uTime * 1.6 + aSeed * 17.0) * 0.016;
    vec3 p = dir * (r + w * (0.5 + aSeed));

    // layer separation: flatten toward the band's ring, then spread
    float band = aBand - 2.0;
    float bandMid = ((aBand + 0.5) / 5.0) * 2.0 - 1.0;
    p.y = mix(p.y, bandMid * 0.5 * r, uOpenness * 0.6);
    p.y += band * ${LAYER_GAP.toFixed(2)} * uOpenness;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // silhouette rim glow (fresnel on the original radial direction)
    vec3 vn = normalize(normalMatrix * dir);
    float fres = pow(1.0 - abs(vn.z), 2.0);
    float shimmer = 0.62 + 0.38 * sin(uTime * (0.8 + aSeed * 1.7) + aSeed * 40.0);
    float base = mix(0.28, 1.0, fres);
    float shellDim = mix(0.35, 1.0, aShell);
    vBright = base * shimmer * shellDim * (0.06 + 0.94 * uActivation);

    vMixC = fract(aSeed * 7.31);
    vAlpha = mix(0.5, 1.0, fract(aSeed * 3.7));
    gl_PointSize = uSize * uPR * (0.6 + 0.9 * fract(aSeed * 5.13)) * (6.0 / max(0.001, -mv.z));
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  varying float vBright;
  varying float vMixC;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d);
    if (a < 0.01) discard;
    // no tonemapping on ShaderMaterial: rim values exceed 1.0 -> bloom
    vec3 col = mix(uColorB, uColorA, vMixC) * vBright * uIntensity;
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

function makeParticleMaterial(size: number, intensity: number) {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uActivation: { value: 0 },
      uOpenness: { value: 0 },
      uSize: { value: size },
      uPR: { value: 1 },
      uColorA: { value: EMERALD.clone() },
      uColorB: { value: EMERALD_DEEP.clone() },
      uIntensity: { value: intensity },
    },
  });
}

function useKanjiTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 1024);
      // crisp fill, no blur — legibility over glow (bloom stays off it)
      ctx.fillStyle = "#ffffff";
      ctx.font =
        "600 660px 'Hiragino Sans', 'Noto Sans CJK JP', 'Noto Sans JP', 'Yu Gothic', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("夢", 512, 544);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Soft dark disc to quiet the particle field directly behind the mark. */
function useBackingTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(0.55, "rgba(255,255,255,0.5)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export function DreamCore({ quality }: { quality: "full" | "lite" }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Points>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const coreGlowMat = useRef<THREE.MeshBasicMaterial>(null);
  const markMat = useRef<THREE.MeshBasicMaterial>(null);
  const markGroup = useRef<THREE.Group>(null);
  const backingMat = useRef<THREE.MeshBasicMaterial>(null);

  const kanji = useKanjiTexture();
  const backing = useBackingTexture();

  const counts =
    quality === "full"
      ? { orb: 13000, ring: 3800 }
      : { orb: 5500, ring: 1600 };

  const orbGeo = useMemo(() => makeOrbGeometry(counts.orb), [counts.orb]);
  const ringGeo = useMemo(() => makeRingGeometry(counts.ring), [counts.ring]);
  const orbMat = useMemo(
    () => makeParticleMaterial(quality === "full" ? 2.4 : 3.0, 2.4),
    [quality],
  );
  const ringMat = useMemo(
    () => makeParticleMaterial(quality === "full" ? 1.7 : 2.2, 1.0),
    [quality],
  );

  useEffect(() => {
    return () => {
      orbGeo.dispose();
      ringGeo.dispose();
      orbMat.dispose();
      ringMat.dispose();
    };
  }, [orbGeo, ringGeo, orbMat, ringMat]);

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

    // counter-rotating dust ring, fading as the orb opens into layers
    if (ring.current) {
      ring.current.rotation.y = -t * 0.05;
      const rm = ring.current.material as THREE.ShaderMaterial;
      rm.uniforms.uTime.value = t;
      rm.uniforms.uActivation.value = activation * (1 - openness * 0.75);
      rm.uniforms.uPR.value = state.gl.getPixelRatio();
    }

    orbMat.uniforms.uTime.value = t;
    orbMat.uniforms.uActivation.value = activation;
    orbMat.uniforms.uOpenness.value = openness;
    orbMat.uniforms.uPR.value = state.gl.getPixelRatio();

    // Organic plasma pulse — slow compound sines, never a hard blink.
    const pulse =
      0.72 + 0.2 * Math.sin(t * 0.85) + 0.08 * Math.sin(t * 2.3 + 1.7);
    const energy = activation * pulse;

    if (haloMat.current) {
      haloMat.current.opacity = activation * 0.1 * pulse * (1 - openness * 0.5);
    }
    if (coreGlowMat.current) {
      coreGlowMat.current.opacity = activation * 0.14 * pulse * (1 - openness * 0.6);
    }
    if (markGroup.current) {
      // billboard: undo the group rotation so 夢 always faces the camera
      markGroup.current.quaternion.copy(g.quaternion).invert();
    }
    if (markMat.current) {
      // the mark belongs to the assembled orb — gone while layers are open.
      // Brightness stays below the bloom threshold so the glyph reads
      // crisp instead of smearing into a blob.
      markMat.current.opacity = activation * 0.95 * (1 - openness);
      markMat.current.color
        .copy(EMERALD)
        .multiplyScalar(0.62 + 0.18 * pulse * activation);
    }
    if (backingMat.current) {
      backingMat.current.opacity = activation * 0.4 * (1 - openness);
    }
  });

  return (
    <group ref={group}>
      {/* the orb */}
      <points geometry={orbGeo} material={orbMat} />

      {/* orbiting dust ring, tilted off the ecliptic */}
      <points
        ref={ring}
        geometry={ringGeo}
        material={ringMat}
        rotation={[-0.42, 0, -0.12]}
      />

      {/* soft central plasma glow */}
      <mesh>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial
          ref={haloMat}
          color={EMERALD}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial
          ref={coreGlowMat}
          color={EMERALD}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 夢 — the mark floating inside the orb, billboarded to the camera */}
      <group ref={markGroup}>
        {/* dark backing disc so the glyph isn't fighting the particle field */}
        <mesh position={[0, 0, 0.42]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial
            ref={backingMat}
            color="#050706"
            alphaMap={backing}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.5]}>
          <planeGeometry args={[0.95, 0.95]} />
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
      </group>
    </group>
  );
}
