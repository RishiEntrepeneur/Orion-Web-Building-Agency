/**
 * Pointer singleton, shared by the WebGL shaders and the DOM cursor effects so
 * both read exactly the same smoothed value and never drift apart.
 *
 * Like scroll-state, this is intentionally non-reactive: it updates on every
 * pointermove and is sampled inside `useFrame`.
 */
export type PointerState = {
  /** Smoothed position in normalised device coords, -1..1, y up. */
  x: number;
  y: number;
  /** Raw target the smoothed value is chasing. */
  targetX: number;
  targetY: number;
  /** 0..1 speed, decays back to 0 when the pointer rests. */
  velocity: number;
  /** False until the device has produced a real pointer event. */
  active: boolean;
  /** True for coarse pointers (touch), where hover-driven effects are skipped. */
  coarse: boolean;
};

export const pointerState: PointerState = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  velocity: 0,
  active: false,
  coarse: false,
};

/**
 * Frame-rate-independent exponential smoothing.
 * `halfLife` is the time in seconds for the remaining distance to halve, so the
 * feel is identical at 30fps and 144fps — a fixed per-frame lerp factor is not.
 */
export function damp(current: number, target: number, halfLife: number, delta: number) {
  if (halfLife <= 0) return target;
  return target + (current - target) * Math.pow(2, -delta / halfLife);
}

let lastMoveTime = 0;
let lastX = 0;
let lastY = 0;

/** Feeds a raw client-space pointer position into the singleton. */
export function updatePointerTarget(clientX: number, clientY: number, now: number) {
  const nx = (clientX / window.innerWidth) * 2 - 1;
  const ny = -((clientY / window.innerHeight) * 2 - 1);

  const dt = Math.max(1, now - lastMoveTime);
  const dist = Math.hypot(nx - lastX, ny - lastY);
  // px/ms normalised into a 0..1 band; 0.004 ~= a brisk flick
  pointerState.velocity = Math.min(1, (dist / dt) / 0.004);

  pointerState.targetX = nx;
  pointerState.targetY = ny;
  pointerState.active = true;

  lastMoveTime = now;
  lastX = nx;
  lastY = ny;
}

/** Advances the smoothed pointer. Call once per frame. */
export function stepPointer(delta: number) {
  pointerState.x = damp(pointerState.x, pointerState.targetX, 0.08, delta);
  pointerState.y = damp(pointerState.y, pointerState.targetY, 0.08, delta);
  pointerState.velocity = damp(pointerState.velocity, 0, 0.12, delta);
}
