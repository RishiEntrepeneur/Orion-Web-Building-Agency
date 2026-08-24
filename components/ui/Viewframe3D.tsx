"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Boxes, Cpu, Maximize2, Sparkles, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------- *
 * Viewframe3D
 * ---------------------------------------------------------------------------
 * A self-contained, dependency-free stand-in for a live Spline / Dora scene.
 * It renders a real CSS 3D cube inside a HUD shell with crosshairs, scanlines
 * and telemetry so the section looks finished before the WebGL asset lands.
 *
 * TO DROP IN A REAL SCENE
 * -----------------------
 * 1. `npm install @splinetool/react-spline`
 * 2. Replace the <SimulatedScene /> element below with:
 *      <Spline scene="https://prod.spline.design/<your-scene>/scene.splinecode" />
 *    …or an <iframe src="https://my.spline.design/<scene>/" title="…" /> /
 *    Dora embed. Every HUD layer around it is absolutely positioned, so the
 *    chrome keeps working untouched.
 * ------------------------------------------------------------------------- */

const CUBE_FACES = [
  { label: "front", transform: "rotateY(0deg)" },
  { label: "back", transform: "rotateY(180deg)" },
  { label: "right", transform: "rotateY(90deg)" },
  { label: "left", transform: "rotateY(-90deg)" },
  { label: "top", transform: "rotateX(90deg)" },
  { label: "bottom", transform: "rotateX(-90deg)" },
] as const;

const TELEMETRY_SEED = [
  { key: "fps", label: "FPS", value: 60, suffix: "" },
  { key: "tris", label: "TRIS", value: 148, suffix: "K" },
  { key: "draw", label: "DRAW", value: 24, suffix: "" },
  { key: "gpu", label: "GPU", value: 38, suffix: "%" },
] as const;

