import {
  Gauge,
  MousePointerClick,
  PenTool,
  Smartphone,
  Waves,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import SpotlightCard from "@/components/ui/SpotlightCard";
import DepthStack from "@/components/ui/DepthStack";
import Reveal from "@/components/ui/Reveal";

const features = [
  {
    icon: Waves,
    title: "Scroll-Driven Depth Motion",
    body: "Every scroll tick is mapped to a camera path. Sections dolly, rotate and reveal as the visitor moves down the page — a single continuous shot instead of a stack of static blocks.",
    metric: "60fps camera rig",
    glow: "cyan" as const,
  },
  {
    icon: MousePointerClick,
    title: "Cursor-Reactive Parallax",
    body: "Hero objects, product models and background meshes respond to pointer position in real time, so the page feels alive before a visitor has clicked anything.",
    metric: "< 8ms input latency",
    glow: "violet" as const,
  },
  {
    icon: Smartphone,
    title: "Responsive Down To 320px",
    body: "The 3D layer degrades intelligently: full WebGL on desktop, lightweight baked motion on mid-range phones, and a static poster frame when a device asks for reduced motion.",
    metric: "3 render tiers",
    glow: "magenta" as const,
  },
  {
    icon: PenTool,
    title: "AI Copy & Layout Engine",
    body: "We feed your brief into a tuned copy model that writes offer-led headlines, objection-handling body copy and CTAs — then lays them out against the 3D scene for maximum contrast.",
    metric: "Brief → draft in minutes",
    glow: "violet" as const,
  },
  {
    icon: Gauge,
    title: "Performance Budgeted",
    body: "Draco-compressed geometry, lazy scene hydration and streamed textures keep Largest Contentful Paint under two seconds — immersive does not have to mean slow.",
    metric: "LCP < 2.0s target",
    glow: "cyan" as const,
  },
] as const;

export default function ScrollTransformation() {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="relative scroll-mt-24 overflow-x-clip px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-36"
    >
      {/* Section divider glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-edge to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="The 3D Scroll Transformation"
          title={
            <>
              Ordinary pages are flat.{" "}
              <span className="metal-text">Yours will have depth.</span>
            </>
          }
          description="We take the same content a traditional agency would drop into a template and rebuild it as a navigable environment — layered, lit and reactive to every scroll and cursor movement."
        />

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:mt-20 lg:grid-cols-3 lg:gap-6">
          {/* Feature cell — interactive 2D → 3D demonstration */}
          <Reveal className="lg:col-span-2 lg:row-span-2" threshold={0.08}>
            <SpotlightCard
              glow="cyan"
              className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10"
            >
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-chrome/25 bg-chrome/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-chrome">
                  Live demonstration
                </span>
                <h3 className="mt-5 text-2xl font-semibold leading-tight text-ink sm:text-3xl lg:text-[2rem]">
                  From a flat 2D layout to a fully spatial environment
                </h3>
                <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
                  Point at the panel below — or just scroll to it on a touch
                  screen. The single flat plane a normal website lives on
                  separates into independently animated depth layers: the same
                  technique that drives your hero, product showcases and case
                  studies once we rebuild them.
                </p>
              </div>

              <div className="relative rounded-2xl border border-edge/70 bg-void/50 p-6 sm:p-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 grid-mesh-fine-fine rounded-2xl opacity-40"
                />
                <DepthStack />
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Supporting feature cells */}
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 70} threshold={0.1}>
              <SpotlightCard
                glow={feature.glow}
                as="article"
                className="flex h-full flex-col p-6 sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-white/[0.04] text-chrome transition-all duration-500 group-hover/card:scale-110 group-hover/card:border-chrome/50 group-hover/card:shadow-[0_0_28px_-6px_rgba(246,248,251,0.56)]"
                >
                  <feature.icon className="size-5" strokeWidth={1.9} />
                </span>

                <h3 className="mt-5 text-lg font-semibold leading-snug text-ink sm:text-xl">
                  {feature.title}
                </h3>
                <p className="mt-3 grow text-pretty text-sm leading-relaxed text-ink-muted">
                  {feature.body}
                </p>

                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-edge bg-void/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim transition-colors duration-500 group-hover/card:border-chrome/35 group-hover/card:text-chrome">
                  <span aria-hidden="true" className="size-1 rounded-full bg-current" />
                  {feature.metric}
                </span>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
