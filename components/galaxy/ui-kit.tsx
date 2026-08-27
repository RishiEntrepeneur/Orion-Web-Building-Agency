"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Boxes, Cpu, Feather, Gauge, Layers, LineChart, Menu, Radar, Sparkles, Waves, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SPRING } from "./motion";

/**
 * The one place the studio's contact details live.
 *
 * One constant, referenced by the form's mailto and by the contact card, so a
 * change of address is a change in one line rather than a search across the
 * site for the three places it got typed out.
 */
export const CONTACT = {
  email: "rishiorion2912@gmail.com",
  location: "United Kingdom",
  reply: "Within one working day",
};

export const ROUTES = [
  { path: "/", label: "Dream", index: "01" },
  { path: "/capabilities", label: "Craft", index: "02" },
  { path: "/work", label: "Work", index: "03" },
  { path: "/studio", label: "Studio", index: "04" },
  { path: "/contact", label: "Begin", index: "05" },
];

/* ========================================================================== */

export function Mono({ children, className = "", live = false }: { children: React.ReactNode; className?: string; live?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-mute ${className}`}>
      {live && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
        </span>
      )}
      {children}
    </span>
  );
}

/** Every button in the system. The fill wipes up from the base on hover. */
export function Btn({
  children, onClick, primary = false, icon,
}: { children: React.ReactNode; onClick?: () => void; primary?: boolean; icon?: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ y: -1, scale: 0.99 }}
      transition={SPRING}
      className={`group relative isolate inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[14px] font-medium tracking-tight ${
        primary
          ? "bg-ink text-cream shadow-[0_14px_34px_-14px_rgba(27,33,64,0.75)]"
          : "border border-ink/15 bg-cream/60 text-ink backdrop-blur-md"
      }`}
    >
      {!primary && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(0.2,0.65,0.3,0.9)] group-hover:scale-y-100"
        />
      )}
      <span className={primary ? "" : "transition-colors duration-500 group-hover:text-cream"}>{children}</span>
      {icon && (
        <span className={`transition-all duration-500 group-hover:translate-x-1 ${primary ? "" : "group-hover:text-cream"}`}>
          {icon}
        </span>
      )}
    </motion.button>
  );
}

/** A word that lifts letter by letter when you hover it. */
export function LiftWord({ word, className = "", delay = 0 }: { word: string; className?: string; delay?: number }) {
  return (
    <span className={`group/word inline-block ${className}`}>
      {word.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: "0.5em", rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SPRING, delay: delay + i * 0.035 }}
          whileHover={{ y: -10, transition: { type: "spring", mass: 0.4, stiffness: 240, damping: 12 } }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      whileHover={{ y: -8 }}
      transition={SPRING}
      className={`card group relative isolate overflow-hidden rounded-[26px] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(91,99,232,0.13), transparent 70%)" }}
      />
      {children}
    </motion.div>
  );
}
