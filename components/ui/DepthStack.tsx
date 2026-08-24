"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Layers, MousePointer2, MoveVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const LAYERS = [
  {
    id: "ui",
    label: "UI Layer",
    depth: 88,
    accent: "from-accent/30 to-accent/[0.04]",
    border: "border-chrome/45",
  },
  {
    id: "content",
    label: "Content Plane",
    depth: 44,
    accent: "from-steel/28 to-steel/[0.04]",
    border: "border-steel/45",
  },
  {
    id: "environment",
    label: "3D Environment",
    depth: 0,
    accent: "from-steel/24 to-steel/[0.04]",
    border: "border-steel/40",
  },
] as const;

/**
 * The "2D flat → spatial environment" demonstration.
 * A flat, stacked page separates into parallax depth layers when the card is
 * hovered, focused, or scrolled into view on touch devices.
 */
export default function DepthStack() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  /* Touch/no-hover devices get the exploded state automatically on scroll. */
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setExploded(entry.isIntersecting),
      { threshold: 0.55 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: (event.clientX - bounds.left) / bounds.width - 0.5,
      y: (event.clientY - bounds.top) / bounds.height - 0.5,
    });
  };

  const stageStyle: CSSProperties = {
    transform: `perspective(1100px) rotateX(${(-tilt.y * 10 - (exploded ? 12 : 0)).toFixed(2)}deg) rotateY(${(tilt.x * 14 + (exploded ? -24 : 0)).toFixed(2)}deg)`,
    transformStyle: "preserve-3d",
  };

  return (
    <div
      ref={wrapperRef}
      onPointerEnter={() => setExploded(true)}
      onPointerLeave={() => {
        setExploded(false);
        setTilt({ x: 0, y: 0 });
      }}
      onPointerMove={handlePointerMove}
      onFocus={() => setExploded(true)}
      onBlur={() => setExploded(false)}
      tabIndex={0}
      role="img"
      aria-label="Diagram: a flat two-dimensional web page separating into three parallax depth layers — UI layer, content plane and 3D environment."
      className="relative flex h-full min-h-[19rem] w-full cursor-crosshair items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chrome sm:min-h-[23rem]"
    >
      {/* Mode label */}
      <span
        className={cn(
          "absolute left-0 top-0 z-20 flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-500",
          exploded
            ? "border-accent/55 bg-accent/12 text-accent shadow-[0_0_24px_-6px_color-mix(in_oklab,var(--accent)_74%,transparent)]"
            : "border-edge bg-white/[0.04] text-ink-dim",
        )}
      >
        <Layers className="size-3" strokeWidth={2.4} aria-hidden="true" />
        {exploded ? "Spatial 3D" : "Flat 2D"}
      </span>

      {/* Stage */}
      <div
        className="relative flex size-full items-center justify-center transition-transform duration-700 ease-out"
        style={stageStyle}
      >
        {LAYERS.map((layer, index) => (
          <div
            key={layer.id}
            className={cn(
              "absolute h-40 w-56 rounded-lg border bg-linear-to-br backdrop-blur-sm transition-all duration-700 ease-out sm:h-48 sm:w-72",
              layer.border,
              layer.accent,
            )}
            style={{
              transform: exploded
                ? `translate3d(${(index - 1) * 44}px, ${(index - 1) * 42}px, ${layer.depth}px)`
                : `translate3d(0, ${index * 2}px, 0)`,
              boxShadow: exploded
                ? "0 30px 70px -30px rgba(0,0,0,0.9)"
                : "0 10px 30px -20px rgba(0,0,0,0.8)",
              zIndex: LAYERS.length - index,
            }}
          >
            {/* Wireframe content inside each plane */}
            <div className="flex h-full flex-col gap-2 p-4">
              <div className="h-2 w-1/3 rounded-full bg-white/25" />
              <div className="h-2 w-2/3 rounded-full bg-white/15" />
              <div className="mt-auto grid grid-cols-3 gap-2">
                <div className="h-8 rounded bg-white/10" />
                <div className="h-8 rounded bg-white/10" />
                <div className="h-8 rounded bg-white/10" />
              </div>
            </div>

            <span
              className={cn(
                "absolute -right-2 top-3 hidden translate-x-full whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim transition-opacity duration-500 sm:block",
                exploded ? "opacity-100" : "opacity-0",
              )}
            >
              {layer.label}
            </span>
          </div>
        ))}
      </div>

      {/* Interaction hints */}
      <div className="absolute bottom-0 left-0 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
        <span className="flex items-center gap-1.5">
          <MousePointer2 className="size-3" strokeWidth={2.4} aria-hidden="true" />
          Cursor parallax
        </span>
        <span className="flex items-center gap-1.5">
          <MoveVertical className="size-3" strokeWidth={2.4} aria-hidden="true" />
          Scroll depth
        </span>
      </div>
    </div>
  );
}
