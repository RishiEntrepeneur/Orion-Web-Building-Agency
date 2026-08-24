/**
 * Cheap, cached WebGL2 capability probe.
 *
 * Runs once, disposes its own context immediately, and is safe to call during
 * render on the client. Returns false during SSR so the server never emits a
 * canvas the client might not be able to fill.
 */
let cached: boolean | null = null;

export function supportsWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    cached = Boolean(gl);
    // Release the probe context straight away — browsers cap concurrent contexts.
    const lose = (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  } catch {
    cached = false;
  }

  return cached;
}

/** True when the user has asked for reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
