import type { ReactNode } from "react";
import { ArrowLeft, ScrollText } from "lucide-react";
import { site } from "@/lib/site";

export type LegalSection = {
  heading: string;
  body: readonly ReactNode[];
};

/**
 * Shared shell for the statutory pages so privacy, terms, cookies and
 * accessibility all read as one document set.
 */
export default function LegalPage({
  title,
  intro,
  lastUpdated,
  sections,
}: {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
}) {
  return (
    <main id="main" className="relative px-5 pb-24 pt-32 sm:px-8 sm:pb-28 sm:pt-40 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <a
          href="/"
          className="group/back inline-flex items-center gap-2 text-sm text-ink-muted transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover/back:-translate-x-1"
            strokeWidth={2.2}
            aria-hidden="true"
          />
          Back to {site.name}
        </a>

        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          <ScrollText className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
          Legal
        </span>

        <h1 className="mt-6 text-balance font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.05] text-ink">
          {title}
        </h1>

        <p className="mt-5 text-pretty text-base leading-relaxed text-ink-muted">
          {intro}
        </p>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-8 rounded-2xl border border-live/25 bg-live/[0.05] p-5 text-sm leading-relaxed text-ink-muted">
          <strong className="font-semibold text-live">
            Template notice:
          </strong>{" "}
          this document is a structural placeholder supplied with the site build.
          Have it reviewed and adapted by a qualified UK solicitor before you
          rely on it commercially.
        </div>

        <div className="mt-12 flex flex-col gap-10">
          {sections.map((section, index) => (
            <section key={section.heading} aria-labelledby={`legal-${index}`}>
              <h2
                id={`legal-${index}`}
                className="text-xl font-semibold leading-snug text-ink sm:text-2xl"
              >
                {section.heading}
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                {section.body.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraphIndex}
                    className="text-pretty text-[15px] leading-relaxed text-ink-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-edge glass-panel p-6">
          <h2 className="text-lg font-semibold text-ink">Contact the data controller</h2>
          <address className="mt-3 flex flex-col gap-1.5 text-sm not-italic leading-relaxed text-ink-muted">
            <span>{site.legal.entity}</span>
            <span>{site.legal.registeredOffice}</span>
            <a
              href={`mailto:${site.email}`}
              className="w-fit text-accent transition-opacity duration-300 hover:opacity-80"
            >
              {site.email}
            </a>
          </address>
          <p className="mt-4 text-xs leading-relaxed text-ink-dim">
            You have the right to lodge a complaint with the Information
            Commissioner&apos;s Office (ICO) at ico.org.uk or on 0303 123 1113.
          </p>
        </div>
      </div>
    </main>
  );
}
