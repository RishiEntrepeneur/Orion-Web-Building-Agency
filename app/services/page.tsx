import type { Metadata } from "next";
import { ArrowRight, Boxes, Database, Gauge, Layers } from "lucide-react";
import ScrollTransformation from "@/components/sections/ScrollTransformation";
import CtaLink from "@/components/ui/CtaLink";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom WebGL, Core Web Vitals engineering, full-stack Next.js and headless CMS integration from ORION Studio.",
};

const services = [
  {
    icon: Layers,
    name: "Custom WebGL",
    summary:
      "Bespoke real-time scenes authored in GLSL — not a library demo with your logo dropped in.",
    detail:
      "We write the shaders. That means the grid, the material response and the way the scene answers a cursor are all specific to the brand rather than whatever the library shipped with. Scenes are built procedurally wherever possible, so there is no multi-megabyte model to download before anything appears.",
    deliverables: [
      "Authored GLSL vertex and fragment shaders",
      "Procedural geometry, or Draco-compressed meshes where a model is unavoidable",
      "Pointer and scroll reactivity wired to a single shared state",
      "Reduced-motion and no-WebGL fallbacks built at the same time, not after",
    ],
    metric: "0 external model fetches on a procedural build",
  },
  {
    icon: Gauge,
    name: "Core Web Vitals",
    summary:
      "A performance budget agreed before the first commit, and measured against before launch.",
    detail:
      "Immersive and fast are not opposites, but they only coexist deliberately. The 3D layer hydrates after first paint so it never blocks the largest contentful element; render resolution degrades automatically on weak hardware; and every animation is composited rather than repainted.",
    deliverables: [
      "LCP, INP and CLS budgets set per route",
      "Deferred canvas hydration so WebGL never blocks first paint",
      "Automatic DPR and density downgrade on low-tier devices",
      "A measured before/after report at handover",
    ],
    metric: "LCP budget < 1.5s",
  },
  {
    icon: Boxes,
    name: "Full-Stack Next.js",
    summary:
      "App Router, server components, and a persistent canvas that survives navigation.",
    detail:
      "The site you are reading is the reference implementation: six routes sharing one WebGL context that never unmounts, so moving between pages flies the camera rather than tearing down and rebuilding the scene. Everything that can be a server component is one.",
    deliverables: [
      "App Router architecture with server components by default",
      "One persistent canvas across all routes",
      "Route-aware camera choreography",
      "Typed end to end, with a clean production build as the gate",
    ],
    metric: "6 routes, 1 WebGL context",
  },
  {
    icon: Database,
    name: "Headless CMS",
    summary: "Your team edits the words. The 3D layer looks after itself.",
    detail:
      "Content lives in a headless CMS with a schema shaped around how you actually work, not around the database. Editors change copy, imagery and pricing without going near a shader — and without a deploy for every typo.",
    deliverables: [
      "Schema modelled on your editorial workflow",
      "Preview environment for unpublished changes",
      "Incremental revalidation so edits appear without a rebuild",
      "Editor handover session and written runbook",
    ],
    metric: "No deploy needed to publish copy",
  },
] as const;

export default function ServicesPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Services"
        title={
          <>
            Four disciplines. One{" "}
            <span className="accent-text">engineering standard.</span>
          </>
        }
        lede="We do a small number of things properly rather than a long list adequately. Everything below is delivered by the same people who wrote this page."
        meta={[
          { label: "Build window", value: "48 hours" },
          { label: "LCP budget", value: "< 1.5s" },
          { label: "Handover", value: "Full source" },
        ]}
      />

      <section className="relative px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {services.map((service, i) => (
            <Reveal key={service.name} delay={i * 60}>
              <SpotlightCard
                as="article"
                className="grid grid-cols-1 gap-8 p-7 sm:p-9 lg:grid-cols-[1.1fr_1fr] lg:gap-14"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent"
                    >
                      <service.icon className="size-6" strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-micro uppercase text-ink-dim">
                      0{i + 1}
                    </span>
                  </div>

                  <h2 className="mt-6 font-display text-h3 font-semibold text-ink">
                    {service.name}
                  </h2>
                  <p className="mt-3 text-pretty text-lead leading-relaxed text-ink-muted">
                    {service.summary}
                  </p>
                  <p className="mt-5 text-pretty text-sm leading-relaxed text-ink-dim">
                    {service.detail}
                  </p>
                  <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3.5 py-1.5 font-mono text-micro uppercase text-accent">
                    {service.metric}
                  </span>
                </div>

                <div className="lg:border-l lg:border-edge lg:pl-14">
                  <h3 className="font-mono text-micro uppercase text-ink-dim">
                    What you receive
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3.5">
                    {service.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span className="text-pretty text-sm leading-relaxed text-ink-muted">
                          {d}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      <ScrollTransformation />

      <section className="relative px-5 pb-28 sm:px-8 lg:px-10 lg:pb-36">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <div className="rounded-3xl border border-edge glass-accent px-6 py-14 text-center sm:px-12">
              <h2 className="mx-auto max-w-2xl text-balance font-display text-h2 font-bold text-ink">
                Price it in about a minute.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
                The calculator on the pricing page puts a real number against whichever of these
                you need, before you speak to anyone.
              </p>
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <CtaLink href="/pricing" size="lg" trailingIcon={<ArrowRight className="size-5" strokeWidth={2.4} />}>
                  Open The Calculator
                </CtaLink>
                <CtaLink href="/work" size="lg" variant="secondary">
                  See It Applied
                </CtaLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
