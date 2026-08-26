import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import DemoOne from "./demo";

/* The hero asks for these two families by CSS variable. They are loaded here
   rather than inside the component because `next/font` is server-only, and
   self-hosted rather than via a <link> so the page makes no request to
   fonts.googleapis.com. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Woven by Light",
  description:
    "An interactive tapestry of light and motion, crafted with code and creativity.",
  robots: { index: false, follow: false },
};

export default function WovenLightPage() {
  return (
    <main id="main" className={`${playfair.variable} ${inter.variable}`}>
      <DemoOne />
    </main>
  );
}
