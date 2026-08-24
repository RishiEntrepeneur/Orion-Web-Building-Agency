"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState, ZONE_IDS } from "@/lib/scroll-state";
import { registerLenis } from "@/lib/scroll-lock";

/**
 * Inertial scrolling, and the single source of scroll truth.
 *
 * Three things have to agree about "where are we": Lenis (which owns the
 * actual scroll position), ScrollTrigger (which fires the pins and timelines),
 * and the WebGL camera. They are wired in one direction only —
 *
 *     gsap.ticker  ->  lenis.raf()  ->  lenis 'scroll'  ->  ScrollTrigger.update()
 *
 * — so there is exactly one rAF loop on the page and no chance of the two
 * animation systems stepping on each other. Running Lenis on its own rAF while
 * ScrollTrigger runs on gsap's is the classic cause of jitter here.
 *
 * Under prefers-reduced-motion Lenis is never constructed: native scrolling is
 * restored by globals.css and ScrollTrigger drives itself as normal.
 */
export default function LenisProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Still publish scroll progress so the camera tracks, just without
      // smoothing or any of the pinning theatrics.
      const onScroll = () => writeScrollState(window.scrollY, 0);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // ~1.05s to settle: long enough to feel weighty and cinematic, short
      // enough that a deliberate flick still lands where the user expects.
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.4),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      // Touch is left native. Smoothing it fights the platform's own
      // momentum and always feels wrong on iOS.
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    registerLenis(lenis);

    const onLenisScroll = () => {
      writeScrollState(lenis.scroll, lenis.velocity);
      ScrollTrigger.update();
    };
    lenis.on("scroll", onLenisScroll);

    // gsap drives Lenis, not the other way round.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* No scrollerProxy here on purpose. Lenis in its default mode scrolls the
       window itself, so ScrollTrigger's normal window measurements are already
       correct. Installing a proxy in that configuration double-counts the
       smoothing offset and makes pinned sections drift. A proxy is only needed
       when Lenis is given a custom wrapper element. */

    let disposed = false;

    const refresh = () => {
      if (disposed) return;
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", refresh);

    // Fonts landing late changes every measurement ScrollTrigger has taken.
    // This promise can settle after unmount, so it must check first — calling
    // refresh() on a destroyed instance throws.
    document.fonts?.ready.then(() => {
      if (!disposed) ScrollTrigger.refresh();
    });

    onLenisScroll();
    ScrollTrigger.refresh();

    return () => {
      disposed = true;
      window.removeEventListener("resize", refresh);
      lenis.off("scroll", onLenisScroll);
      gsap.ticker.remove(raf);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}

/**
 * Publishes progress, normalised velocity and the fractional zone index.
 *
 * `zone` is measured from the real section elements rather than from a fixed
 * fraction of the page, so the camera stays locked to the content even as
 * sections change height across breakpoints.
 */
function writeScrollState(scroll: number, velocity: number) {
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  scrollState.progress = Math.min(1, Math.max(0, scroll / max));
  // 40 px/frame is a hard flick; clamp so a trackpad fling cannot spike this.
  scrollState.velocity = Math.max(-1, Math.min(1, velocity / 40));

  const midline = scroll + window.innerHeight * 0.5;
  const tops: number[] = [];
  for (const id of ZONE_IDS) {
    const el = document.getElementById(id);
    tops.push(el ? el.getBoundingClientRect().top + scroll : Number.NaN);
  }

  /* One slot per ZONE_ID is kept even when a section is absent, so the index
     here is always the true zone index. Compacting the array instead would
     silently shift every later section onto the wrong vantage point. */
  let zone = 0;
  for (let i = 0; i < tops.length; i++) {
    const start = tops[i];
    if (!Number.isFinite(start) || midline < start) continue;

    // Look ahead past any missing sections for the next real boundary.
    let next = doc.scrollHeight;
    for (let j = i + 1; j < tops.length; j++) {
      if (Number.isFinite(tops[j])) {
        next = tops[j];
        break;
      }
    }

    const span = Math.max(1, next - start);
    zone = i + Math.min(1, (midline - start) / span);
  }
  scrollState.zone = Number.isFinite(zone) ? zone : 0;
}
