"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/pointer-state";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  /** Unique suffix for gradient/filter ids — the mark renders more than once
      per document and duplicate ids are invalid HTML. */
  instanceId: string;
};

/**
 * Orion's Belt.
 *
 * The three aligned supergiants — Alnitak, Alnilam, Mintaka — at their true
 * relative spacing and magnitudes: Alnilam, the centre star, is the brightest
 * of the three and sits fractionally off the midpoint, which is exactly what
 * makes the real belt recognisable rather than a tidy row of dots.
 *
 * Each star drifts toward the cursor by a different amount, so the asterism
 * parallaxes as though the three lay at different depths — which they do.
 */

/* x/y in a 44-unit box, r = relative magnitude. Alnilam is the anchor. */
const BELT = [
  { id: "mintaka", x: 9.5, y: 29.5, r: 2.5, depth: 1.0 },
  { id: "alnilam", x: 21.5, y: 22.5, r: 3.4, depth: 0.55 },
  { id: "alnitak", x: 33.5, y: 16.5, r: 2.9, depth: 1.45 },
] as const;

export default function LogoMark({ className, instanceId }: LogoMarkProps) {
  const glow = `orion-glow-${instanceId}`;
  const core = `orion-core-${instanceId}`;
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    const stars = BELT.map((s) =>
      svg.querySelector<SVGGElement>(`[data-star="${s.id}"]`),
    );
    const cur = { x: 0, y: 0 };
    const tgt = { x: 0, y: 0 };
    let frame = 0;
    let last = performance.now();

    const onMove = (event: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const dx = event.clientX - (r.left + r.width / 2);
      const dy = event.clientY - (r.top + r.height / 2);
      const reach = 150;
      const dist = Math.hypot(dx, dy);
      if (dist > reach) {
        tgt.x = tgt.y = 0;
        return;
      }
      const eased = (1 - dist / reach) ** 2;
      tgt.x = (dx / reach) * 3.4 * eased;
      tgt.y = (dy / reach) * 3.4 * eased;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cur.x = damp(cur.x, tgt.x, 0.08, dt);
      cur.y = damp(cur.y, tgt.y, 0.08, dt);
      stars.forEach((node, i) => {
        if (!node) return;
        const d = BELT[i].depth;
        node.setAttribute(
          "transform",
          `translate(${(cur.x * d).toFixed(2)} ${(cur.y * d).toFixed(2)})`,
        );
      });
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center sm:size-11",
        className,
      )}
    >
      <svg ref={ref} viewBox="0 0 44 44" className="size-full overflow-visible" fill="none">
        <defs>
          <radialGradient id={glow}>
            <stop offset="0%" stopColor="var(--accent, #9fc4ff)" stopOpacity="0.9" />
            <stop offset="45%" stopColor="var(--accent, #9fc4ff)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent, #9fc4ff)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={core}>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="100%" stopColor="var(--accent, #9fc4ff)" stopOpacity="0.75" />
          </radialGradient>
        </defs>

        {/* The belt line — drawn faintly, the way an asterism is charted. */}
        <line
          x1={BELT[0].x}
          y1={BELT[0].y}
          x2={BELT[2].x}
          y2={BELT[2].y}
          stroke="var(--accent, #9fc4ff)"
          strokeOpacity="0.28"
          strokeWidth="0.75"
          strokeLinecap="round"
        />

        {BELT.map((star) => (
          <g key={star.id} data-star={star.id}>
            <circle cx={star.x} cy={star.y} r={star.r * 3.1} fill={`url(#${glow})`} />
            <circle cx={star.x} cy={star.y} r={star.r} fill={`url(#${core})`} />
            {/* Diffraction spikes: what makes a point of light read as a star
                rather than as a dot. */}
            <path
              d={`M${star.x - star.r * 3.6} ${star.y} H${star.x + star.r * 3.6}
                  M${star.x} ${star.y - star.r * 3.6} V${star.y + star.r * 3.6}`}
              stroke="#ffffff"
              strokeOpacity="0.5"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </span>
  );
}
