"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/pointer-state";

type MagneticOptions = {
  /** How far outside the element the field reaches, in px. */
  radius?: number;
  /** Peak displacement of the element, in px. */
  pull?: number;
  /** Extra displacement applied to the inner label, for parallax. */
  labelPull?: number;
  enabled?: boolean;
};

/**
 * Magnetic pointer attraction.
 *
 * Returns two refs: one for the control, one for its label. Both are written
 * directly in a rAF loop rather than through React state, so a pointer moving
 * across the page never triggers a render.
 *
 * The element also publishes a `--magnet` custom property (0..1 proximity),
 * which lets CSS drive the specular response without any extra JS.
 *
 * Inert on coarse pointers and under reduced motion — the control then behaves
 * as an ordinary button with no listeners attached at all.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>({
  radius = 120,
  pull = 12,
  labelPull = 20,
  enabled = true,
}: MagneticOptions = {}) {
  const hostRef = useRef<T>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    const current = { x: 0, y: 0, strength: 0 };
    const target = { x: 0, y: 0, strength: 0 };
    let frame = 0;
    let last = performance.now();

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const reach = Math.max(rect.width, rect.height) / 2 + radius;
      const dist = Math.hypot(dx, dy);

      if (dist > reach) {
        target.x = target.y = target.strength = 0;
        return;
      }

      // Squared falloff keeps the edge of the field soft rather than a step.
      const eased = (1 - dist / reach) ** 2;
      target.x = (dx / reach) * pull * 2 * eased;
      target.y = (dy / reach) * pull * 2 * eased;
      target.strength = eased;
    };

    const release = () => {
      target.x = target.y = target.strength = 0;
    };

    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;

      current.x = damp(current.x, target.x, 0.07, delta);
      current.y = damp(current.y, target.y, 0.07, delta);
      current.strength = damp(current.strength, target.strength, 0.07, delta);

      host.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
      host.style.setProperty("--magnet", current.strength.toFixed(3));

      const label = labelRef.current;
      if (label) {
        const extra = (labelPull - pull) / Math.max(pull, 0.001);
        label.style.transform = `translate3d(${(current.x * extra).toFixed(2)}px, ${(current.y * extra).toFixed(2)}px, 0)`;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", release);
    document.addEventListener("pointerleave", release);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", release);
      document.removeEventListener("pointerleave", release);
      host.style.transform = "";
      host.style.removeProperty("--magnet");
      if (labelRef.current) labelRef.current.style.transform = "";
    };
  }, [radius, pull, labelPull, enabled]);

  return { hostRef, labelRef };
}
