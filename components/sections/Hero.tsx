import { ArrowRight, ChevronDown, Clock3, PlayCircle, ShieldCheck, Zap } from "lucide-react";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import SpatialViewport from "@/components/ui/SpatialViewport";

const trustMarkers = [
  { icon: Clock3, label: "48-hour build window" },
  { icon: ShieldCheck, label: "Fixed price, no retainers required" },
  { icon: Zap, label: "Core Web Vitals optimised" },
] as const;

/**
 * The hero.
 *
 * The first screen is one viewport of the weave with the copy laid over it —
 * the object in the persistent canvas is the page's opening image, and the type
 * is the only thing between the visitor and it. The showreel follows below the
 * fold inside the same section, so the camera's zone anchors are unchanged.
 */
export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative isolate">
      {/* The stage: exactly one viewport. `svh` rather than `vh` so a phone's
          collapsing address bar does not crop the copy on first paint. */}
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:px-10 lg:pt-32">
        {/* Copy scrim.
            The weave is a bright object directly behind the headline, and the
            global scene scrim is pitched for the quieter sections further down.
            A soft ellipse over the copy column: dense enough behind the words to
            clear WCAG AA against the brightest frame the weave and the metal
            lens can produce between them, and gone by the edges so the weave
            still reads at full strength around the type. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(64%_54%_at_50%_50%,rgba(7,8,11,0.9)_0%,rgba(7,8,11,0.82)_42%,rgba(7,8,11,0.52)_68%,rgba(7,8,11,0.2)_80%,transparent_90%)]"
        />
        {/* Foot. The copy ellipse has thinned to nothing by the bottom edge,
            which leaves the scroll cue sitting on bare weave, and a viewport
            that simply stops reads as an edge rather than as a page carrying
            on. This does both jobs. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(to_top,rgba(7,8,11,0.94)_0%,rgba(7,8,11,0.72)_38%,rgba(7,8,11,0.3)_70%,transparent_100%)]"
        />

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center">
          {/* Availability chip — scarcity signal */}
          <Reveal className="flex justify-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-edge bg-white/[0.035] px-4 py-2 text-[12px] font-medium text-ink-muted backdrop-blur-md transition-colors duration-300 hover:border-accent/45 hover:text-ink sm:text-[13px]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Taking <strong className="font-semibold text-ink">2 new builds</strong>{" "}
              this month
              <span aria-hidden="true" className="hidden h-3 w-px bg-edge sm:block" />
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-accent sm:inline">
                UK Studio
              </span>
            </span>
          </Reveal>

          {/* Cinematic headline */}
          <Reveal delay={80}>
            <h1
              id="hero-heading"
              className="mx-auto mt-6 max-w-5xl text-balance text-center font-display font-bold leading-[0.98] tracking-[-0.045em] text-[clamp(2.15rem,6.9vw,4.9rem)] sm:mt-8"
            >
              <span className="block text-ink">We Build 3D &amp; AI</span>
              <span className="block text-ink">
                Websites That{" "}
                <span className="relative inline-block">
                  <span className="accent-text animate-sheen">Captivate.</span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-linear-to-r from-transparent via-accent to-transparent opacity-80 blur-[2px]"
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
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-center text-sm leading-relaxed text-ink-muted sm:mt-7 sm:text-base lg:text-lg">
              Our prompt-to-3D engine turns a single brief into a fully rendered
              spatial environment — real-time WebGL scenes, AI-written conversion
              copy and scroll-driven depth motion, assembled and deployed while
              your competitors are still waiting on a design mock-up.
            </p>
          </Reveal>

          {/* Dual CTAs */}
          <Reveal delay={240}>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
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

          {/* Trust markers.
              ink-muted rather than the fainter ink-dim: these sit low in the
              stage where the copy scrim has thinned out and the weave is live
              behind them, which ink-dim does not survive. */}
          <Reveal delay={320}>
            <ul className="mx-auto mt-6 flex max-w-3xl flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-9 sm:gap-x-8 sm:gap-y-3">
              {trustMarkers.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-[12px] text-ink-muted transition-colors duration-300 hover:text-ink sm:gap-2.5 sm:text-sm"
                >
                  <Icon
                    className="size-4 shrink-0 text-accent"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* A viewport-height opening image hides the fact that the page
            continues, so it has to say so. */}
        <a
          href="#showreel"
          className="group absolute inset-x-0 bottom-5 mx-auto flex w-fit flex-col items-center gap-1.5 font-mono text-micro uppercase text-ink-muted transition-colors duration-300 hover:text-ink focus-visible:text-ink sm:bottom-7"
        >
          Scroll
          <ChevronDown
            className="size-4 animate-bounce transition-transform duration-300 motion-reduce:animate-none"
            strokeWidth={2}
            aria-hidden="true"
          />
        </a>
      </div>

      {/* Simulated 3D viewframe, below the fold. */}
      <div className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10 lg:pb-36">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal threshold={0.05}>
            <div id="showreel" className="scroll-mt-28">
              <SpatialViewport />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
