import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Shared header for inner pages.
 *
 * Deliberately shorter than the landing hero: on an inner page the visitor has
 * already chosen where to go, so the header's job is to confirm the choice and
 * get out of the way, not to sell again.
 */
export default function PageHero({
  eyebrow,
  title,
  lede,
  meta,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Small key/value facts rendered as a technical strip under the lede. */
  meta?: { label: string; value: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative px-5 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-36 lg:px-10 lg:pt-40">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-micro uppercase text-accent">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {eyebrow}
          </span>
        </Reveal>

        <Reveal delay={80}>
          {/* Deliberately smaller than the landing hero's display size. An inner
              page has already been chosen, so its title confirms the choice
              rather than shouting across a room. */}
          <h1
            className={cn(
              "mt-7 max-w-4xl text-balance font-display font-bold leading-[1.02] tracking-[-0.035em] text-ink",
              "text-[clamp(2.25rem,5.4vw,4.25rem)]",
            )}
          >
            {title}
          </h1>
        </Reveal>

        {lede ? (
          <Reveal delay={150}>
            <p className="mt-6 max-w-2xl text-pretty text-lead leading-relaxed text-ink-muted">
              {lede}
            </p>
          </Reveal>
        ) : null}

        {meta?.length ? (
          <Reveal delay={210}>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-edge pt-6">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt className="font-mono text-micro uppercase text-ink-dim">{m.label}</dt>
                  <dd className="mt-1.5 font-display text-h4 text-ink">{m.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}

        {children}
      </div>
    </section>
  );
}
