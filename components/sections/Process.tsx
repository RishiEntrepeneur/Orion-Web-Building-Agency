import { ArrowRight, ClipboardList, Cpu, Rocket } from "lucide-react";
import { site } from "@/lib/site";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import PinnedPanel from "@/components/motion/PinnedPanel";

const steps = [
  {
    index: "01",
    icon: ClipboardList,
    duration: "≈ 9 minutes",
    title: "Briefing Questionnaire",
    body: "A short, structured form captures your offer, audience, tone and any brand assets you already own. No workshops, no discovery calls, no three-week kick-off.",
    detail: "You complete it once. We never come back asking for more.",
  },
  {
    index: "02",
    icon: Cpu,
    duration: "Inside 24 hours",
    title: "AI 3D Scene Generation",
    body: "Your brief drives the prompt-to-3D engine. It composes the spatial environment, lighting and camera path, while the copy model drafts every headline and CTA against it.",
    detail: "You review a live preview link — not a flat PDF mock-up.",
  },
  {
    index: "03",
    icon: Rocket,
    duration: "Hour 48",
    title: "Live Interactive Deployment",
    body: "We wire the domain, analytics, forms and booking workflow, run the performance and accessibility pass, then push to global edge hosting with SSL enabled.",
    detail: "Full source and scene files are handed over on launch day.",
  },
] as const;

export default function Process() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="relative scroll-mt-24 overflow-hidden px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-edge to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Production Timeline"
          title={
            <>
              Three steps.{" "}
              <span className="accent-text">Forty-eight hours.</span>
            </>
          }
          description="A frictionless pipeline built to remove every stage where traditional agency projects stall — approvals, revisions ping-pong and handover limbo."
        />

        <PinnedPanel hold={0.9} depth={560}>
        {/* Timeline */}
        <ol className="relative mt-16 grid grid-cols-1 gap-10 sm:mt-20 md:grid-cols-3 md:gap-7 lg:gap-9">
          {/* Desktop connector rail */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-linear-to-r from-accent/0 via-steel/60 to-steel/0 md:block"
          />
          {/* Mobile connector rail */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-10 left-8 top-8 w-px bg-linear-to-b from-accent/60 via-steel/45 to-transparent md:hidden"
          />

          {steps.map((step, index) => (
            <Reveal
              key={step.index}
              as="li"
              delay={index * 130}
              className="relative"
            >
              <div className="flex gap-6 md:block">
                {/* Node */}
                <div className="relative shrink-0">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl bg-accent/25 blur-lg"
                  />
                  <span className="relative flex size-16 items-center justify-center rounded-2xl border border-accent/40 bg-abyss text-accent shadow-[0_0_40px_-12px_color-mix(in_oklab,var(--accent)_77%,transparent)] transition-all duration-500 hover:scale-105 hover:border-accent/70">
                    <step.icon className="size-7" strokeWidth={1.7} aria-hidden="true" />
                    <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border border-edge bg-raised font-mono text-[10px] font-semibold text-ink">
                      {step.index}
                    </span>
                  </span>
                </div>

                {/* Copy */}
                <div className="pb-2 md:mt-8">
                  <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {step.duration}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold leading-snug text-ink sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
                    {step.body}
                  </p>
                  <p className="mt-4 border-l-2 border-steel/40 pl-4 text-pretty text-[13px] italic leading-relaxed text-ink-dim">
                    {step.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* Closing CTA */}
        <Reveal delay={120}>
          <div className="mt-16 flex flex-col items-center gap-5 rounded-3xl border border-edge glass-panel px-6 py-10 text-center sm:mt-20 sm:px-10 sm:py-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
            />
            <h3 className="max-w-2xl text-balance text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Your brief could be submitted in the next ten minutes.
            </h3>
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
              Tell us what you sell and who you sell it to. We will confirm the
              build slot the same working day.
            </p>
            <div className="mt-2 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <CtaLink
                href={`mailto:${site.email}?subject=Project%20brief%20enquiry`}
                size="lg"
                trailingIcon={<ArrowRight className="size-5" strokeWidth={2.4} />}
              >
                Start The Briefing
              </CtaLink>
              <CtaLink href="#packages" size="lg" variant="ghost">
                Compare Packages
              </CtaLink>
            </div>
          </div>
        </Reveal>
        </PinnedPanel>
      </div>
    </section>
  );
}
