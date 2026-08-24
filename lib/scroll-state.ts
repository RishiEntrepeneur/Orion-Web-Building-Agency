/**
 * Scroll singleton.
 *
 * Deliberately a plain mutable object rather than React state: it is written
 * every frame by Lenis and read every frame inside `useFrame`, and routing
 * either of those through React would re-render the whole tree at 120Hz.
 * Nothing here is reactive — components that need to re-render subscribe to
 * ScrollTrigger instead.
 */
export type ScrollState = {
  /** 0..1 progress through the whole document. */
  progress: number;
  /** Signed, normalised roughly -1..1. Positive is downward. */
  velocity: number;
  /** Fractional section index, e.g. 2.37 = 37% of the way from zone 2 to 3. */
  zone: number;
};

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  zone: 0,
};

/**
 * The spatial zones the camera flies through, in document order.
 * The ids must match the section elements rendered by app/page.tsx.
 */
export const ZONE_IDS = [
  "top",
  "capabilities",
  "packages",
  "process",
  "faq",
  "site-footer",
] as const;

export type ZoneId = (typeof ZONE_IDS)[number];
