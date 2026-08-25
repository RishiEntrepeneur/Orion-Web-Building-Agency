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
  /** Scales particle and constellation counts at mount. */
  density: 1,
};

/**
 * Static device tiering, read once before the scene is built.
 *
 * `PerformanceMonitor` reacts to frames that have already been dropped; this
 * runs first so a low-tier device never has to drop them to be found out.
 * The signals are deliberately coarse and widely supported — a precise GPU
 * probe is not worth an extra context on a phone.
 */
export function detectDensity(): number {
  if (typeof window === "undefined" || typeof navigator === "undefined") return 1;

  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 820;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

  if (saveData) return 0.25;

  let density = 1;
  if (cores <= 4) density -= 0.35;
  if (memory <= 4) density -= 0.25;
  if (coarse && narrow) density -= 0.2;

  return Math.max(0.22, Math.min(1, density));
}

/** Target intensity for the current tier, honouring reduced motion. */
export function targetIntensity(still: boolean): number {
  if (still) return 0.35; // a quiet, near-static ground rather than nothing
  return qualityState.tier === "high" ? 1 : 0.55;
}
