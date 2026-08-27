"use client";

import { useSyncExternalStore } from "react";

/**
 * Renderer telemetry, published out of the canvas.
 *
 * An external store rather than state lifted into the layout: the canvas
 * reports every frame, and a layout that re-rendered on each report would
 * re-render every route in the tree sixty times a second to change a printed
 * frame rate. Subscribers are only notified when a value a human could read
 * has actually changed.
 */
export type Telemetry = { fps: number; steps: number; scale: number };

let current: Telemetry = { fps: 60, steps: 44, scale: 0.54 };
const subs = new Set<() => void>();

export function setTelemetry(next: Telemetry) {
  if (
    Math.round(next.fps) === Math.round(current.fps) &&
    next.steps === current.steps &&
    Math.round(next.scale * 100) === Math.round(current.scale * 100)
  ) return;
  current = next;
  for (const f of subs) f();
}

const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const snapshot = () => current;

export function useTelemetry(): Telemetry {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
