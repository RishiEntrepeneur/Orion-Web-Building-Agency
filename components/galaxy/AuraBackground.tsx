"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { SPRING } from "./motion";

/**
 * The ground.
 *
 * Four layers, all additive over pure black:
 *   1. Three slow mesh-gradient blooms that drift on independent cycles, so
 *      the field is never a flat colour and never visibly loops.
 *   2. A cursor-tracked aura, sprung rather than tied directly to the pointer
 *      so it trails the hand with weight instead of snapping to it.
 *   3. A fine grid, masked to fade toward the edges of the frame.
 *   4. Film grain, which is what stops large soft gradients banding into
 *      visible steps on an 8-bit display -- banding is what makes an
 *      expensive gradient look cheap.
 *
 * Everything here is decorative and inert to the pointer.
 */
export default function AuraBackground() {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.35);

  // The aura lags the cursor. A direct binding reads as a sticker glued to the
  // pointer; a spring reads as light with mass behind it.
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const left = useTransform(sx, (v) => `${v * 100}%`);
  const top = useTransform(sy, (v) => `${v * 100}%`);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX / window.innerWidth);
      y.set(event.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030303]">
      {/* Mesh blooms */}
      <motion.div
        className="absolute -left-[18vw] -top-[22vw] h-[70vw] w-[70vw] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle at 40% 40%, rgba(99,102,241,0.55), transparent 62%)" }}
        animate={{ x: ["0%", "9%", "0%"], y: ["0%", "6%", "0%"], scale: [1, 1.14, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[14vw] top-[16vh] h-[58vw] w-[58vw] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle at 60% 40%, rgba(6,182,212,0.5), transparent 64%)" }}
        animate={{ x: ["0%", "-11%", "0%"], y: ["0%", "-7%", "0%"], scale: [1.08, 1, 1.08] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-26vw] left-[10vw] h-[64vw] w-[64vw] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(217,70,239,0.34), transparent 66%)" }}
        animate={{ x: ["0%", "7%", "0%"], y: ["0%", "-9%", "0%"], scale: [1, 1.1, 1] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cursor aura */}
      <motion.div
        style={{
          left,
          top,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(6,182,212,0.14) 38%, transparent 68%)",
        }}
        className="absolute h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px]"
      />

      {/* Grid, faded toward the frame edges */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(78% 62% at 50% 40%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(78% 62% at 50% 40%, #000 30%, transparent 100%)",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />

      {/* Vignette, so the type always has a darker ground than the blooms */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_28%,rgba(3,3,3,0.82)_100%)]" />
    </div>
  );
}
