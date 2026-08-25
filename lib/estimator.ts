/**
 * The pricing model, shared by the calculator on /pricing and the estimator on
 * /contact.
 *
 * One module so the two can never quote different numbers for the same
 * configuration — which is the usual failure when a "get a quote" form is built
 * separately from the pricing page.
 */

export type PackageId = "starter" | "cinematic" | "retainer";

export type Package = {
  id: PackageId;
  name: string;
  base: number;
  /** Retainer is billed monthly; the others are one-off. */
  recurring: boolean;
  blurb: string;
  includes: string[];
  /** Pages bundled before per-page pricing applies. */
  includedPages: number;
  featured?: boolean;
};

export const PACKAGES: Package[] = [
  {
    id: "starter",
    name: "Starter Concept",
    base: 299,
    recurring: false,
    blurb: "A single-page immersive statement piece for brands that need presence fast.",
    includedPages: 1,
    includes: [
      "Single-page immersive spatial layout",
      "3D asset placeholder embed",
      "Basic AI copy engine setup",
      "Mobile-first responsive build to 320px",
      "Enquiry form with spam protection",
      "Deployed to global edge hosting",
    ],
  },
  {
    id: "cinematic",
    name: "Cinematic Experience",
    base: 699,
    recurring: false,
    blurb: "The full scroll-driven production, engineered to convert rather than just impress.",
    includedPages: 5,
    featured: true,
    includes: [
      "Up to 5 fully designed pages",
      "Interactive scroll-driven depth motion",
      "Custom 3D environment integration",
      "Automated booking & enquiry workflows",
      "Advanced AI copy engine with offer positioning",
      "Analytics, event tracking & conversion goals",
      "Two rounds of revisions inside the build window",
    ],
  },
  {
    id: "retainer",
    name: "Infinite Horizon Retainer",
    base: 49,
    recurring: true,
    blurb: "Keeps the environment fast, secure and current after launch. No long-term contract.",
    includedPages: 0,
    includes: [
      "Continuous 3D asset optimisation",
      "Secure high-speed cloud hosting",
      "Security patches & dependency updates",
      "Structural content & layout updates",
      "Uptime monitoring with incident alerts",
      "Monthly performance & conversion report",
    ],
  },
];

export type AddOnId =
  | "customScene"
  | "booking"
  | "cms"
  | "commerce"
  | "copy"
  | "rush";

export type AddOn = {
  id: AddOnId;
  name: string;
  price: number;
  note: string;
  /** Already bundled in these packages, so it cannot be double-charged. */
  includedIn: PackageId[];
};

export const ADD_ONS: AddOn[] = [
  {
    id: "customScene",
    name: "Custom 3D environment",
    price: 450,
    note: "Bespoke GLSL scene authored for your brand rather than a placeholder embed.",
    includedIn: ["cinematic"],
  },
  {
    id: "booking",
    name: "Automated booking workflow",
    price: 220,
    note: "Calendar sync, confirmations and reminders wired end to end.",
    includedIn: ["cinematic"],
  },
  {
    id: "cms",
    name: "Headless CMS",
    price: 380,
    note: "Your team edits copy and imagery without a deploy.",
    includedIn: [],
  },
  {
    id: "commerce",
    name: "Commerce integration",
    price: 540,
    note: "Products, basket and checkout against your existing commerce API.",
    includedIn: [],
  },
  {
    id: "copy",
    name: "Advanced AI copy engine",
    price: 180,
    note: "Offer positioning and objection-handling copy, not just headlines.",
    includedIn: ["cinematic"],
  },
  {
    id: "rush",
    name: "24-hour rush",
    price: 300,
    note: "Halves the build window. Limited to one slot per week.",
    includedIn: [],
  },
];

/** Per extra page beyond a package's bundled allowance. */
export const PAGE_RATE = 120;

export type Estimate = {
  base: number;
  pages: { count: number; charged: number; cost: number };
  addOns: { id: AddOnId; name: string; cost: number; bundled: boolean }[];
  oneOff: number;
  monthly: number;
  /** Sanity band shown alongside the number, because a quote is not a contract. */
  range: [number, number];
};

export type Config = {
  packageId: PackageId;
  pages: number;
  addOns: AddOnId[];
  withRetainer: boolean;
};

export function estimate(config: Config): Estimate {
  const pkg = PACKAGES.find((p) => p.id === config.packageId) ?? PACKAGES[0];

  const charged = pkg.recurring ? 0 : Math.max(0, config.pages - pkg.includedPages);
  const pageCost = charged * PAGE_RATE;

  const addOns = ADD_ONS.filter((a) => config.addOns.includes(a.id)).map((a) => {
    const bundled = a.includedIn.includes(pkg.id);
    return { id: a.id, name: a.name, cost: bundled ? 0 : a.price, bundled };
  });

  const addOnTotal = addOns.reduce((sum, a) => sum + a.cost, 0);

  const oneOff = pkg.recurring ? 0 : pkg.base + pageCost + addOnTotal;
  const retainer = PACKAGES.find((p) => p.id === "retainer");
  const monthly =
    (pkg.recurring ? pkg.base : 0) + (config.withRetainer && !pkg.recurring ? (retainer?.base ?? 0) : 0);

  return {
    base: pkg.recurring ? 0 : pkg.base,
    pages: { count: config.pages, charged, cost: pageCost },
    addOns,
    oneOff,
    monthly,
    // Scope always moves a little once a brief is read; quoting a point number
    // with no band is how estimates turn into arguments.
    range: [Math.round(oneOff * 0.92), Math.round(oneOff * 1.15)],
  };
}

export const gbp = (n: number) =>
  n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
