export type Project = {
  slug: string;
  client: string;
  sector: Sector;
  year: string;
  summary: string;
  /** Headline outcomes. Sample data — see the notice on /work. */
  metrics: { label: string; value: string; note: string }[];
  stack: string[];
  /** Drives the placeholder artwork's geometry, so each card reads distinctly. */
  form: "orbit" | "grid" | "prism" | "wave";
};

export const SECTORS = [
  "All",
  "Retail",
  "Property",
  "Hospitality",
  "Industrial",
  "Culture",
] as const;

export type Sector = (typeof SECTORS)[number];

export const projects: Project[] = [
  {
    slug: "meridian-atelier",
    client: "Meridian Atelier",
    sector: "Retail",
    year: "2025",
    summary:
      "A made-to-measure tailor whose product cannot be photographed flat. The configurator renders cloth in real time, so a customer sees their own choice rather than a swatch grid.",
    metrics: [
      { label: "LCP", value: "1.1s", note: "median, 4G mobile" },
      { label: "Enquiries", value: "+63%", note: "vs previous site, 90 days" },
      { label: "Session", value: "3m 42s", note: "median engaged time" },
    ],
    stack: ["Next.js", "WebGL", "Headless CMS"],
    form: "wave",
  },
  {
    slug: "north-quay",
    client: "North Quay",
    sector: "Property",
    year: "2025",
    summary:
      "Off-plan apartments sold before the frame went up. The scroll flies through the building at real scale, and every unit links to its own availability state.",
    metrics: [
      { label: "LCP", value: "1.3s", note: "median, 4G mobile" },
      { label: "Reservations", value: "41", note: "in the first six weeks" },
      { label: "Bounce", value: "−28%", note: "vs the developer's prior launch" },
    ],
    stack: ["Next.js", "WebGL", "Scroll camera"],
    form: "grid",
  },
  {
    slug: "cassia-house",
    client: "Cassia House",
    sector: "Hospitality",
    year: "2024",
    summary:
      "A twelve-room hotel competing against aggregator listings. Direct booking was the entire brief, so the room tour and the booking flow are the same interface.",
    metrics: [
      { label: "LCP", value: "0.9s", note: "median, 4G mobile" },
      { label: "Direct bookings", value: "+2.1×", note: "share of total, 6 months" },
      { label: "Commission saved", value: "£31k", note: "annualised, client-reported" },
    ],
    stack: ["Next.js", "Booking API", "Headless CMS"],
    form: "orbit",
  },
  {
    slug: "halden-precision",
    client: "Halden Precision",
    sector: "Industrial",
    year: "2024",
    summary:
      "Five-axis machining explained to procurement officers who are not engineers. The part rotates as you read the spec, and the tolerance callouts track it.",
    metrics: [
      { label: "LCP", value: "1.2s", note: "median, 4G mobile" },
      { label: "Quote requests", value: "+88%", note: "vs previous site, 120 days" },
      { label: "Spec downloads", value: "+2.4×", note: "same period" },
    ],
    stack: ["Next.js", "WebGL", "Draco meshes"],
    form: "prism",
  },
  {
    slug: "lantern-collective",
    client: "Lantern Collective",
    sector: "Culture",
    year: "2024",
    summary:
      "A touring exhibition with no permanent venue. The site is the venue: each room is a spatial zone, and the whole thing works on a five-year-old phone.",
    metrics: [
      { label: "LCP", value: "1.0s", note: "median, 4G mobile" },
      { label: "Ticket conversion", value: "+37%", note: "vs the prior season" },
      { label: "Mobile share", value: "71%", note: "of all sessions" },
    ],
    stack: ["Next.js", "WebGL", "Ticketing API"],
    form: "orbit",
  },
  {
    slug: "verge-outfitters",
    client: "Verge Outfitters",
    sector: "Retail",
    year: "2023",
    summary:
      "Technical outdoor kit where the material is the selling point. Fabric shaders respond to a cursor the way the real thing responds to light.",
    metrics: [
      { label: "LCP", value: "1.4s", note: "median, 4G mobile" },
      { label: "Add to basket", value: "+22%", note: "product pages, 60 days" },
      { label: "Returns", value: "−11%", note: "client-reported, same period" },
    ],
    stack: ["Next.js", "WebGL", "Commerce API"],
    form: "wave",
  },
];
