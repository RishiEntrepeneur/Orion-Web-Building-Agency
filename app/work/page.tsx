import type { Metadata } from "next";
import { ArrowRight, Info } from "lucide-react";
import ProjectGrid from "@/components/work/ProjectGrid";
import CtaLink from "@/components/ui/CtaLink";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Interactive case studies from ORION Studio — 3D commerce, property, hospitality, industrial and cultural projects with measured outcomes.",
};

export default function WorkPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Selected Work"
        title={
          <>
            Six builds, and what{" "}
            <span className="accent-text">each one moved.</span>
          </>
        }
        lede="Every project below shipped against a performance budget and a commercial target. Both are quoted."
        meta={[
          { label: "Projects", value: "6" },
          { label: "Median LCP", value: "1.15s" },
          { label: "Sectors", value: "5" },
        ]}
      />

      <section className="relative px-5 pb-14 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <p className="flex items-start gap-3 rounded-2xl border border-edge bg-white/[0.02] p-5 text-sm leading-relaxed text-ink-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
              <span>
                <strong className="font-semibold text-ink">Sample portfolio.</strong> ORION Studio
                is a demonstration brand, and the clients and figures below are illustrative —
                they show the shape a real case study would take, not results achieved for real
                customers. Replace them in{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-ink">
                  lib/projects.ts
                </code>{" "}
                before publishing.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto w-full max-w-7xl">
          <ProjectGrid />
        </div>
      </section>

      <section className="relative px-5 pb-28 sm:px-8 lg:px-10 lg:pb-36">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <div className="rounded-3xl border border-edge glass-accent px-6 py-14 text-center sm:px-12">
              <h2 className="mx-auto max-w-2xl text-balance font-display text-h2 font-bold text-ink">
                Yours could be the seventh.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
                Same 48-hour window, same performance budget, same handover of every source file.
              </p>
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <CtaLink href="/contact" size="lg" trailingIcon={<ArrowRight className="size-5" strokeWidth={2.4} />}>
                  Start The Briefing
                </CtaLink>
                <CtaLink href="/pricing" size="lg" variant="secondary">
                  See Pricing
                </CtaLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
