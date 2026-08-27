"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { SPRING } from "./motion";

/**
 * A card with a light mask that tracks the cursor.
 *
 * The position is held in motion values rather than React state: a pointermove
 * handler that calls setState re-renders the whole card on every mouse
 * movement, which is how a spotlight effect ends up costing more than the rest
 * of the page put together. These write straight to the compositor.
 *
 * The lift on hover is the house spring, so the card feels like something
 * being picked up rather than a rectangle changing size.
 */
export default function SpotlightCard({
  children,
  className = "",
  spotlight = "rgba(99,102,241,0.16)",
}: {
  children: ReactNode;
  className?: string;
  spotlight?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);

  const mask = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, ${spotlight}, transparent 72%)`;

  return (
    <motion.div
      ref={ref}
      onPointerMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set(event.clientX - rect.left);
        my.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        mx.set(-9999);
        my.set(-9999);
      }}
      whileHover={{ y: -6 }}
      transition={SPRING}
      className={`group relative isolate overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl transition-colors duration-500 hover:border-white/20 ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: mask }}
      />
      {/* A hairline of light along the top edge, brighter where the cursor is. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
