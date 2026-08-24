import {
  ArrowRight,
  BadgeCheck,
  Check,
  Infinity as InfinityIcon,
  Rocket,
  Sparkles,
} from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

type Tier = {
  id: string;
  /** Small print under the CTA — differs for one-off builds vs the retainer. */
  ctaNote: string;
  name: string;
  icon: typeof Rocket;
  price: string;
  period?: string;
  priceNote: string;
  summary: string;
  features: readonly string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
};

const tiers: readonly Tier[] = [
  {
    id: "starter-concept",
    name: "Starter Concept",
    icon: Rocket,
    price: "£299",
    priceNote: "One-off project fee",
    summary:
      "A single-page immersive statement piece for forward-thinking brands that need presence fast.",
    features: [
      "Single-page immersive spatial layout",
      "3D asset placeholder embed (Spline or Dora ready)",
      "Basic AI copy engine setup",
      "Mobile-first responsive build to 320px",
      "Contact form with spam protection",
      "Deployed to global edge hosting",
    ],
    ctaNote: "No deposit until the brief is approved",
    ctaLabel: "Start Your Concept",
    ctaHref: `mailto:${site.email}?subject=Starter%20Concept%20(%C2%A3299)%20enquiry`,
  },
  {
    id: "cinematic-experience",
    name: "Cinematic Experience",
    icon: Sparkles,
    price: "£699",
    priceNote: "One-off project fee",
    summary:
      "The full scroll-driven production: a multi-page 3D environment engineered to convert, not just impress.",
    features: [
      "3–5 fully designed pages",
      "Interactive scroll-driven depth motion",
      "Custom 3D environment integration",
      "Automated booking & enquiry workflows",
      "Advanced AI copy engine with offer positioning",
      "Analytics, event tracking & conversion goals",
      "Two rounds of revisions inside the build window",
    ],
    ctaNote: "No deposit until the brief is approved",
    ctaLabel: "Book Your Cinematic Build",
    ctaHref: `mailto:${site.email}?subject=Cinematic%20Experience%20(%C2%A3699)%20enquiry`,
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "infinite-horizon",
    name: "Infinite Horizon Retainer",
    icon: InfinityIcon,
    price: "£49",
    period: "/month",
    priceNote: "Rolling — cancel any time",
    summary:
      "Keep the environment fast, secure and current long after launch, with no long-term contract.",
    features: [
      "Continuous 3D asset optimisation",
      "Secure high-speed cloud hosting",
      "Security patches & dependency updates",
      "Structural content & layout updates",
      "Uptime monitoring with incident alerts",
      "Monthly performance & conversion report",
    ],
    ctaNote: "Rolling monthly — cancel any time",
    ctaLabel: "Add The Retainer",
    ctaHref: `mailto:${site.email}?subject=Infinite%20Horizon%20Retainer%20(%C2%A349%2Fmonth)%20enquiry`,
  },
];

