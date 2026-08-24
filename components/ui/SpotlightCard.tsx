"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** Accent colour of the cursor spotlight. */
  glow?: "cyan" | "violet" | "magenta";
  as?: "div" | "li" | "article";
};

const glowColors = {
  cyan: "rgba(56,242,255,0.16)",
  violet: "rgba(139,92,246,0.18)",
  magenta: "rgba(255,47,179,0.16)",
} as const;

const borderGlow = {
  cyan: "hover:border-neon-cyan/45 hover:shadow-[0_28px_70px_-30px_rgba(56,242,255,0.75)]",
  violet:
    "hover:border-neon-violet/45 hover:shadow-[0_28px_70px_-30px_rgba(139,92,246,0.75)]",
  magenta:
    "hover:border-neon-magenta/45 hover:shadow-[0_28px_70px_-30px_rgba(255,47,179,0.75)]",
} as const;

/**
 * Glass card that tracks the cursor and paints a soft radial spotlight beneath
 * the content. Position is written to CSS custom properties directly on the
 * node, so pointer movement never triggers a React render.
 */
export default function SpotlightCard({
  children,
  className,
  glow = "cyan",
  as: Tag = "div",
}: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
    node.style.setProperty("--spot-opacity", "1");
  };

  const handlePointerLeave = () => {
    ref.current?.style.setProperty("--spot-opacity", "0");
  };

  return (
    <Tag
      ref={ref as never}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "group/card relative isolate overflow-hidden rounded-2xl border border-hairline glass-panel",
        "transition-all duration-500 ease-out hover:-translate-y-1",
        borderGlow[glow],
        className,
      )}
    >
      {/* Cursor spotlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[var(--spot-opacity,0)] transition-opacity duration-500"
        style={{
          background: `radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${glowColors[glow]}, transparent 68%)`,
        }}
      />

      {/* Top hairline highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent"
      />

      {children}
    </Tag>
  );
}
