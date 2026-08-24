/**
 * Which Orion colour belongs to which section.
 *
 * The DOM reads this to set its accent class; the WebGL scene reads the same
 * mapping as RGB triplets, so the light in the 3D layer and the accent in the
 * interface can never drift apart.
 */
export const ZONE_ACCENT_CLASS: Record<string, string> = {
  top: "zone-rigel",
  capabilities: "zone-oxygen",
  packages: "zone-nebula",
  process: "zone-ember",
  faq: "zone-oxygen",
  "site-footer": "zone-rigel",
};

/** The same six accents in linear-ish RGB, indexed by zone. */
export const ZONE_ACCENT_RGB: [number, number, number][] = [
  [0.624, 0.769, 1.0], // rigel   #9fc4ff
  [0.310, 0.847, 0.769], // oxygen #4fd8c4
  [0.878, 0.404, 0.561], // nebula #e0678f
  [1.0, 0.616, 0.361], // ember    #ff9d5c
  [0.310, 0.847, 0.769], // oxygen #4fd8c4
  [0.624, 0.769, 1.0], // rigel    #9fc4ff
];

/** Smoothly blends between zone accents for a fractional zone index. */
export function accentAt(zone: number): [number, number, number] {
  const n = ZONE_ACCENT_RGB.length;
  const clamped = Math.max(0, Math.min(n - 1, zone));
  const i = Math.floor(clamped);
  const j = Math.min(n - 1, i + 1);
  const t = clamped - i;
  const a = ZONE_ACCENT_RGB[i];
  const b = ZONE_ACCENT_RGB[j];
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}
