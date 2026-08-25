import * as THREE from "three";

/**
 * The route registry.
 *
 * Every page is a place in one continuous 3D space rather than a separate
 * scene. The camera never cuts: navigating flies it from the vantage it is at
 * to the next one, and scrolling moves it within the vantage it has arrived at.
 *
 * Each route owns two camera keys — where it starts and where scrolling to the
 * bottom of the page takes it — so the global path is 12 control points long
 * and route `r` occupies u in [r/6, (r+1)/6].
 */

export type AccentName = "rigel" | "oxygen" | "nebula" | "ember";

export type RouteDef = {
  path: string;
  label: string;
  /** Short label for the nav's constellation node. */
  node: string;
  accent: AccentName;
  accentHex: string;
  /** Camera vantage on arrival, and where the page's scroll carries it. */
  entry: [number, number, number];
  exit: [number, number, number];
  aimEntry: [number, number, number];
  aimExit: [number, number, number];
  /** Where this route's 3D objects cluster. */
  anchor: [number, number, number];
};

/**
 * Colour is assigned by subject, not by position:
 *   rigel  — the brand and its story (Orion's belt stars are blue supergiants)
 *   oxygen — engineering and capability
 *   ember  — the work itself
 *   nebula — commercial pages, where the eye should be pulled hardest
 */
export const ROUTES: RouteDef[] = [
  {
    path: "/",
    label: "Home",
    node: "01",
    accent: "rigel",
    accentHex: "#9fc4ff",
    entry: [0, 0, 16],
    exit: [-6.5, -7.5, -14],
    aimEntry: [0, 0, 0],
    aimExit: [2.5, -6.0, -26],
    anchor: [0, -0.4, 0],
  },
  {
    path: "/services",
    label: "Services",
    node: "02",
    accent: "oxygen",
    accentHex: "#4fd8c4",
    entry: [14, -12, -34],
    exit: [4, -17, -50],
    aimEntry: [4, -12, -44],
    aimExit: [-4, -17, -60],
    anchor: [2, -14, -46],
  },
  {
    path: "/work",
    label: "Work",
    node: "03",
    accent: "ember",
    accentHex: "#ff9d5c",
    entry: [-15, -24, -66],
    exit: [-4, -30, -82],
    aimEntry: [-5, -25, -76],
    aimExit: [5, -30, -92],
    anchor: [-6, -26, -78],
  },
  {
    path: "/about",
    label: "About",
    node: "04",
    accent: "rigel",
    accentHex: "#9fc4ff",
    entry: [12, -37, -98],
    exit: [2, -42, -114],
    aimEntry: [2, -37, -108],
    aimExit: [-6, -42, -124],
    anchor: [1, -38, -110],
  },
  {
    path: "/pricing",
    label: "Pricing",
    node: "05",
    accent: "nebula",
    accentHex: "#e0678f",
    entry: [-13, -49, -130],
    exit: [-3, -55, -146],
    aimEntry: [-3, -50, -140],
    aimExit: [6, -55, -156],
    anchor: [-4, -51, -142],
  },
  {
    path: "/contact",
    label: "Contact",
    node: "06",
    accent: "nebula",
    accentHex: "#e0678f",
    entry: [10, -62, -162],
    exit: [0, -67, -178],
    aimEntry: [0, -62, -172],
    aimExit: [0, -68, -190],
    anchor: [0, -63, -174],
  },
];

export const ROUTE_COUNT = ROUTES.length;

const v = (t: [number, number, number]) => new THREE.Vector3(t[0], t[1], t[2]);

/** One continuous path through every route's entry and exit vantage. */
export const CAMERA_CURVE = new THREE.CatmullRomCurve3(
  ROUTES.flatMap((r) => [v(r.entry), v(r.exit)]),
  false,
  "catmullrom",
  0.35,
);

/** Aim path, kept independent so rotation leads and trails the translation. */
export const TARGET_CURVE = new THREE.CatmullRomCurve3(
  ROUTES.flatMap((r) => [v(r.aimEntry), v(r.aimExit)]),
  false,
  "catmullrom",
  0.35,
);

/** Normalised position on the global path for a route + its scroll progress. */
export function routeU(index: number, scroll: number): number {
  const clampedIndex = Math.max(0, Math.min(ROUTE_COUNT - 1, index));
  const clampedScroll = Math.max(0, Math.min(1, scroll));
  return (clampedIndex + clampedScroll) / ROUTE_COUNT;
}

export function routeIndexFor(pathname: string): number {
  // Longest match wins, so /work/case-study still resolves to /work.
  let best = 0;
  let bestLen = 0;
  ROUTES.forEach((r, i) => {
    const matches = r.path === "/" ? pathname === "/" : pathname.startsWith(r.path);
    if (matches && r.path.length >= bestLen) {
      best = i;
      bestLen = r.path.length;
    }
  });
  return best;
}

export function routeFor(pathname: string): RouteDef {
  return ROUTES[routeIndexFor(pathname)];
}

/**
 * Live camera position on the global path.
 *
 * `u` is tweened by GSAP during a navigation and driven by scroll otherwise,
 * so a route change and a scroll are the same kind of motion to the camera —
 * which is what stops navigation from feeling like a cut.
 */
export const routeState = {
  /** 0..1 along CAMERA_CURVE. */
  u: 0,
  /** Index of the route currently mounted. */
  index: 0,
  /** True while GSAP is flying between routes; scroll input is ignored then. */
  flying: false,
};

/** Accent RGB per route, for the 3D layer. */
export const ACCENT_RGB: Record<AccentName, [number, number, number]> = {
  rigel: [0.624, 0.769, 1.0],
  oxygen: [0.31, 0.847, 0.769],
  nebula: [0.878, 0.404, 0.561],
  ember: [1.0, 0.616, 0.361],
};

export const ACCENT_CLASS: Record<AccentName, string> = {
  rigel: "zone-rigel",
  oxygen: "zone-oxygen",
  nebula: "zone-nebula",
  ember: "zone-ember",
};
