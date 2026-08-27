"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import BorderBeam from "./BorderBeam";
import { SPRING } from "./motion";

/** The tiny uppercase metadata line the whole system is annotated with. */
export function MonoLabel({
  children,
  className = "",
  dot = false,
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-[#888888] ${className}`}
    >
      {dot && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#06B6D4] opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[#06B6D4]" />
        </span>
      )}
      {children}
    </span>
  );
}

/** Primary action. The beam is what makes it read as lit rather than filled. */
export function BeamButton({
  children,
  href = "#",
  variant = "primary",
  icon,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const primary = variant === "primary";
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      className={`group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 py-4 text-sm font-medium tracking-tight will-change-transform ${
        primary
          ? "bg-white text-[#030303] shadow-[0_0_50px_-12px_rgba(99,102,241,0.9)]"
          : "border border-white/12 bg-white/[0.03] text-[#FAFAFA] backdrop-blur-xl"
      }`}
    >
      <BorderBeam duration={primary ? 5 : 7} />
      <span className="relative z-10">{children}</span>
      {icon && (
        <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </motion.a>
  );
}

/** Section wrapper. All the whitespace in the system is decided here. */
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

/** Eyebrow + massive tracking-tight heading, the pairing used on every page. */
export function SectionHead({
  label,
  title,
  lede,
}: {
  label: string;
  title: ReactNode;
  lede?: string;
}) {
  return (
    <div className="max-w-3xl">
      <MonoLabel dot>{label}</MonoLabel>
      <h2 className="mt-7 text-balance text-4xl font-medium leading-[0.95] tracking-tighter text-[#FAFAFA] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-[#888888] sm:text-lg">
          {lede}
        </p>
      )}
    </div>
  );
}
