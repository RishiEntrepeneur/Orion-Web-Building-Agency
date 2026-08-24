"use client";

import { useEffect, useRef, useState } from "react";
import { damp } from "@/lib/pointer-state";

/**
 * Spatial crosshair.
 *
 * A viewport-wide targeting reticle that tracks the pointer: two edges
 * crossing the full viewport, a machined square reticle at the intersection,
 * and a live coordinate readout. Over an interactive element the reticle opens
 * and locks on.
 *
 * Mounted only for fine pointers with motion enabled — on touch, or with
 * reduced motion, it renders nothing at all rather than a dead overlay.
 */
export default function SpatialCrosshair() {
  const [enabled, setEnabled] = useState(false);
  const hRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && !still.matches);
    sync();
    fine.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const h = hRef.current;
    const v = vRef.current;
    const reticle = reticleRef.current;
    const readout = readoutRef.current;
    if (!h || !v || !reticle || !readout) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2, lock: 0 };
    const current = { ...target };
    let frame = 0;
    let last = performance.now();
    let visible = false;

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;

      const el = document.elementFromPoint(event.clientX, event.clientY);
      const interactive = el?.closest(
        'a[href], button:not([disabled]), input, [role="img"][tabindex], summary',
      );
      target.lock = interactive ? 1 : 0;

      if (!visible) {
        visible = true;
        for (const node of [h, v, reticle, readout.parentElement!]) {
          node.style.opacity = "1";
        }
      }
    };

    const onLeave = () => {
      visible = false;
      for (const node of [h, v, reticle, readout.parentElement!]) {
        node.style.opacity = "0";
      }
    };

    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Hairlines track almost instantly; the reticle lags slightly for weight.
      current.x = damp(current.x, target.x, 0.02, delta);
      current.y = damp(current.y, target.y, 0.02, delta);
      current.lock = damp(current.lock, target.lock, 0.06, delta);

      h.style.transform = `translate3d(0, ${current.y.toFixed(1)}px, 0)`;
      v.style.transform = `translate3d(${current.x.toFixed(1)}px, 0, 0)`;

      const size = 18 + current.lock * 26;
      reticle.style.transform = `translate3d(${(current.x - size / 2).toFixed(1)}px, ${(current.y - size / 2).toFixed(1)}px, 0) rotate(${(current.lock * 45).toFixed(2)}deg)`;
      reticle.style.width = `${size.toFixed(1)}px`;
      reticle.style.height = `${size.toFixed(1)}px`;
      reticle.style.borderColor = `rgba(255,255,255,${(0.28 + current.lock * 0.6).toFixed(3)})`;

      const parent = readout.parentElement!;
      parent.style.transform = `translate3d(${(current.x + 22).toFixed(1)}px, ${(current.y + 18).toFixed(1)}px, 0)`;
      readout.textContent = `${String(Math.round(target.x)).padStart(4, "0")} ${String(Math.round(target.y)).padStart(4, "0")}`;

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] hidden lg:block">
      <div
        ref={hRef}
        className="absolute left-0 top-0 h-px w-full opacity-0 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.13) 22%, rgba(255,255,255,0.13) 78%, transparent)",
        }}
      />
      <div
        ref={vRef}
        className="absolute left-0 top-0 h-full w-px opacity-0 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.13) 22%, rgba(255,255,255,0.13) 78%, transparent)",
        }}
      />
      <div
        ref={reticleRef}
        className="absolute left-0 top-0 border opacity-0 transition-opacity duration-500"
        style={{ borderColor: "rgba(255,255,255,0.28)" }}
      />
      <div className="absolute left-0 top-0 opacity-0 transition-opacity duration-500">
        <span
          ref={readoutRef}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 tabular-nums"
        />
      </div>
    </div>
  );
}
