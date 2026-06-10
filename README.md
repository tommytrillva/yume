# Studio Yume — Dream Engine OS

One-page scroll-narrative marketing site. Black, emerald, smoked glass —
a luxury reinterpretation of the original Xbox boot/dashboard aesthetic,
anchored by the Dream Core: a smoked-glass monolith that activates on boot,
opens into five labeled layers on scroll, and reforms at the final CTA.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + CSS custom properties (`styles/tokens.css`)
- React Three Fiber + Drei + `@react-three/postprocessing` (selective bloom)
- Lenis (smooth scroll) + GSAP ScrollTrigger (scrubbed timelines)
- Framer Motion (discrete UI transitions only)
- Geist Sans / Geist Mono, self-hosted via the `geist` package

## Run

```bash
npm install
npm run dev    # http://localhost:3000
npm run build && npm start
```

## Architecture notes

- **Single scroll source of truth:** ScrollTriggers write *target* values
  into `lib/coreState.ts` as pure functions of trigger progress; the Dream
  Core's frame loop damps toward them (that damping *is* the scrub
  smoothing). No two tweens ever own the same property.
- **Tiering** (`three/useTierDetect.tsx`): `full` / `lite` (mobile,
  low-power) / `reduced` (prefers-reduced-motion) / `none` (no WebGL).
  Lite skips the scrubbed geometry and shows the static exploded diagram;
  reduced/none get a CSS poster of the core and lit end-states. Append
  `?tier=full|lite|reduced|none` to force a tier for QA.
- **Glass:** one shared `MeshPhysicalMaterial` with transmission across all
  five slices — a single transmission pass instead of five Drei
  `MeshTransmissionMaterial` buffers. Bloom is luminance-gated so only the
  un-tonemapped emissives (plasma + 夢 mark) bloom.
- **3D never blocks first paint:** the canvas is `next/dynamic`-loaded and
  fades in over the CSS poster.

## Build notes (deviations / open decisions)

- Core form: slab/monolith (the PRD's lean), 夢 as an emissive mark inside
  the volume; the wordmark lives in the UI.
- `Start a Project` currently points to a `mailto:` placeholder
  (`content/copy.ts`) — swap for Calendly/Cal.com or a form before launch
  (PRD §14.4).
- Case studies are static cards; copy lives in `content/copy.ts` with
  hooks for expansion later.
- Analytics intentionally not wired (clean hook: add in `app/layout.tsx`).
