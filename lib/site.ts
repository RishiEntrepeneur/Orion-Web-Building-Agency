/**
 * Single source of truth for brand-level copy, navigation and legal details.
 * Change the values here to rebrand the entire landing page.
 */

export const site = {
  name: "ORION",
  tagline: "3D & AI Web Studio",
  domain: "orionstudio.co.uk",
  url: "https://orionstudio.co.uk",
  description:
    "ORION builds cinematic 3D and AI-driven websites for premium brands and local businesses — prompt-to-3D scenes, scroll-driven depth and live deployment in 48 hours.",
  email: "hello@orionstudio.co.uk",
  phone: "+44 20 7946 0148",
  location: "London, United Kingdom",
  locationShort: "London, UK",
  /** UK legal compliance placeholders — replace with your registered details. */
  legal: {
    entity: "Orion Studio Ltd",
    companyNumber: "00000000",
    vatNumber: "GB 000 0000 00",
    registeredOffice:
      "71–75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom",
    icoRegistration: "ZA000000",
  },
} as const;

export const navLinks = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Packages", href: "#packages" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
] as const;

export const footerColumns = [
  {
    title: "Studio",
    links: [
      { label: "Capabilities", href: "#capabilities" },
      { label: "Packages", href: "#packages" },
      { label: "Process", href: "#process" },
      { label: "Showreel", href: "#showreel" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Start a Project", href: "#packages" },
      { label: `Email ${site.email}`, href: `mailto:${site.email}` },
      { label: `Call ${site.phone}`, href: `tel:${site.phone.replace(/\s+/g, "")}` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Accessibility Statement", href: "/legal/accessibility" },
    ],
  },
] as const;

export const COOKIE_CONSENT_KEY = "orion:cookie-consent:v1";
