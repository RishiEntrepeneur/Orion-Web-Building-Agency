import type { Metadata } from "next";
import Faq from "@/components/sections/Faq";
import Pricing from "@/components/sections/Pricing";
import PackageCalculator from "@/components/pricing/PackageCalculator";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Fixed-scope, fixed-price packages from ORION Studio, with an interactive calculator that prices your configuration before you speak to anyone.",
};

export default function PricingPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Productised Pricing"
        title={
          <>
            Fixed scope. Fixed price.{" "}
            <span className="accent-text">Zero surprises.</span>
          </>
        }
        lede="No day rates, no discovery-phase invoices. Configure what you need below and the number moves as you do."
        meta={[
          { label: "From", value: "£299" },
          { label: "Retainer", value: "£49/mo" },
          { label: "Build window", value: "48 hours" },
        ]}
      />

      <section
        id="calculator"
        aria-labelledby="calculator-heading"
        className="relative scroll-mt-24 px-5 pb-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2 id="calculator-heading" className="sr-only">
            Package calculator
          </h2>
          <Reveal>
            <PackageCalculator />
          </Reveal>
        </div>
      </section>

      {/* The three productised packages in full, below the calculator: the
          calculator is for configuring, these are for comparing. */}
      <Pricing />

      <Faq />
    </main>
  );
}
