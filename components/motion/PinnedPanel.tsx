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

          /* Timing is weighted toward the settled hold rather than the travel.
             The approach and departure are what make the panel feel physical,
             but they are also the only moments its text is hard to read, so
             they are kept short and never fade far enough to be illegible. */
          timeline
            .fromTo(
              panel,
              { z: -depth, scale: 0.9, opacity: 0.55, rotateX: 6 },
              { z: 0, scale: 1, opacity: 1, rotateX: 0, ease: "power2.out", duration: 0.34 },
            )
            .to(panel, { duration: 0.42 })
            .to(panel, {
              z: depth * 0.5,
              scale: 1.08,
              opacity: 0.2,
              rotateX: -4,
              ease: "power2.in",
              duration: 0.24,
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
