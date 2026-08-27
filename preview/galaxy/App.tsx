"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Boxes, Cpu, Gauge, Layers, LineChart,
  Radar, Sparkles, Waves, Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import AuraBackground from "../../components/galaxy/AuraBackground";
import BentoGrid, { type BentoItem } from "../../components/galaxy/BentoGrid";
import Footer from "../../components/galaxy/Footer";
import HyperText from "../../components/galaxy/HyperText";
import Nav, { type Route } from "../../components/galaxy/Nav";
import SpotlightCard from "../../components/galaxy/SpotlightCard";
import { SPRING } from "../../components/galaxy/motion";
import { BeamButton, MonoLabel, Section, SectionHead } from "../../components/galaxy/ui";

const ROUTES: Route[] = [
  { path: "/", label: "Index", index: "01" },
  { path: "/capabilities", label: "Capabilities", index: "02" },
  { path: "/work", label: "Work", index: "03" },
  { path: "/studio", label: "Studio", index: "04" },
  { path: "/contact", label: "Contact", index: "05" },
];

const VIOLET = "rgba(99,102,241,0.18)";
const CYAN = "rgba(6,182,212,0.16)";
const FUCHSIA = "rgba(217,70,239,0.15)";

const BENTO: BentoItem[] = [
  {
    icon: Layers,
    title: "Elite Engineering",
    body: "Next.js and WebGL performance systems, authored rather than assembled. Shaders we wrote, budgets we agreed before the first commit.",
    meta: "Orion // 01 — Systems",
    span: "lg:col-span-4",
    accent: VIOLET,
    stroke: "#818CF8",
    visual: "orbit",
  },
  {
    icon: Waves,
    title: "Cinematic Motion",
    body: "Interfaces that feel alive, fluid and weighted. Every transition is a spring with mass behind it, never a linear fade.",
    meta: "Orion // 02 — Motion",
    span: "lg:col-span-2",
    accent: CYAN,
    stroke: "#22D3EE",
    visual: "wave",
  },
  {
    icon: LineChart,
    title: "Conversion Infrastructure",
    body: "Turning high traffic into high revenue. Instrumented funnels, measured against the number that actually pays for the build.",
    meta: "Orion // 03 — Revenue",
    span: "lg:col-span-6",
    accent: FUCHSIA,
    stroke: "#E879F9",
    visual: "bars",
  },
];

const STATS = [
  { value: "48h", label: "Build window" },
  { value: "<1.5s", label: "LCP budget" },
  { value: "100%", label: "Source handover" },
  { value: "6", label: "Routes, one context" },
];

/* ========================================================================== */

export default function App() {
  const [path, setPath] = useState<string>(() => readHash());

  useEffect(() => {
    const onHash = () => setPath(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (next: string) => {
    window.location.hash = next;
    setPath(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <>
      <AuraBackground />
      <Nav routes={ROUTES} current={path} onNavigate={navigate} />

      <main id="main" className="relative pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={{ ...SPRING, restDelta: 0.001 }}
          >
            {path === "/" && <IndexPage onNavigate={navigate} />}
            {path === "/capabilities" && <CapabilitiesPage />}
            {path === "/work" && <WorkPage />}
            {path === "/studio" && <StudioPage />}
            {path === "/contact" && <ContactPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer routes={ROUTES} onNavigate={navigate} />
    </>
  );
}

function readHash(): string {
  const raw = window.location.hash.replace(/^#/, "");
  return ROUTES.some((r) => r.path === raw) ? raw : "/";
}

/* ============================== INDEX ==================================== */

function IndexPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <>
      {/* The announcement. Deliberately close to empty: one badge, one line,
          one action. Everything else on the page is below the fold. */}
      <section className="relative flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center px-6 py-24 text-center sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-xl"
        >
          <MonoLabel dot>Orion Creative Studio</MonoLabel>
        </motion.div>

        <h1
          aria-label="We Architect Digital Galaxies."
          className="mx-auto mt-10 max-w-5xl text-balance text-[clamp(2.6rem,8.5vw,7rem)] font-medium leading-[0.9] tracking-tighter text-[#FAFAFA]"
        >
          <HyperText text="We Architect" delay={0.25} />
          <br />
          <HyperText text="Digital Galaxies." delay={0.45} accent />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 1.15 }}
          className="mx-auto mt-9 max-w-xl text-pretty text-base leading-relaxed text-[#888888] sm:text-lg"
        >
          An elite engineering studio building real-time, high-performance web
          systems for brands that intend to be the reference in their category.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 1.3 }}
          className="mt-12 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center"
        >
          <BeamButton
            href="#/contact"
            onClick={() => onNavigate("/contact")}
            icon={<ArrowRight className="size-4" strokeWidth={2} />}
          >
            Initiate Discovery
          </BeamButton>
          <BeamButton href="#/work" variant="ghost" onClick={() => onNavigate("/work")}>
            View Selected Work
          </BeamButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.9 }}
          className="absolute inset-x-0 bottom-8 mx-auto w-fit"
        >
          <MonoLabel>Orion // System v1.0</MonoLabel>
        </motion.div>
      </section>

      {/* Bento */}
      <Section id="capabilities">
        <div className="mb-14 flex flex-col justify-between gap-8 sm:mb-16 sm:flex-row sm:items-end">
          <SectionHead
            label="Core Capabilities"
            title={<>Three disciplines. <span className="galaxy-accent-text">One standard.</span></>}
          />
          <MonoLabel className="shrink-0">Orion // Index 002</MonoLabel>
        </div>
        <BentoGrid items={BENTO} />
      </Section>

      {/* Stats */}
      <Section className="!py-0">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...SPRING, delay: i * 0.07 }}
              className="bg-[#050505] p-8 sm:p-10"
            >
              <p className="text-4xl font-medium tracking-tighter text-[#FAFAFA] sm:text-5xl">{s.value}</p>
              <MonoLabel className="mt-4">{s.label}</MonoLabel>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ========================== CAPABILITIES ================================= */

