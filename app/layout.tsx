import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono, Syne } from "next/font/google";
import { site } from "@/lib/site";
import LenisProvider from "@/components/motion/LenisProvider";
import RouteAccentShell from "@/components/motion/RouteAccentShell";
import RouteTransition from "@/components/motion/RouteTransition";
import SceneScrim from "@/components/webgl/SceneScrim";
import SpatialCanvas from "@/components/webgl/SpatialCanvas";
import SpatialScene from "@/components/webgl/SpatialScene";
import SpatialCrosshair from "@/components/ui/SpatialCrosshair";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

/* Display: geometric, unusually proportioned, built for art-direction at
   poster size — memorable where a neutral grotesque is anonymous. */
const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-syne",
});

/* Text: a workhorse grotesque with a width axis, so the editorial scale can
   vary width as well as size. */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-archivo",
});

/* Technical labels: wide and mechanical, reads as instrumentation. */
const martianMono = Martian_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-martian",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — 3D & AI Websites, Launched in 48 Hours`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "3D website design",
    "AI website agency",
    "Spline developer",
    "immersive web design",
    "WebGL agency UK",
    "prompt to 3D",
    "scroll driven animation",
  ],
  authors: [{ name: site.legal.entity, url: site.url }],
  creator: site.legal.entity,
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — 3D & AI Websites That Captivate`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — 3D & AI Websites That Captivate`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#07080b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  legalName: site.legal.entity,
  url: site.url,
  email: site.email,
  telephone: site.phone,
  description: site.description,
  areaServed: "GB",
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    addressCountry: "GB",
    addressLocality: "London",
  },
  makesOffer: [
    {
      "@type": "Offer",
      name: "Starter Concept",
      price: "299",
      priceCurrency: "GBP",
    },
    {
      "@type": "Offer",
      name: "Cinematic Experience",
      price: "699",
      priceCurrency: "GBP",
    },
    {
      "@type": "Offer",
      name: "Infinite Horizon Retainer",
      price: "49",
      priceCurrency: "GBP",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${syne.variable} ${martianMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-void font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-chrome/60 focus:bg-abyss focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-chrome"
        >
          Skip to main content
        </a>
        {/* The canvas lives here, above the route boundary, so it survives every
            navigation — a route change moves the camera, it does not rebuild
            the scene. */}
        <LenisProvider />
        <RouteTransition />
        <SpatialCanvas>
          <SpatialScene />
        </SpatialCanvas>
        <SceneScrim />
        <SpatialCrosshair />
        <RouteAccentShell>
          <Navbar />
          {children}
          <Footer />
        </RouteAccentShell>
        <CookieConsent />
        <script
          type="application/ld+json"
          // Static, developer-authored JSON-LD — no user input is interpolated.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
