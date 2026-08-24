/**
 * Render-quality singleton.
 *
 * `PerformanceMonitor` flips `tier` down when the measured frame rate sags.
 * Scene components read it inside `useFrame` and fade their most expensive
 * layers out through the shared `uIntensity` uniform, rather than unmounting
 * geometry mid-scroll (which would cause a visible pop and a GPU stall).
 */
export type QualityTier = "high" | "low";

export const qualityState = {
  tier: "high" as QualityTier,
  /** 0..1 master multiplier applied to every shader's uIntensity. */
  intensity: 1,
};

/** Target intensity for the current tier, honouring reduced motion. */
export function targetIntensity(still: boolean): number {
  if (still) return 0.35; // a quiet, near-static ground rather than nothing
  return qualityState.tier === "high" ? 1 : 0.55;
}
