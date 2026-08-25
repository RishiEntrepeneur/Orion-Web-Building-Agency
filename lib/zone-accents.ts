import { ACCENT_RGB, ROUTES, ROUTE_COUNT } from "./routes";

/**
 * Accent colour as a function of position on the global camera path.
 *
 * Blended across route boundaries so a navigation reads as light changing in
 * one continuous space rather than a palette swap. The DOM and the 3D layer
 * both read this, so the accent in the interface and the light in the scene
 * are always the same colour.
 */
export function accentAt(u: number): [number, number, number] {
  const scaled = Math.max(0, Math.min(1, u)) * ROUTE_COUNT;
  const i = Math.min(ROUTE_COUNT - 1, Math.floor(scaled));
  const j = Math.min(ROUTE_COUNT - 1, i + 1);
  const local = scaled - i;

  // Hold each route's colour through most of its span and cross-fade only near
  // the boundary, so a page has a settled identity rather than a constant drift.
  const blend = local < 0.72 ? 0 : (local - 0.72) / 0.28;
  const a = ACCENT_RGB[ROUTES[i].accent];
  const b = ACCENT_RGB[ROUTES[j].accent];
  return [
    a[0] + (b[0] - a[0]) * blend,
    a[1] + (b[1] - a[1]) * blend,
    a[2] + (b[2] - a[2]) * blend,
  ];
}
