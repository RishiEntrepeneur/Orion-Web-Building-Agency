"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { routeIndexFor, routeState, routeU } from "@/lib/routes";
import { scrollState } from "@/lib/scroll-state";

/**
 * Flies the camera between routes.
 *
 * The canvas lives in the root layout and never unmounts, so a navigation is
 * not a scene change — it is a move. When the pathname changes, GSAP tweens the
 * camera's position along the same global path that scrolling drives, from
 * wherever it currently is to the new route's arrival vantage.
 *
 * While that tween is running, `routeState.flying` tells the scroll driver to
 * keep its hands off, otherwise the landing scroll position would fight the
 * tween and the camera would stutter on arrival.
 */
export default function RouteTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const index = routeIndexFor(pathname);
    routeState.index = index;

    // On first mount, be where the route says without animating in from 0.
    if (first.current) {
      first.current = false;
      routeState.u = routeU(index, 0);
      return;
    }

    const destination = routeU(index, 0);
    const distance = Math.abs(destination - routeState.u);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      routeState.u = destination;
      routeState.flying = false;
      return;
    }

    tween.current?.kill();
    routeState.flying = true;

    // Longer hops take longer, but sub-linearly — a trip across the whole path
    // should feel like a journey, not like waiting.
    const duration = 1.05 + Math.min(1.5, Math.sqrt(distance) * 2.1);

    tween.current = gsap.to(routeState, {
      u: destination,
      duration,
      ease: "power2.inOut",
      onComplete: () => {
        routeState.flying = false;
        // Hand back to scroll at whatever position the new page landed on.
        routeState.u = routeU(routeState.index, scrollState.progress);
      },
    });

    return () => {
      tween.current?.kill();
      routeState.flying = false;
    };
  }, [pathname]);

  return null;
}