const DISCIPLINES = [
  {
    icon: Layers, name: "Real-time WebGL", meta: "Orion // Systems",
    body: "Bespoke scenes authored in GLSL. Procedural wherever possible, so there is no multi-megabyte model to download before anything appears on screen.",
    points: ["Authored vertex and fragment shaders", "Procedural geometry over downloaded meshes", "Pointer and scroll wired to one shared state", "Reduced-motion and no-WebGL paths built alongside"],
    accent: VIOLET,
  },
  {
    icon: Gauge, name: "Performance engineering", meta: "Orion // Budget",
    body: "A budget agreed before the first commit and measured before launch. Immersive and fast are not opposites, but they only coexist deliberately.",
    points: ["LCP, INP and CLS budgets set per route", "Canvas hydration deferred past first paint", "Automatic resolution downgrade on weak hardware", "Measured before and after report at handover"],
    accent: CYAN,
  },
  {
    icon: Boxes, name: "Application architecture", meta: "Orion // Structure",
    body: "App Router, server components by default, and a persistent canvas that survives navigation so moving between pages flies a camera rather than rebuilding a scene.",
    points: ["Server components unless interaction demands otherwise", "One WebGL context across every route", "Route-aware camera choreography", "Typed end to end, clean build as the gate"],
    accent: FUCHSIA,
  },
  {
    icon: Cpu, name: "Conversion infrastructure", meta: "Orion // Revenue",
    body: "The instrumentation that tells you whether any of the above paid for itself. Funnels, events and a number you can hold us to.",
    points: ["Event schema modelled on your funnel", "Server-side tracking where the browser cannot be trusted", "Experiment harness for offer and copy", "Monthly report against the commercial target"],
    accent: VIOLET,
  },
];

