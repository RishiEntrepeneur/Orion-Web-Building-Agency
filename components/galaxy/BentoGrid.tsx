"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import { MonoLabel } from "./ui";
import { SPRING } from "./motion";

export type BentoItem = {
  icon: LucideIcon;
  title: string;
  body: string;
  meta: string;
  /** Column span at lg. The uneven spans are what make it a bento rather than a grid. */
  span?: string;
  /** Spotlight tint. Low alpha by design -- it is a light, not a fill. */
  accent?: string;
  /** Solid stroke for the generated diagram. Kept separate from `accent`:
      passing the spotlight's rgba here multiplies its alpha by the shape's
      own opacity and the drawing all but disappears. */
  stroke?: string;
  visual?: "orbit" | "wave" | "bars";
};

/**
 * The capability grid.
 *
 * Apple-style bento: unequal cells, one of them doing more work than the
 * others, each with its own small piece of generated artwork so the three
 * read as distinct objects rather than three copies of one card.
 */
export default function BentoGrid({ items }: { items: BentoItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-6">
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ ...SPRING, delay: i * 0.09 }}
          className={item.span ?? "lg:col-span-2"}
        >
          <SpotlightCard
            className="h-full"
            spotlight={item.accent ?? "rgba(99,102,241,0.16)"}
          >
            <div className="flex h-full min-h-[19rem] flex-col p-8 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <span
                  className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#FAFAFA] transition-colors duration-500 group-hover:border-white/25"
                  style={{ boxShadow: `0 0 34px -14px ${item.accent ?? "rgba(99,102,241,0.9)"}` }}
                >
                  <item.icon className="size-[18px]" strokeWidth={1.6} />
                </span>
                <ArrowUpRight
                  className="size-4 text-[#888888] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FAFAFA]"
                  strokeWidth={1.6}
                />
              </div>

              <BentoVisual kind={item.visual} accent={item.stroke} />

              <h3 className="mt-auto pt-8 text-2xl font-medium tracking-tight text-[#FAFAFA]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-[#888888]">
                {item.body}
              </p>
              <MonoLabel className="mt-7">{item.meta}</MonoLabel>
            </div>
          </SpotlightCard>
        </motion.div>
      ))}
    </div>
  );
}

/* Small generated diagrams. Inline SVG rather than images: they inherit the
   cell's accent, cost nothing to load, and stay sharp at any size. */
function BentoVisual({ kind, accent = "#6366F1" }: { kind?: BentoItem["visual"]; accent?: string }) {
  if (!kind) return null;

  if (kind === "orbit") {
    return (
      <svg viewBox="0 0 220 96" className="mt-8 w-full max-w-[15rem] overflow-visible" aria-hidden>
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            cx="110" cy="48" rx={34 + i * 26} ry={(34 + i * 26) * 0.38}
            fill="none" stroke={accent} strokeWidth="1.25"
            opacity={0.72 - i * 0.16}
            style={{ transformOrigin: "110px 48px", transform: `rotate(${i * 26}deg)` }}
          />
        ))}
        <circle cx="110" cy="48" r="4.5" fill={accent} />
        <circle cx="176" cy="35" r="2.5" fill="#FAFAFA" opacity="0.95" />
        <circle cx="52" cy="62" r="2" fill={accent} opacity="0.9" />
      </svg>
    );
  }

  if (kind === "wave") {
    return (
      <svg viewBox="0 0 220 96" className="mt-8 w-full max-w-[15rem]" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={Array.from({ length: 45 }).map((__, k) => {
              const x = (k / 44) * 220;
              const y = 48 + Math.sin(k / 6 + i * 0.6) * (7 + i * 1.6) + (i - 3) * 6;
              return `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join(" ")}
            fill="none" stroke={accent} strokeWidth="1.25"
            opacity={0.78 - Math.abs(i - 3) * 0.16}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 96" className="mt-8 w-full max-w-[15rem]" aria-hidden>
      {[26, 44, 38, 62, 54, 80, 72].map((h, i) => (
        <rect
          key={i}
          x={i * 31} y={92 - h} width="16" height={h} rx="3"
          fill={accent} opacity={0.34 + i * 0.09}
        />
      ))}
      <line x1="0" y1="92" x2="220" y2="92" stroke="#FAFAFA" strokeWidth="1" opacity="0.16" />
    </svg>
  );
}