export default function Viewframe3D({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const [telemetry, setTelemetry] = useState<number[]>(() =>
    TELEMETRY_SEED.map((item) => item.value),
  );
  const [engaged, setEngaged] = useState(false);

  /* Cursor-reactive parallax — written straight to the DOM via rAF so the
     React tree never re-renders while the pointer moves. -------------------- */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const tick = () => {
      const cur = currentTilt.current;
      const tgt = targetTilt.current;
      cur.x += (tgt.x - cur.x) * 0.075;
      cur.y += (tgt.y - cur.y) * 0.075;

      stage.style.transform = `perspective(1500px) rotateX(${(-cur.y * 9).toFixed(3)}deg) rotateY(${(cur.x * 12).toFixed(3)}deg) translateZ(0)`;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, []);

  /* Live-looking telemetry, started only after mount to keep SSR markup
     deterministic and hydration-safe. --------------------------------------- */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setTelemetry(
        TELEMETRY_SEED.map((item) => {
          const drift = Math.round((Math.random() - 0.5) * item.value * 0.08);
          return Math.max(1, item.value + drift);
        }),
      );
    }, 1400);

    return () => window.clearInterval(interval);
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    targetTilt.current = {
      x: (event.clientX - bounds.left) / bounds.width - 0.5,
      y: (event.clientY - bounds.top) / bounds.height - 0.5,
    };
  };

  const handlePointerLeave = () => {
    targetTilt.current = { x: 0, y: 0 };
    setEngaged(false);
  };

  const cubeVars = {
    "--cube-size": "clamp(7rem, 20vw, 15rem)",
  } as CSSProperties;

  return (
    <div
      className={cn("relative w-full", className)}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={handlePointerLeave}
    >
      {/* Outer bloom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_45%,rgba(56,242,255,0.22),transparent_72%)] blur-2xl transition-opacity duration-700"
        style={{ opacity: engaged ? 1 : 0.6 }}
      />

      {/* Floating badge — sits above the frame, deliberately overhanging */}
      <div className="absolute -top-4 left-4 z-30 sm:-top-5 sm:left-8">
        <span className="flex items-center gap-2.5 rounded-full border border-neon-cyan/40 bg-abyss/90 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan shadow-[0_0_30px_-6px_rgba(56,242,255,0.9)] backdrop-blur-xl animate-float sm:text-[11px]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon-cyan opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-neon-cyan" />
          </span>
          AI Engine: Active
        </span>
      </div>

      {/* Secondary floating chip */}
      <div className="absolute -bottom-5 right-8 z-30 hidden sm:block">
        <span className="flex items-center gap-2 rounded-full border border-neon-violet/40 bg-abyss/90 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-neon-violet shadow-[0_0_30px_-6px_rgba(139,92,246,0.9)] backdrop-blur-xl animate-float-slow">
          <Sparkles className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
          Prompt → 3D
        </span>
      </div>

      {/* Frame shell */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline bg-abyss/60 p-[1px] shadow-[0_40px_120px_-40px_rgba(56,242,255,0.55)] backdrop-blur-2xl">
        {/* Animated gradient hairline border */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[conic-gradient(from_var(--beam-angle,0deg),transparent_0deg,rgba(56,242,255,0.65)_60deg,rgba(139,92,246,0.65)_120deg,transparent_200deg)] opacity-60 animate-spin-slow"
        />

        <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-[linear-gradient(165deg,#0a0e1e_0%,#070a16_55%,#05070f_100%)]">
          {/* ---- HUD top bar ---- */}
          <div className="relative z-20 flex items-center justify-between gap-3 border-b border-hairline/80 bg-white/[0.02] px-4 py-3 backdrop-blur-md sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-neon-magenta/70 shadow-[0_0_10px_rgba(255,47,179,0.9)]" />
                <span className="size-2.5 rounded-full bg-neon-amber/70 shadow-[0_0_10px_rgba(255,181,71,0.9)]" />
                <span className="size-2.5 rounded-full bg-neon-cyan/70 shadow-[0_0_10px_rgba(56,242,255,0.9)]" />
              </span>
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim sm:inline">
                scene / hero-environment.spline
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim sm:hidden">
                hero.spline
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              <span className="hidden items-center gap-1.5 text-neon-cyan/80 md:flex">
                <Wifi className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                WebGL2
              </span>
              <Maximize2 className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
            </div>
          </div>

          {/* ---- Viewport ---- */}
          <div className="relative aspect-4/3 w-full overflow-hidden sm:aspect-16/10">
            {/* Mesh floor + horizon */}
            <div aria-hidden="true" className="absolute inset-0 grid-mesh-fine opacity-45" />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(80%_100%_at_50%_100%,rgba(139,92,246,0.28),transparent_70%)]"
            />

            {/* Simulated scene */}
            <div
              ref={stageRef}
              className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <SimulatedScene cubeVars={cubeVars} />
            </div>

            {/* Corner crosshair brackets */}
            <CornerBrackets />

            {/* Centre reticle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-24 -translate-x-1/2 -translate-y-1/2 animate-reticle sm:size-32"
            >
              <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-neon-cyan/70" />
              <span className="absolute bottom-0 left-1/2 h-4 w-px -translate-x-1/2 bg-neon-cyan/70" />
              <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-neon-cyan/70" />
              <span className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-neon-cyan/70" />
              <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-[0_0_12px_rgba(56,242,255,1)]" />
            </div>

            {/* Glowing scanline */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              <span className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(56,242,255,0.14),transparent)] animate-scanline" />
              <span className="absolute inset-x-0 top-0 h-px bg-neon-cyan/80 shadow-[0_0_18px_rgba(56,242,255,1)] animate-scanline" />
            </div>

            {/* CRT scanline texture */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 opacity-[0.14] mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* Telemetry readouts */}
            <div className="pointer-events-none absolute left-4 top-14 z-20 flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-neon-cyan/75 animate-hud-flicker sm:left-5 sm:top-16">
              {TELEMETRY_SEED.map((item, index) => (
                <span key={item.key} className="flex items-center gap-2">
                  <span className="text-ink-dim">{item.label}</span>
                  <span
                    className="tabular-nums text-neon-cyan"
                    suppressHydrationWarning
                  >
                    {telemetry[index]}
                    {item.suffix}
                  </span>
                </span>
              ))}
            </div>

            <div className="pointer-events-none absolute right-4 top-14 z-20 flex flex-col items-end gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] sm:right-5 sm:top-16">
              <span className="flex items-center gap-1.5 rounded border border-neon-violet/30 bg-neon-violet/10 px-2 py-1 text-neon-violet">
                <Cpu className="size-3" strokeWidth={2.4} aria-hidden="true" />
                Neural Shading
              </span>
              <span className="flex items-center gap-1.5 rounded border border-hairline bg-white/[0.03] px-2 py-1 text-ink-dim">
                <Boxes className="size-3" strokeWidth={2.4} aria-hidden="true" />
                LOD Auto
              </span>
            </div>

            {/* Cursor hint */}
            <p
              className={cn(
                "pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-hairline bg-abyss/80 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md transition-all duration-500 [@media(hover:hover)]:block sm:bottom-5",
                engaged
                  ? "translate-y-2 opacity-0"
                  : "translate-y-0 text-ink-dim opacity-100",
              )}
            >
              Move your cursor to orbit the scene
            </p>
          </div>

          {/* ---- HUD bottom bar ---- */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-hairline/80 bg-white/[0.02] py-3 pl-4 pr-4 backdrop-blur-md sm:pl-5 sm:pr-52">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              Scene compiled · 0.42s
            </div>
            <div className="flex flex-1 items-center gap-3">
              <div className="h-1 min-w-16 flex-1 overflow-hidden rounded-full bg-white/8">
                <div className="h-full w-[86%] rounded-full bg-linear-to-r from-neon-cyan to-neon-violet shadow-[0_0_12px_rgba(56,242,255,0.9)]" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                86%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SimulatedScene({ cubeVars }: { cubeVars: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex items-center justify-center"
      style={{ ...cubeVars, transformStyle: "preserve-3d" }}
    >
      {/* Orbiting nodes */}
      <div
        className="absolute size-0 animate-orbit"
        style={{ "--orbit-radius": "clamp(7rem, 18vw, 12rem)" } as CSSProperties}
      >
        <span className="block size-2.5 rounded-full bg-neon-cyan shadow-[0_0_18px_rgba(56,242,255,1)]" />
      </div>
      <div
        className="absolute size-0 animate-orbit-reverse"
        style={{ "--orbit-radius": "clamp(9rem, 24vw, 16rem)" } as CSSProperties}
      >
        <span className="block size-2 rounded-full bg-neon-magenta shadow-[0_0_18px_rgba(255,47,179,1)]" />
      </div>
      <div
        className="absolute size-0 animate-orbit"
        style={{ "--orbit-radius": "clamp(5rem, 13vw, 8.5rem)" } as CSSProperties}
      >
        <span className="block size-1.5 rounded-full bg-neon-violet shadow-[0_0_16px_rgba(139,92,246,1)]" />
      </div>

      {/* Ground shadow */}
      <span className="absolute top-[calc(var(--cube-size)*0.85)] h-6 w-[calc(var(--cube-size)*1.15)] rounded-[50%] bg-neon-violet/25 blur-xl" />

      {/* Wireframe cube */}
      <div
        className="relative animate-cube-spin"
        style={{
          width: "var(--cube-size)",
          height: "var(--cube-size)",
          transformStyle: "preserve-3d",
        }}
      >
        {CUBE_FACES.map((face) => (
          <span
            key={face.label}
            className="absolute inset-0 border border-neon-cyan/45 bg-[linear-gradient(135deg,rgba(56,242,255,0.14),rgba(139,92,246,0.1))] shadow-[inset_0_0_36px_rgba(56,242,255,0.22)] backdrop-blur-[1px]"
            style={{
              transform: `${face.transform} translateZ(calc(var(--cube-size) / 2))`,
            }}
          >
            <span className="absolute inset-2 border border-neon-violet/20" />
            <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan/80" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CornerBrackets() {
  const corners = [
    "left-4 top-4 border-l-2 border-t-2 sm:left-5 sm:top-5",
    "right-4 top-4 border-r-2 border-t-2 sm:right-5 sm:top-5",
    "bottom-4 left-4 border-b-2 border-l-2 sm:bottom-5 sm:left-5",
    "bottom-4 right-4 border-b-2 border-r-2 sm:bottom-5 sm:right-5",
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {corners.map((position) => (
        <span
          key={position}
          className={cn(
            "absolute size-7 border-neon-cyan/55 sm:size-9",
            position,
          )}
        />
      ))}
    </div>
  );
}
