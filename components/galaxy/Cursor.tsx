"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer ring.
 *
 * A second, lagging ring behind the real cursor that swells and snaps onto
 * anything interactive. Written straight to a transform on each frame rather
 * than through React state, because a cursor that re-renders a component tree
 * on every mousemove is the most expensive possible way to draw a circle.
 *
 * Disabled outright for coarse pointers and for reduced motion: there is no
 * cursor to decorate on a touchscreen, and a trailing ring is exactly the kind
 * of motion people switch off.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ring.current;
    if (!el) return;

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;
    let scale = 1, tScale = 1;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;

      // Snap to the centre of anything that declares itself interactive, so
      // the ring reads as locking on rather than merely passing over.
      const target = (e.target as HTMLElement)?.closest?.(
        "a, button, input, textarea, [role='option'], [data-magnetic]",
      ) as HTMLElement | null;

      if (target) {
        const r = target.getBoundingClientRect();
        if (r.width < 260 && r.height < 120) {
          tx = r.left + r.width / 2;
          ty = r.top + r.height / 2;
          tScale = Math.max(r.width, r.height) / 34;
        } else {
          tScale = 1.9;
        }
      } else {
        tScale = 1;
      }
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      scale += (tScale - scale) * 0.16;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      el.style.opacity = tScale > 1.05 ? "0.42" : "0.9";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    el.style.opacity = "0.9";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      style={{ opacity: 0 }}
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden size-[34px] rounded-full border border-ink/40 transition-opacity duration-300 lg:block"
    />
  );
}