function CapabilitiesPage() {
  return (
    <>
      <PageHero
        label="Capabilities"
        title={<>The full <span className="galaxy-accent-text">system stack.</span></>}
        lede="Four disciplines, delivered by the same four people who sell them. Nothing here is subcontracted."
      />
      <Section className="!pt-0">
        <div className="flex flex-col gap-5">
          {DISCIPLINES.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ ...SPRING, delay: i * 0.06 }}
            >
              <SpotlightCard spotlight={d.accent}>
                <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                        <d.icon className="size-[18px]" strokeWidth={1.6} />
                      </span>
                      <MonoLabel>{d.meta}</MonoLabel>
                    </div>
                    <h2 className="mt-7 text-3xl font-medium tracking-tighter text-[#FAFAFA] sm:text-4xl">{d.name}</h2>
                    <p className="mt-5 max-w-lg text-pretty leading-relaxed text-[#888888]">{d.body}</p>
                  </div>
                  <ul className="flex flex-col justify-center gap-4">
                    {d.points.map((pt) => (
                      <li key={pt} className="flex gap-4 border-b border-white/[0.06] pb-4 text-sm text-[#888888] last:border-0">
                        <Zap className="mt-0.5 size-3.5 shrink-0 text-[#06B6D4]" strokeWidth={2} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ============================== WORK ===================================== */

const WORK = [
  { client: "Meridian Atelier", sector: "Retail", year: "2025", accent: VIOLET, visual: "wave" as const,
    line: "A made-to-measure tailor whose product cannot be photographed flat. The configurator renders cloth in real time.",
    metrics: [["Enquiries", "+63%"], ["LCP", "1.1s"], ["Session", "3m 42s"]] },
  { client: "North Quay", sector: "Property", year: "2025", accent: CYAN, visual: "bars" as const,
    line: "Off-plan apartments sold before the frame went up. The scroll flies through the building at real scale.",
    metrics: [["Reservations", "41"], ["LCP", "1.3s"], ["Bounce", "-28%"]] },
  { client: "Cassia House", sector: "Hospitality", year: "2024", accent: FUCHSIA, visual: "orbit" as const,
    line: "Twelve rooms competing against aggregators. The room tour and the booking flow are the same interface.",
    metrics: [["Direct bookings", "2.1x"], ["LCP", "0.9s"], ["Saved", "31k"]] },
  { client: "Halden Precision", sector: "Industrial", year: "2024", accent: VIOLET, visual: "bars" as const,
    line: "Five-axis machining explained to procurement officers who are not engineers. Tolerances track the part as it turns.",
    metrics: [["Quotes", "+88%"], ["LCP", "1.2s"], ["Downloads", "2.4x"]] },
];

function WorkPage() {
  return (
    <>
      <PageHero
        label="Selected Work"
        title={<>Four builds, and what <span className="galaxy-accent-text">each one moved.</span></>}
        lede="Every engagement shipped against a performance budget and a commercial target. Both are quoted."
      />
      <Section className="!pt-0">
        <div className="grid gap-5 lg:grid-cols-2">
          {WORK.map((w, i) => (
            <motion.div
              key={w.client}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ ...SPRING, delay: i * 0.07 }}
            >
              <SpotlightCard className="h-full" spotlight={w.accent}>
                <div className="flex h-full flex-col p-8 sm:p-10">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-medium tracking-tight text-[#FAFAFA] sm:text-3xl">{w.client}</h2>
                      <MonoLabel className="mt-3">{w.sector} // {w.year}</MonoLabel>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-[#888888] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FAFAFA]" strokeWidth={1.6} />
                  </div>
                  <p className="mt-6 max-w-md text-pretty text-sm leading-relaxed text-[#888888]">{w.line}</p>
                  <div className="mt-auto grid grid-cols-3 gap-4 pt-10">
                    {w.metrics.map(([label, value]) => (
                      <div key={label}>
                        <p className="text-2xl font-medium tracking-tighter text-[#FAFAFA]">{value}</p>
                        <MonoLabel className="mt-2 !tracking-[0.2em]">{label}</MonoLabel>
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl rounded-2xl border border-dashed border-white/10 p-6 text-sm leading-relaxed text-[#888888]">
          <span className="text-[#FAFAFA]">A note on these numbers.</span> The studio and its
          clients are a demonstration set built for this preview. The figures are illustrative
          sample data, not audited results &mdash; which is exactly what any agency quoting
          metrics should tell you.
        </p>
      </Section>
    </>
  );
}

/* ============================= STUDIO ==================================== */

const PRINCIPLES = [
  { icon: Gauge, t: "Fast is a feature", b: "A budget is agreed before the first commit and measured before launch. If a scene cannot meet it, the scene changes, not the budget." },
  { icon: Radar, t: "Scope is fixed so quality is not", b: "Open-ended projects negotiate quality away under deadline. Fixed scope leaves only one variable: how well it is built." },
  { icon: Sparkles, t: "Accessible by construction", b: "Reduced motion, keyboard operation and contrast are designed with the effect, not retrofitted after a report comes back." },
  { icon: Boxes, t: "You own everything", b: "Source, scenes, pipeline. No proprietary editor lock-in, no per-view licensing. If you leave, you leave with all of it." },
];

function StudioPage() {
  return (
    <>
      <PageHero
        label="The Studio"
        title={<>Four people, one standard, a <span className="galaxy-accent-text">very short list.</span></>}
        lede="Orion is small on purpose. Everyone who sells the work also builds it, which is the only reliable way to keep a promise about a deadline."
      />
      <Section className="!pt-0">
        <div className="grid gap-5 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ ...SPRING, delay: i * 0.07 }}
            >
              <SpotlightCard className="h-full" spotlight={i % 2 ? CYAN : VIOLET}>
                <div className="flex h-full flex-col p-8 sm:p-10">
                  <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <p.icon className="size-[18px]" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-7 text-xl font-medium tracking-tight text-[#FAFAFA]">{p.t}</h3>
                  <p className="mt-4 text-pretty text-sm leading-relaxed text-[#888888]">{p.b}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ============================ CONTACT ==================================== */

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHero
        label="Initiate Discovery"
        title={<>Tell us what you are <span className="galaxy-accent-text">building.</span></>}
        lede="No discovery call to book a discovery call. Send the brief and we reply the same working day."
      />
      <Section className="!pt-0">
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <SpotlightCard spotlight={VIOLET}>
            <form
              className="flex flex-col gap-6 p-8 sm:p-10"
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            >
              {[
                { label: "Your name", type: "text", placeholder: "Alex Mercer" },
                { label: "Email", type: "email", placeholder: "alex@company.com" },
              ].map((f) => (
                <label key={f.label} className="flex flex-col gap-3">
                  <MonoLabel>{f.label}</MonoLabel>
                  <input
                    type={f.type}
                    required
                    placeholder={f.placeholder}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-[15px] text-[#FAFAFA] placeholder:text-[#555] transition-colors duration-300 focus:border-[#6366F1]/60"
                  />
                </label>
              ))}
              <label className="flex flex-col gap-3">
                <MonoLabel>What are you building?</MonoLabel>
                <textarea
                  required
                  rows={5}
                  placeholder="A real-time configurator for a made-to-measure tailor."
                  className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-[15px] text-[#FAFAFA] placeholder:text-[#555] transition-colors duration-300 focus:border-[#6366F1]/60"
                />
              </label>
              <motion.button
                type="submit"
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING}
                className="relative mt-2 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-medium tracking-tight text-[#030303] shadow-[0_0_50px_-12px_rgba(99,102,241,0.9)]"
              >
                Send the brief
              </motion.button>
              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING}
                  className="rounded-2xl border border-[#06B6D4]/40 bg-[#06B6D4]/10 px-5 py-4 text-sm text-[#FAFAFA]"
                >
                  Captured. This preview does not transmit anything &mdash; on the live site
                  this would be in the studio inbox now.
                </motion.p>
              )}
            </form>
          </SpotlightCard>

          <SpotlightCard spotlight={CYAN}>
            <div className="flex h-full flex-col gap-8 p-8 sm:p-10">
              <div>
                <MonoLabel dot>Direct lines</MonoLabel>
                <ul className="mt-7 flex flex-col gap-5">
                  {[
                    ["Email", "studio@orion.dev"],
                    ["Phone", "+44 20 7946 0148"],
                    ["Studio", "London, United Kingdom"],
                    ["Reply", "Same working day"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex flex-col gap-1.5 border-b border-white/[0.06] pb-4 last:border-0">
                      <MonoLabel>{k}</MonoLabel>
                      <span className="text-[15px] text-[#FAFAFA]">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                <MonoLabel>Orion // Availability</MonoLabel>
                <p className="mt-4 text-sm leading-relaxed text-[#888888]">
                  Two build slots remain this quarter. Briefs are answered in order of
                  arrival, not deal size.
                </p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </Section>
    </>
  );
}

/* ============================= SHARED ==================================== */

function PageHero({ label, title, lede }: { label: string; title: React.ReactNode; lede: string }) {
  return (
    <Section className="!pb-16 !pt-28 sm:!pt-36">
      <MonoLabel dot>{label}</MonoLabel>
      <h1 className="mt-8 max-w-4xl text-balance text-[clamp(2.4rem,6.5vw,5rem)] font-medium leading-[0.92] tracking-tighter text-[#FAFAFA]">
        {title}
      </h1>
      <p className="mt-8 max-w-xl text-pretty leading-relaxed text-[#888888] sm:text-lg">{lede}</p>
    </Section>
  );
}