export default function Pricing() {
  return (
    <section
      id="packages"
      aria-labelledby="packages-heading"
      className="relative scroll-mt-24 overflow-x-clip px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[34rem] w-[70rem] max-w-none -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(139,92,246,0.14),transparent_70%)]"
      />

      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Productised Packages"
          title={
            <>
              Fixed scope. Fixed price.{" "}
              <span className="text-gradient-neon">Zero surprises.</span>
            </>
          }
          description="No day rates, no discovery-phase invoices, no six-week Gantt chart. Choose a package, complete a short brief, and your environment goes live inside 48 hours."
        />

        {/* Pricing grid */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 sm:mt-20 lg:grid-cols-3 lg:gap-7">
          {tiers.map((tier, index) => (
            <Reveal
              key={tier.id}
              delay={index * 110}
              threshold={0.08}
              className={cn(
                "h-full",
                tier.featured && "lg:-my-4 lg:z-10",
              )}
            >
              <PricingCard tier={tier} />
            </Reveal>
          ))}
        </div>

        {/* Risk reversal / compliance strip */}
        <Reveal delay={140}>
          <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-4 rounded-2xl border border-hairline glass-panel px-6 py-6 text-center sm:mt-14 sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
            <BadgeCheck
              className="size-8 shrink-0 text-neon-cyan"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <p className="text-pretty text-sm leading-relaxed text-ink-muted">
              <strong className="font-semibold text-ink">
                Launch-or-refund guarantee.
              </strong>{" "}
              If your environment is not live within 48 hours of an approved
              brief, the project fee is refunded in full. All prices are shown in
              GBP and exclude VAT where applicable.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function PricingCard({ tier }: { tier: Tier }) {
  const Icon = tier.icon;

  return (
    <article
      aria-labelledby={`${tier.id}-name`}
      className={cn(
        "group/tier relative flex h-full flex-col overflow-hidden rounded-3xl p-[1.5px] transition-transform duration-500 ease-out",
        tier.featured ? "hover:-translate-y-1.5" : "hover:-translate-y-1",
      )}
    >
      {/* Border treatment: pulsing neon beam for the featured tier */}
      {tier.featured ? (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl bg-[linear-gradient(140deg,#38f2ff,#8b5cf6_45%,#ff2fb3_100%)] animate-pulse-ring"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(139,92,246,0.4),transparent_70%)] blur-2xl animate-pulse-ring"
          />
        </>
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl border border-hairline transition-colors duration-500 group-hover/tier:border-neon-cyan/40"
        />
      )}

      {/* Card body */}
      <div
        className={cn(
          "relative flex h-full flex-col rounded-[calc(1.5rem-1px)] p-7 sm:p-8",
          tier.featured
            ? "bg-[linear-gradient(165deg,#0d1226_0%,#080b18_60%,#06080f_100%)]"
            : "glass-panel",
        )}
      >
        {tier.featured ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid-mesh-fine rounded-[calc(1.5rem-1px)] opacity-30"
          />
        ) : null}

        {/* Badge */}
        {tier.badge ? (
          <span className="absolute right-6 top-7 inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/50 bg-neon-cyan/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neon-cyan shadow-[0_0_24px_-6px_rgba(56,242,255,0.9)] backdrop-blur-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-neon-cyan animate-blink" />
            {tier.badge}
          </span>
        ) : null}

        {/* Header */}
        <div className="relative">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-12 items-center justify-center rounded-xl border transition-all duration-500 group-hover/tier:scale-110",
              tier.featured
                ? "border-neon-violet/50 bg-neon-violet/10 text-neon-violet shadow-[0_0_30px_-8px_rgba(139,92,246,1)]"
                : "border-hairline bg-white/[0.04] text-neon-cyan group-hover/tier:border-neon-cyan/50",
            )}
          >
            <Icon className="size-6" strokeWidth={1.8} />
          </span>

          <h3
            id={`${tier.id}-name`}
            className="mt-5 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
          >
            {tier.name}
          </h3>

          <p className="mt-3 min-h-[3.5rem] text-pretty text-sm leading-relaxed text-ink-muted">
            {tier.summary}
          </p>
        </div>

        {/* Price */}
        <div className="relative mt-7 border-y border-hairline/70 py-6">
          <p className="flex items-end gap-1.5">
            <span
              className={cn(
                "font-display text-5xl font-bold leading-none tracking-tight sm:text-[3.25rem]",
                tier.featured ? "text-gradient-neon" : "text-ink",
              )}
            >
              {tier.price}
            </span>
            {tier.period ? (
              <span className="pb-1.5 text-base font-medium text-ink-muted">
                {tier.period}
              </span>
            ) : null}
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
            {tier.priceNote}
          </p>
        </div>

        {/* Features */}
        <ul className="relative mt-7 flex grow flex-col gap-3.5">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
                  tier.featured
                    ? "border-neon-cyan/50 bg-neon-cyan/12 text-neon-cyan"
                    : "border-hairline bg-white/[0.04] text-neon-cyan/80 group-hover/tier:border-neon-cyan/40",
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-pretty text-sm leading-relaxed text-ink-muted">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="relative mt-8">
          <CtaLink
            href={tier.ctaHref}
            size="md"
            variant={tier.featured ? "primary" : "secondary"}
            className="w-full"
            trailingIcon={<ArrowRight className="size-4" strokeWidth={2.4} />}
            aria-label={`${tier.ctaLabel} — ${tier.name}, ${tier.price}${tier.period ?? ""}`}
          >
            {tier.ctaLabel}
          </CtaLink>
          <p className="mt-3.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
            {tier.ctaNote}
          </p>
        </div>
      </div>
    </article>
  );
}
