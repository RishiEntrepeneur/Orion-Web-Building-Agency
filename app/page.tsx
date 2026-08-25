import type { Metadata } from "next";
import { ArrowRight, Gauge, Layers, MousePointerClick, Sparkles } from "lucide-react";
import Hero from "@/components/sections/Hero";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import SpotlightCard from "@/components/ui/SpotlightCard";

export const metadata: Metadata = {
  title: "ORION — 3D & AI Websites, Launched in 48 Hours",
  description:
    "ORION Studio builds cinematic 3D and AI-driven websites for premium brands and ambitious local businesses.",
};

const capabilities = [
  {
    icon: Layers,
    title: "Real-time WebGL",
    body: "Custom GLSL, not a template with a canvas bolted on. Every scene is authored for the brand it belongs to.",
    href: "/services",
  },
  {
    icon: MousePointerClick,
    title: "Scroll-driven camera",
    body: "One continuous shot from first paint to footer, with the camera flying a spline you can feel rather than a stack of fade-ins.",
    href: "/services",
  },
  {
    icon: Gauge,
    title: "Performance budgeted",
    body: "Immersive does not have to mean slow. Every build ships against a Core Web Vitals budget, measured before launch.",
    href: "/services",
  },
  {
    icon: Sparkles,
    title: "48-hour delivery",
    body: "Productised scope and an AI-assisted pipeline, so there is no open-ended design phase to slip.",
    href: "/pricing",
  },
] as const;

/**
 * Landing page.
 *
 * Deliberately short. Its job is the hook, one honest demonstration, and the
 * fastest possible route onward — the detail lives on the pages built for it.
 */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />

      <section
        id="capabilities"
        aria-labelledby="capabilities-heading"
        className="relative scroll-mt-24 overflow-x-clip px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32"
      >
        <div className="mx-auto w-full max-w-7xl">
          <SectionHeading
            eyebrow="Key Capabilities"
            title={
              <>
                Four things we do that a template{" "}
                <span className="accent-text">cannot.</span>
              </>
            }
            description="Each of these is a discipline, not a feature toggle. The detail — and what it costs — is a click away."
          />

          <div className="mt-14 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap, i) => (
              <Reveal key={cap.title} delay={i * 70}>
                <SpotlightCard as="article" className="flex h-full flex-col p-6 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-white/[0.04] text-accent transition-all duration-500 group-hover/card:scale-110 group-hover/card:border-accent/50"
                  >
                    <cap.icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-5 text-h4 font-semibold leading-snug text-ink">{cap.title}</h3>
                  <p className="mt-3 grow text-pretty text-sm leading-relaxed text-ink-muted">
                    {cap.body}
                  </p>
                  <a
                    href={cap.href}
                    className="group/link mt-6 inline-flex w-fit items-center gap-2 font-mono text-micro uppercase text-accent transition-opacity duration-300 hover:opacity-80"
                  >
                    Read more
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-1" strokeWidth={2.4} />
                  </a>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-28 sm:px-8 lg:px-10 lg:pb-36">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-edge glass-accent px-6 py-14 text-center sm:px-12 sm:py-16">
              <h2 className="mx-auto max-w-2xl text-balance font-display text-h2 font-bold text-ink">
                Your brief could be submitted in the next ten minutes.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
                Tell us what you sell and who you sell it to. We confirm the build slot the same
                working day — and the estimator tells you the price before you send anything.
              </p>
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <CtaLink
                  href="/contact"
                  size="lg"
                  trailingIcon={<ArrowRight className="size-5" strokeWidth={2.4} />}
                >
                  Start The Briefing
                </CtaLink>
                <CtaLink href="/work" size="lg" variant="secondary">
                  See The Work
                </CtaLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
