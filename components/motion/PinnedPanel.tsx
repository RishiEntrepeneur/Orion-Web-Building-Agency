"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

type PinnedPanelProps = {
  children: ReactNode;
  className?: string;
  /** How long the section holds, as a multiple of viewport height. */
  hold?: number;
  /** How far back in z the panel starts, in px. */
  depth?: number;
};

/**
 * Section pinning with a z-space approach and departure.
 *
 * While the section is pinned the page keeps scrolling but the panel stays put,
 * travelling instead through z: it arrives from far behind the screen plane,
 * settles at rest in the middle of the hold, then continues past the camera and
 * dissolves. The 3D objects behind it keep pivoting on the same scroll, so the
 * panel reads as a physical plane suspended in the scene rather than a div.
 *
 * Disabled below `lg` and under reduced motion: pinning on a phone hijacks the
 * scroll for a full viewport at a time, which is disorienting on a small screen
 * and fights native momentum.
 */
export default function PinnedPanel({
  children,
  className,
  hold = 0.85,
  depth = 620,
}: PinnedPanelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)": () => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: wrap,
              start: "top top+=72",
              end: () => `+=${window.innerHeight * hold}`,
              pin: true,
              pinSpacing: true,
              // `scrub: 1` gives the panel a touch of lag behind the scroll,
              // which is what makes it feel like it has mass.
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .fromTo(
              panel,
              { z: -depth, scale: 0.86, opacity: 0.35, rotateX: 7 },
              { z: 0, scale: 1, opacity: 1, rotateX: 0, ease: "power2.out", duration: 0.55 },
            )
            .to(panel, { duration: 0.15 })
            .to(panel, {
              z: depth * 0.55,
              scale: 1.1,
              opacity: 0,
              rotateX: -5,
              ease: "power2.in",
              duration: 0.4,
            });
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, [hold, depth]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Perspective must live on the parent, not the animated element, or the
          z translation is a flat scale with no foreshortening. */}
      <div style={{ perspective: "1400px", perspectiveOrigin: "50% 42%" }}>
        <div ref={panelRef} style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
