import { HelpCircle, MessageSquareText } from "lucide-react";
import { faqs } from "@/lib/faqs";
import { site } from "@/lib/site";
import Accordion from "@/components/ui/Accordion";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-24 overflow-x-clip px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-edge to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Answers Before You Ask"
          eyebrowIcon={<HelpCircle className="size-3.5" strokeWidth={2.4} />}
          title={
            <>
              The questions every client asks{" "}
              <span className="accent-text">before they commit.</span>
            </>
          }
          description="Straight answers on performance, mobile, ownership and whether the 48-hour promise is real."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:mt-16 lg:grid-cols-[1fr_20rem] lg:gap-10">
          <Reveal threshold={0.05}>
            <Accordion items={faqs} />
          </Reveal>

          {/* Support aside */}
          <Reveal delay={130} className="lg:sticky lg:top-28 lg:self-start">
            <aside className="flex flex-col gap-5 rounded-2xl border border-edge glass-panel p-6 sm:p-7">
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-xl border border-steel/40 bg-steel/10 text-steel shadow-[0_0_28px_-8px_color-mix(in_oklab,var(--accent)_72%,transparent)]"
              >
                <MessageSquareText className="size-5" strokeWidth={1.9} />
              </span>

              <div>
                <h3 className="text-lg font-semibold leading-snug text-ink">
                  Still weighing it up?
                </h3>
                <p className="mt-2.5 text-pretty text-sm leading-relaxed text-ink-muted">
                  Send one sentence about your business and we will reply with a
                  straight answer on whether an immersive build is right for you
                  — and tell you if it is not.
                </p>
              </div>

              <CtaLink
                href={`mailto:${site.email}?subject=Quick%20question%20about%20a%203D%20build`}
                variant="secondary"
                size="md"
                className="w-full"
              >
                Ask A Direct Question
              </CtaLink>

              <dl className="flex flex-col gap-3 border-t border-edge pt-5 font-mono text-[11px] uppercase tracking-[0.16em]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-dim">Reply time</dt>
                  <dd className="text-accent">Same working day</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-dim">Based in</dt>
                  <dd className="text-ink-muted">{site.locationShort}</dd>
                </div>
              </dl>
            </aside>
          </Reveal>
        </div>
      </div>

      <script
        type="application/ld+json"
        // Static, developer-authored JSON-LD generated from lib/faqs.ts.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </section>
  );
}
