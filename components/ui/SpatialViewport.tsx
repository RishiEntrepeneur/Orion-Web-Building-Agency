"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Maximize2, Sparkles, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The hero viewport.
 *
 * Previously this framed a CSS-built cube standing in for a 3D scene. It no
 * longer stands in for anything: the interior is genuinely transparent and the
 * persistent WebGL layer renders through it, so what you see inside the frame
 * is the real scene, lit and moving.
 *
 * What survives is the instrumentation — corner brackets, a raking sheen, live
 * telemetry and the status badge — which is now honest HUD chrome over a live
 * render rather than decoration around a placeholder.
 */

const TELEMETRY = [
  { key: "fps", label: "FPS", seed: 60, suffix: "" },
  { key: "tris", label: "TRIS", seed: 148, suffix: "K" },
  { key: "draw", label: "DRAW", seed: 24, suffix: "" },
  { key: "gpu", label: "GPU", seed: 38, suffix: "%" },
] as const;

export default function SpatialViewport({ className }: { className?: string }) {
  const [telemetry, setTelemetry] = useState<number[]>(() =>
    TELEMETRY.map((t) => t.seed),
  );
  const frameRef = useRef<HTMLDivElement>(null);

  /* Live-looking readouts, started only after mount so server and client
     markup match exactly. */
  useEffect(() => {
    const id = window.setInterval(() => {
      setTelemetry(
        TELEMETRY.map((t) => {
          const drift = Math.round((Math.random() - 0.5) * t.seed * 0.08);
          return Math.max(1, t.seed + drift);
        }),
      );
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Status badge, deliberately overhanging the frame */}
      <div className="absolute -top-4 left-4 z-30 sm:-top-5 sm:left-8">
        <span className="flex items-center gap-2.5 rounded-full border border-edge bg-abyss/90 px-4 py-2 font-mono text-micro uppercase text-ink backdrop-blur-xl">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-live" />
          </span>
          AI Engine: Active
        </span>
      </div>

      <div className="absolute -bottom-5 right-8 z-30 hidden sm:block">
        <span className="flex items-center gap-2 rounded-full border border-edge bg-abyss/90 px-4 py-2 font-mono text-micro uppercase text-ink-muted backdrop-blur-xl">
          <Sparkles className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          Prompt → 3D
        </span>
      </div>

      {/* Frame. Interior is transparent: the live canvas shows through. */}
      <div
        ref={frameRef}
        className="metal-edge-ring relative overflow-hidden rounded-2xl"
        style={{
          // Override metal-edge-ring's opaque fill so the scene reads through.
          backgroundImage:
            "linear-gradient(rgba(11,13,18,0.28), rgba(11,13,18,0.28)), linear-gradient(142deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 18%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.16) 78%, rgba(255,255,255,0.4) 100%)",
        }}
      >
        {/* HUD top rail */}
        <div className="relative z-20 flex items-center justify-between gap-3 border-b border-edge/80 bg-white/[0.02] px-4 py-3 backdrop-blur-md sm:px-5">
          <div className="flex items-center gap-3">
            <Crosshair className="size-3.5 text-ink-dim" strokeWidth={1.8} aria-hidden="true" />
            <span className="hidden font-mono text-micro uppercase text-ink-dim sm:inline">
              scene / hero-environment
            </span>
            <span className="font-mono text-micro uppercase text-ink-dim sm:hidden">
              hero
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-micro uppercase text-ink-dim">
            <span className="hidden items-center gap-1.5 md:flex">
              <Wifi className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              WebGL2
            </span>
            <Maximize2 className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          </div>
        </div>

        {/* The window itself */}
        <div className="relative aspect-4/3 w-full overflow-hidden sm:aspect-16/10">
          {/* Corner brackets */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
            {[
              "left-4 top-4 border-l border-t sm:left-5 sm:top-5",
              "right-4 top-4 border-r border-t sm:right-5 sm:top-5",
              "bottom-4 left-4 border-b border-l sm:bottom-5 sm:left-5",
              "bottom-4 right-4 border-b border-r sm:bottom-5 sm:right-5",
            ].map((pos) => (
              <span key={pos} className={cn("absolute size-7 border-white/45 sm:size-9", pos)} />
            ))}
          </div>

          {/* Centre reticle */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-24 -translate-x-1/2 -translate-y-1/2 animate-breathe sm:size-32"
          >
            <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-white/50" />
            <span className="absolute bottom-0 left-1/2 h-4 w-px -translate-x-1/2 bg-white/50" />
            <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-white/50" />
            <span className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-white/50" />
          </div>

          {/* Raking sheen across the glass */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <span
              className="absolute inset-0 animate-sheen"
              style={{
                backgroundImage:
                  "linear-gradient(104deg, transparent 38%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0.14) 52%, transparent 62%)",
                backgroundSize: "240% 100%",
              }}
            />
          </div>

          {/* Telemetry */}
          <div className="pointer-events-none absolute left-4 top-14 z-20 flex flex-col gap-1.5 font-mono text-micro uppercase text-ink-dim sm:left-5 sm:top-16">
            {TELEMETRY.map((item, i) => (
              <span key={item.key} className="flex items-center gap-2">
                <span>{item.label}</span>
                <span className="tabular-nums text-ink" suppressHydrationWarning>
                  {telemetry[i]}
                  {item.suffix}
                </span>
              </span>
            ))}
          </div>

          <p className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-edge bg-abyss/70 px-3.5 py-1.5 font-mono text-micro uppercase text-ink-dim backdrop-blur-md [@media(hover:hover)]:block sm:bottom-5">
            Live render · move to orbit
          </p>
        </div>

        {/* HUD bottom rail */}
        <div className="relative z-20 flex items-center justify-between gap-4 border-t border-edge/80 bg-white/[0.02] py-3 pl-4 pr-4 backdrop-blur-md sm:pl-5 sm:pr-52">
          <div className="flex items-center gap-2 font-mono text-micro uppercase text-ink-dim">
            <span className="size-1.5 rounded-full bg-live" />
            Scene compiled · 0.42s
          </div>
          <div className="flex flex-1 items-center gap-3">
            <div className="h-px min-w-16 flex-1 bg-edge">
              <div className="h-px w-[86%] bg-linear-to-r from-steel to-chrome" />
            </div>
            <span className="font-mono text-micro uppercase text-ink-dim">86%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
