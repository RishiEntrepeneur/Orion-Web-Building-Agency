import Hero from "@/components/sections/Hero";
import ScrollTransformation from "@/components/sections/ScrollTransformation";
import Pricing from "@/components/sections/Pricing";
import Process from "@/components/sections/Process";
import Faq from "@/components/sections/Faq";

/**
 * Single core landing page.
 * Sections are composed top-to-bottom in the order a visitor scrolls them:
 * hook → proof of capability → offer → process → objection handling.
 */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <ScrollTransformation />
      <Pricing />
      <Process />
      <Faq />
    </main>
  );
}
