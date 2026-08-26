import type { Metadata } from "next";
import DemoOne from "./demo";

export const metadata: Metadata = {
  title: "Build Your Dreams",
  description: "AI-powered creativity for the next generation.",
  robots: { index: false, follow: false },
};

export default function HeroFuturisticPage() {
  return (
    <main id="main">
      <DemoOne />
    </main>
  );
}
