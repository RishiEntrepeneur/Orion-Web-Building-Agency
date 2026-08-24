"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/pointer-state";

/**
 * Cursor-driven 3D tilt.
 *
 * The element leans away from the pointer as though it were a physical panel
 * being pressed at one corner, and a specular sheen tracks the same position.
 * Written straight to style inside a rAF loop, so hovering never re-renders.
 *
 * Returns a ref for the tiltable element. Inert on coarse pointers and under
 * reduced motion.
 */
export function useTilt<T extends HTMLElement = HTMLElement>({
  max = 6,
  scale = 1.012,
  enabled = true,
}: { max?: number; scale?: number; enabled?: boolean } = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    const cur = { rx: 0, ry: 0, s: 1 };
    const tgt = { rx: 0, ry: 0, s: 1 };
    let frame = 0;
    let last = performance.now();

    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (event.clientX - r.left) / r.width - 0.5;
      const ny = (event.clientY - r.top) / r.height - 0.5;
      tgt.ry = nx * max;
      tgt.rx = -ny * max;
      tgt.s = scale;
      el.style.setProperty("--tilt-x", `${(nx * 100 + 50).toFixed(1)}%`);
      el.style.setProperty("--tilt-y", `${(ny * 100 + 50).toFixed(1)}%`);
    };

    const onLeave = () => {
      tgt.rx = tgt.ry = 0;
      tgt.s = 1;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cur.rx = damp(cur.rx, tgt.rx, 0.07, dt);
      cur.ry = damp(cur.ry, tgt.ry, 0.07, dt);
      cur.s = damp(cur.s, tgt.s, 0.07, dt);
      el.style.transform = `perspective(1100px) rotateX(${cur.rx.toFixed(3)}deg) rotateY(${cur.ry.toFixed(3)}deg) scale(${cur.s.toFixed(4)})`;
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, [max, scale, enabled]);

  return ref;
}
