import type { Metadata, Viewport } from "next";
import { DM_Mono, Instrument_Serif, Manrope } from "next/font/google";

import Shell from "@/components/galaxy/Shell";
import "./globals.css";

/* Display: a high-contrast serif with a true italic. The site's whole voice
   rests on it, so it is loaded rather than approximated. */
const display = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

/* Text: a humanist sans that stays readable at fifteen pixels over a moving
   sky, which is most of the running copy on this site. */
const sans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

/* Labels and telemetry: mechanical, so a printed frame rate reads as an
   instrument rather than as decoration. */
const mono = DM_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

/**
 * The absolute base for canonical and Open Graph URLs.
 *
 * `??` was wrong here. An environment variable that is set but empty is a
 * string, not nullish, so an empty NEXT_PUBLIC_SITE_URL went straight past the
 * fallback into `new URL("")` and threw ERR_INVALID_URL -- which fails the
 * whole build, not just the metadata. Blank, whitespace-only and malformed
 * values all have to fall back, and a value without a scheme is a typo worth
 * absorbing rather than dying on.
 *
 * When nothing is configured this picks up the deployment's own domain, so
 * link previews are correct before anyone owns a domain name.
 */
function siteUrl(): URL {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    vercel ? `https://${vercel}` : undefined,
    "https://orion.studio",
  ];
  for (const raw of candidates) {
    const v = raw?.trim();
    if (!v) continue;
    try {
      return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    } catch {
      // Next candidate. A mistyped variable must not take the build down.
    }
  }
  return new URL("https://orion.studio");
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Orion Dream Studio",
    template: "%s",
  },
  description:
    "One brief, one fixed price, live in forty-eight hours. Real-time WebGL built by the person who answers your email.",
  openGraph: {
    type: "website",
    siteName: "Orion Dream Studio",
    title: "Orion Dream Studio — Build the website of your dreams",
    description:
      "One brief, one fixed price, live in forty-eight hours. Real-time WebGL built by the person who answers your email.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  // Matches the cream ground, so a phone's chrome does not band against it.
  themeColor: "#fdfbf6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
