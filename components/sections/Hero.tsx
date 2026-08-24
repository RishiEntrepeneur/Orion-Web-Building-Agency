import { ArrowRight, Clock3, PlayCircle, ShieldCheck, Zap } from "lucide-react";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import SpatialViewport from "@/components/ui/SpatialViewport";

const trustMarkers = [
  { icon: Clock3, label: "48-hour build window" },
  { icon: ShieldCheck, label: "Fixed price, no retainers required" },
  { icon: Zap, label: "Core Web Vitals optimised" },
] as const;

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36 lg:px-10 lg:pb-36 lg:pt-44"
    >
      {/* Sectional glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[42rem] w-[80rem] max-w-none -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_30%,rgba(246,248,251,0.10),transparent_70%)]"
      />

      <div className="mx-auto w-full max-w-7xl">
        {/* Availability chip — scarcity signal */}
        <Reveal className="flex justify-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-edge bg-white/[0.035] px-4 py-2 text-[12px] font-medium text-ink-muted backdrop-blur-md transition-colors duration-300 hover:border-chrome/40 hover:text-ink sm:text-[13px]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Taking <strong className="font-semibold text-ink">2 new builds</strong>{" "}
            this month
            <span aria-hidden="true" className="hidden h-3 w-px bg-edge sm:block" />
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-chrome sm:inline">
              UK Studio
            </span>
          </span>
        </Reveal>

        {/* Cinematic headline */}
        <Reveal delay={80}>
          <h1
            id="hero-heading"
            className="mx-auto mt-8 max-w-5xl text-balance text-center font-display font-bold leading-[0.98] tracking-[-0.045em] text-[clamp(2.6rem,8.4vw,5.6rem)] sm:mt-10"
          >
            <span className="block text-ink">We Build 3D &amp; AI</span>
            <span className="block text-ink">
              Websites That{" "}
              <span className="relative inline-block">
                <span className="metal-text animate-sheen">Captivate.</span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-linear-to-r from-transparent via-chrome to-transparent opacity-80 blur-[2px]"
                />
              </span>
            </span>
            <span className="mt-2 block text-ink-muted sm:mt-3">
              Launched in{" "}
              <span className="relative whitespace-nowrap text-ink">
                48 Hours.
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-2 -skew-x-12 bg-steel/30 blur-[3px]"
                />
              </span>
            </span>
          </h1>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay={160}>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-center text-base leading-relaxed text-ink-muted sm:mt-9 sm:text-lg lg:text-xl">
            Our prompt-to-3D engine turns a single brief into a fully rendered
            spatial environment — real-time WebGL scenes, AI-written conversion
            copy and scroll-driven depth motion, assembled and deployed while
            your competitors are still waiting on a design mock-up.
          </p>
        </Reveal>

        {/* Dual CTAs */}
        <Reveal delay={240}>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:mt-12 sm:flex-row sm:items-center">
            <CtaLink
              href="#packages"
              size="lg"
              trailingIcon={<ArrowRight className="size-5" strokeWidth={2.4} />}
            >
              Launch Your Site
            </CtaLink>
            <CtaLink
              href="#showreel"
              size="lg"
              variant="secondary"
              leadingIcon={<PlayCircle className="size-5" strokeWidth={2} />}
            >
              Explore Showreel
            </CtaLink>
          </div>
        </Reveal>

        {/* Trust markers */}
        <Reveal delay={320}>
          <ul className="mx-auto mt-9 flex max-w-3xl flex-col items-center justify-center gap-3 sm:mt-11 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
            {trustMarkers.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-[13px] text-ink-dim transition-colors duration-300 hover:text-ink-muted sm:text-sm"
              >
                <Icon
                  className="size-4 shrink-0 text-chrome"
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Simulated 3D viewframe */}
        <Reveal delay={140} threshold={0.05}>
          <div
            id="showreel"
            className="mt-20 scroll-mt-28 sm:mt-24 lg:mt-28"
          >
            <SpatialViewport />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
