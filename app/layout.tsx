import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { site } from "@/lib/site";
import AmbientBackdrop from "@/components/ui/AmbientBackdrop";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
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
  themeColor: "#04050a",
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
      className={`${inter.variable} ${spaceGrotesk.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-void text-ink font-sans antialiased selection:bg-neon-cyan/30">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-neon-cyan/60 focus:bg-abyss focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neon-cyan"
        >
          Skip to main content
        </a>
        <AmbientBackdrop />
        <Navbar />
        {children}
        <Footer />
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
