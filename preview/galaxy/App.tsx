"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Boxes, Cpu, Gauge, Layers, LineChart, Menu, Radar, Waves, X,
} from "lucide-react";
import { useEffect, useState } from "react";

import HyperText from "../../components/galaxy/HyperText";
import NebulaCanvas from "../../components/galaxy/NebulaCanvas";
import ScrambleText from "../../components/galaxy/ScrambleText";
import SpotlightCard from "../../components/galaxy/SpotlightCard";
import { Corner, Readout, Ticks } from "../../components/galaxy/HUD";
import { SPRING } from "../../components/galaxy/motion";

const ROUTES = [
  { path: "/", label: "Index", index: "001" },
  { path: "/capabilities", label: "Capabilities", index: "002" },
  { path: "/work", label: "Work", index: "003" },
  { path: "/studio", label: "Studio", index: "004" },
  { path: "/contact", label: "Contact", index: "005" },
];

/* ==========================================================================
   Small shared pieces. Everything is squared off and hairlined rather than
   rounded and glassy: the chrome should read as instrumentation around the
   render, not as a card deck floating over it.
   ========================================================================== */

function Mono({ children, className = "", live = false }: { children: React.ReactNode; className?: string; live?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 ${className}`}>
      {live && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#06B6D4] opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[#06B6D4]" />
        </span>
      )}
      {children}
    </span>
  );
}

function Rule({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-white/10" />
      {label && <Mono>{label}</Mono>}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Cta({ children, onClick, primary = false }: { children: React.ReactNode; onClick?: () => void; primary?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0, scale: 0.99 }}
      transition={SPRING}
      className={`group relative inline-flex items-center gap-3 px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] ${
        primary
          ? "bg-white text-black"
          : "border border-white/15 text-white/80 hover:border-[#06B6D4]/70 hover:text-white"
      }`}
    >
      {/* A hairline that sweeps the bottom edge on hover. One line of light,
          not a glowing halo -- the halo is the template move. */}
      {!primary && (
        <span className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-[#06B6D4] transition-transform duration-500 group-hover:scale-x-100" />
      )}
      {children}
      <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={2} />
    </motion.button>
  );
}

function PageShell({
  index, label, title, lede, children,
}: {
  index: string; label: string; title: React.ReactNode; lede: string; children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 pb-32 pt-32 sm:px-10 lg:px-16">
      <div className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Mono live>{index} // {label}</Mono>
          <h1 className="mt-7 max-w-4xl text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[0.92] tracking-[-0.045em] text-white">
            {title}
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-white/45 lg:text-right">{lede}</p>
      </div>
      {children}
    </div>
  );
}

/* ========================================================================== */

export default function App() {
  const [path, setPath] = useState<string>(() => read());
  const [open, setOpen] = useState(false);
  const [tel, setTel] = useState({ fps: 60, steps: 56, scale: 0.58 });

  useEffect(() => {
    const on = () => setPath(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const go = (next: string) => {
    window.location.hash = next;
    setPath(next);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <>
      <NebulaCanvas onTelemetry={setTel} />
      {/* One flat scrim. The render is bright in the middle, so the type needs
          a floor -- but a soft radial vignette would fight the hard chrome. */}
      {/* The scrim is route-aware. The index keeps its type in one left-hand
          column, so it can hold a hard diagonal and leave the render at full
          strength where nothing sits on it. The inner pages run copy the full
          width, so they need an even wash instead -- the same diagonal would
          leave body text sitting on the bright core. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        animate={{ opacity: 1 }}
        style={{
          background:
            path === "/"
              ? "linear-gradient(101deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.88) 26%, rgba(0,0,0,0.74) 45%, rgba(0,0,0,0.30) 60%, rgba(0,0,0,0.10) 73%, rgba(0,0,0,0.36) 88%, rgba(0,0,0,0.78) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.60) 34%, rgba(0,0,0,0.66) 100%)",
          transition: "background 600ms ease",
        }}
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-6 px-6 sm:px-10 lg:px-16">
          <button onClick={() => go("/")} className="flex items-baseline gap-3" aria-label="Orion, index">
            <span className="text-[13px] font-medium tracking-[0.34em] text-white">ORION</span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-white/35 sm:inline">
              Creative Studio
            </span>
          </button>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {ROUTES.map((r) => (
              <button
                key={r.path}
                onClick={() => go(r.path)}
                aria-current={r.path === path ? "page" : undefined}
                className="group relative py-1 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-300"
              >
                <span className={r.path === path ? "text-white" : "text-white/40 group-hover:text-white/80"}>
                  {r.index} {r.label}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[#06B6D4] transition-transform duration-500 ${
                    r.path === path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                  }`}
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => go("/contact")}
              className="hidden border border-white/15 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 transition-colors duration-300 hover:border-[#06B6D4]/70 hover:text-white sm:block"
            >
              Initiate Discovery
            </button>
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-white lg:hidden">
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-end px-6 sm:px-10">
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white">
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="px-6 sm:px-10" aria-label="Mobile">
              {ROUTES.map((r, i) => (
                <motion.button
                  key={r.path}
                  initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.04 + i * 0.05 }}
                  onClick={() => go(r.path)}
                  className="flex w-full items-baseline gap-5 border-b border-white/10 py-6 text-left"
                >
                  <Mono>{r.index}</Mono>
                  <span className="text-3xl font-medium tracking-[-0.04em] text-white">{r.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 0.5 }}
          >
            {path === "/" && <Index go={go} tel={tel} />}
            {path === "/capabilities" && <Capabilities />}
            {path === "/work" && <Work />}
            {path === "/studio" && <Studio />}
            {path === "/contact" && <Contact />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative border-t border-white/[0.08] bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-14 sm:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <p className="max-w-xl text-[clamp(1.9rem,4.5vw,3.4rem)] font-medium leading-[0.94] tracking-[-0.045em] text-white">
              Let&rsquo;s build something<br />
              <span className="text-[#06B6D4]">at scale.</span>
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {ROUTES.map((r) => (
                <button key={r.path} onClick={() => go(r.path)} className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 transition-colors duration-300 hover:text-white">
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:justify-between">
            <Mono>Orion Creative Studio // London</Mono>
            <Mono>System v1.0 // Demonstration build</Mono>
          </div>
        </div>
      </footer>
    </>
  );
}

function read() {
  const raw = window.location.hash.replace(/^#/, "");
  return ROUTES.some((r) => r.path === raw) ? raw : "/";
}

/* ============================== INDEX ==================================== */

function Index({ go, tel }: { go: (p: string) => void; tel: { fps: number; steps: number; scale: number } }) {
  return (
    <>
      {/* The announcement occupies the edges of the frame and leaves the
          middle empty, so the thing you look at first is the render itself
          rather than a stack of centred text sitting on top of it. */}
      <section className="relative flex min-h-svh flex-col justify-end pb-14 pt-24">
        <Ticks side="top" />
        <Ticks side="bottom" />
        <Corner at="tl" /><Corner at="tr" /><Corner at="bl" /><Corner at="br" />

        <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-16">
          <div className="grid items-end gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <ScrambleText
                text="ORION CREATIVE STUDIO"
                className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#06B6D4]"
                delay={200}
              />

              <h1
                aria-label="We Architect Digital Galaxies."
                style={{ textShadow: "0 2px 48px rgba(0,0,0,0.9), 0 0 14px rgba(0,0,0,0.65)" }}
                className="mt-8 text-[clamp(2.8rem,9.5vw,9rem)] font-medium leading-[0.86] tracking-[-0.055em] text-white"
              >
                <HyperText text="We Architect" delay={0.55} stagger={0.022} />
                <br />
                <span className="relative inline-block">
                  <HyperText text="Digital Galaxies." delay={0.78} stagger={0.022} />
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ ...SPRING, delay: 1.5 }}
                    className="absolute -bottom-1 left-0 h-px w-full origin-left bg-[#06B6D4]"
                  />
                </span>
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 1.6 }}
                className="mt-10 flex flex-col items-start gap-4 sm:flex-row"
              >
                <Cta primary onClick={() => go("/contact")}>Initiate Discovery</Cta>
                <Cta onClick={() => go("/work")}>View Selected Work</Cta>
              </motion.div>
            </div>

            {/* Spec column. This is the flex: the numbers are the renderer's
                own, read back every half second. */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 1.35 }}
              className="lg:justify-self-end lg:text-right"
            >
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/45">
                An elite engineering studio building real-time systems for brands that
                intend to be the reference in their category.
              </p>
              <div className="max-w-xs lg:ml-auto">
                <Readout fps={tel.fps} steps={tel.steps} scale={tel.scale} />
              </div>
              <Mono className="mt-6">Live // not a video</Mono>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capability grid */}
      <section className="mx-auto w-full max-w-[1600px] px-6 py-28 sm:px-10 lg:px-16 lg:py-40">
        <Rule label="Core Capabilities" />
        <h2 className="mt-14 max-w-3xl text-[clamp(1.9rem,4.4vw,3.4rem)] font-medium leading-[0.95] tracking-[-0.045em] text-white">
          Three disciplines. <span className="text-white/35">One standard.</span>
        </h2>

        <div className="mt-14 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-3">
          {[
            { i: "01", icon: Layers, t: "Elite Engineering", b: "Next.js and WebGL performance systems, authored rather than assembled. Shaders we wrote, budgets we agreed before the first commit.", m: "Systems" },
            { i: "02", icon: Waves, t: "Cinematic Motion", b: "Interfaces that feel alive, fluid and weighted. Every transition is a spring with mass behind it, never a linear fade.", m: "Motion" },
            { i: "03", icon: LineChart, t: "Conversion Infrastructure", b: "Turning high traffic into high revenue. Instrumented funnels, measured against the number that pays for the build.", m: "Revenue" },
          ].map((c, n) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ ...SPRING, delay: n * 0.08 }}
              className="group relative flex min-h-[26rem] flex-col justify-between bg-black/70 p-9 transition-colors duration-500 hover:bg-black/40"
            >
              <div className="flex items-start justify-between">
                <c.icon className="size-5 text-white/70" strokeWidth={1.4} />
                <Mono>{c.i}</Mono>
              </div>
              <div>
                <span className="mb-6 block h-px w-10 bg-[#06B6D4] transition-all duration-700 group-hover:w-24" />
                <h3 className="text-2xl font-medium tracking-[-0.03em] text-white">{c.t}</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">{c.b}</p>
                <Mono className="mt-8">Orion // {c.m}</Mono>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-px grid gap-px border border-t-0 border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {[["48h", "Build window"], ["<1.5s", "LCP budget"], ["100%", "Source handover"], ["06", "Routes, one context"]].map(([v, l]) => (
            <div key={l} className="bg-black/70 p-8">
              <p className="text-4xl font-medium tracking-[-0.05em] tabular-nums text-white">{v}</p>
              <Mono className="mt-3">{l}</Mono>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ========================== INNER PAGES ================================== */

const DISCIPLINES = [
  { icon: Layers, n: "01", name: "Real-time WebGL", body: "Bespoke scenes authored in GLSL. Procedural wherever possible, so there is no multi-megabyte model to download before anything appears.", pts: ["Authored vertex and fragment shaders", "Procedural geometry over downloaded meshes", "Pointer and scroll on one shared state", "Reduced-motion and no-WebGL paths built alongside"] },
  { icon: Gauge, n: "02", name: "Performance engineering", body: "A budget agreed before the first commit and measured before launch. Immersive and fast are not opposites, but they only coexist deliberately.", pts: ["LCP, INP and CLS budgets per route", "Canvas hydration deferred past first paint", "Automatic resolution and sample downgrade", "Measured before and after at handover"] },
  { icon: Boxes, n: "03", name: "Application architecture", body: "App Router, server components by default, and a persistent canvas that survives navigation so moving between pages flies a camera rather than rebuilding a scene.", pts: ["Server components unless interaction demands otherwise", "One WebGL context across every route", "Route-aware camera choreography", "Typed end to end, clean build as the gate"] },
  { icon: Cpu, n: "04", name: "Conversion infrastructure", body: "The instrumentation that tells you whether any of the above paid for itself. Funnels, events and a number you can hold us to.", pts: ["Event schema modelled on your funnel", "Server-side tracking where the browser cannot be trusted", "Experiment harness for offer and copy", "Monthly report against the commercial target"] },
];

function Capabilities() {
  return (
    <PageShell
      index="002" label="Capabilities"
      title={<>The full <span className="text-white/35">system stack.</span></>}
      lede="Four disciplines, delivered by the same four people who sell them. Nothing here is subcontracted."
    >
      <div className="mt-16 border border-white/10">
        {DISCIPLINES.map((d, i) => (
          <motion.article
            key={d.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ ...SPRING, delay: i * 0.05 }}
            className="group grid gap-8 border-b border-white/10 bg-black/60 p-8 transition-colors duration-500 last:border-b-0 hover:bg-black/30 sm:p-10 lg:grid-cols-[auto_1.1fr_1fr] lg:gap-14"
          >
            <Mono className="lg:pt-2">{d.n}</Mono>
            <div>
              <d.icon className="size-5 text-white/70" strokeWidth={1.4} />
              <h2 className="mt-6 text-2xl font-medium tracking-[-0.035em] text-white sm:text-3xl">{d.name}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">{d.body}</p>
            </div>
            <ul className="flex flex-col justify-center gap-3">
              {d.pts.map((p) => (
                <li key={p} className="flex items-baseline gap-3 border-b border-white/[0.07] pb-3 text-sm text-white/55 last:border-0">
                  <span className="size-1 shrink-0 translate-y-[-2px] bg-[#06B6D4]" />
                  {p}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}

const WORK = [
  { c: "Meridian Atelier", s: "Retail", y: "2025", l: "A made-to-measure tailor whose product cannot be photographed flat. The configurator renders cloth in real time.", m: [["Enquiries", "+63%"], ["LCP", "1.1s"], ["Session", "3m42"]] },
  { c: "North Quay", s: "Property", y: "2025", l: "Off-plan apartments sold before the frame went up. The scroll flies through the building at real scale.", m: [["Reservations", "41"], ["LCP", "1.3s"], ["Bounce", "-28%"]] },
  { c: "Cassia House", s: "Hospitality", y: "2024", l: "Twelve rooms against the aggregators. The room tour and the booking flow are the same interface.", m: [["Direct", "2.1x"], ["LCP", "0.9s"], ["Saved", "31k"]] },
  { c: "Halden Precision", s: "Industrial", y: "2024", l: "Five-axis machining explained to procurement officers who are not engineers. Tolerances track the part as it turns.", m: [["Quotes", "+88%"], ["LCP", "1.2s"], ["Specs", "2.4x"]] },
];

function Work() {
  return (
    <PageShell
      index="003" label="Selected Work"
      title={<>Four builds, and what <span className="text-white/35">each one moved.</span></>}
      lede="Every engagement shipped against a performance budget and a commercial target. Both are quoted."
    >
      <div className="mt-16 border-t border-white/10">
        {WORK.map((w, i) => (
          <motion.article
            key={w.c}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ ...SPRING, delay: i * 0.05 }}
            className="group grid gap-6 border-b border-white/10 py-10 transition-colors duration-500 hover:bg-white/[0.02] lg:grid-cols-[auto_1fr_auto_auto] lg:items-center lg:gap-12 lg:px-6"
          >
            <Mono>{String(i + 1).padStart(2, "0")}</Mono>
            <div>
              <h2 className="text-2xl font-medium tracking-[-0.035em] text-white sm:text-3xl">{w.c}</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/45">{w.l}</p>
            </div>
            <div className="flex gap-8">
              {w.m.map(([k, v]) => (
                <div key={k}>
                  <p className="text-xl font-medium tabular-nums tracking-[-0.03em] text-white">{v}</p>
                  <Mono className="mt-1 !tracking-[0.16em]">{k}</Mono>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <Mono>{w.s} // {w.y}</Mono>
              <ArrowUpRight className="size-4 text-white/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#06B6D4]" strokeWidth={1.6} />
            </div>
          </motion.article>
        ))}
      </div>
      <p className="mt-10 max-w-2xl border border-dashed border-white/10 p-6 text-sm leading-relaxed text-white/40">
        <span className="text-white/70">A note on these numbers.</span> The studio and its clients
        are a demonstration set built for this preview. The figures are illustrative sample data,
        not audited results &mdash; which is exactly what any agency quoting metrics should tell you.
      </p>
    </PageShell>
  );
}

function Studio() {
  const P = [
    { icon: Gauge, t: "Fast is a feature", b: "A budget is agreed before the first commit and measured before launch. If a scene cannot meet it, the scene changes, not the budget." },
    { icon: Radar, t: "Scope is fixed so quality is not", b: "Open-ended projects negotiate quality away under deadline. Fixed scope leaves one variable: how well it is built." },
    { icon: Layers, t: "Accessible by construction", b: "Reduced motion, keyboard operation and contrast are designed with the effect, not retrofitted after a report comes back." },
    { icon: Boxes, t: "You own everything", b: "Source, scenes, pipeline. No proprietary editor lock-in, no per-view licensing. If you leave, you leave with all of it." },
  ];
  return (
    <PageShell
      index="004" label="The Studio"
      title={<>Four people, one standard, a <span className="text-white/35">very short list.</span></>}
      lede="Orion is small on purpose. Everyone who sells the work also builds it, which is the only reliable way to keep a promise about a deadline."
    >
      <div className="mt-16 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
        {P.map((p, i) => (
          <motion.div
            key={p.t}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ ...SPRING, delay: i * 0.06 }}
            className="group bg-black/70 p-9 transition-colors duration-500 hover:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <p.icon className="size-5 text-white/70" strokeWidth={1.4} />
              <Mono>{String(i + 1).padStart(2, "0")}</Mono>
            </div>
            <span className="mb-6 mt-10 block h-px w-10 bg-[#06B6D4] transition-all duration-700 group-hover:w-24" />
            <h3 className="text-xl font-medium tracking-[-0.03em] text-white">{p.t}</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/45">{p.b}</p>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell
      index="005" label="Initiate Discovery"
      title={<>Tell us what you are <span className="text-white/35">building.</span></>}
      lede="No discovery call to book a discovery call. Send the brief and we reply the same working day."
    >
      <div className="mt-16 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-[1.4fr_1fr]">
        <form className="flex flex-col gap-7 bg-black/70 p-8 sm:p-10" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          {[["Your name", "text", "Alex Mercer"], ["Email", "email", "alex@company.com"]].map(([l, t, ph]) => (
            <label key={l} className="flex flex-col gap-3">
              <Mono>{l}</Mono>
              <input
                type={t} required placeholder={ph}
                className="w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[15px] text-white placeholder:text-white/20 focus:border-[#06B6D4] focus:outline-none"
              />
            </label>
          ))}
          <label className="flex flex-col gap-3">
            <Mono>What are you building?</Mono>
            <textarea
              required rows={4} placeholder="A real-time configurator for a made-to-measure tailor."
              className="w-full resize-y border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[15px] text-white placeholder:text-white/20 focus:border-[#06B6D4] focus:outline-none"
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-5">
            <Cta primary>Send the brief</Cta>
            {sent && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING}>
                <Mono live>Captured // preview does not transmit</Mono>
              </motion.span>
            )}
          </div>
        </form>

        <div className="flex flex-col gap-8 bg-black/70 p-8 sm:p-10">
          <Mono live>Direct lines</Mono>
          <ul className="flex flex-col gap-5">
            {[["Email", "studio@orion.dev"], ["Phone", "+44 20 7946 0148"], ["Studio", "London, United Kingdom"], ["Reply", "Same working day"]].map(([k, v]) => (
              <li key={k} className="flex flex-col gap-1.5 border-b border-white/[0.07] pb-4 last:border-0">
                <Mono>{k}</Mono>
                <span className="text-[15px] text-white">{v}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto border border-white/10 p-6">
            <Mono>Availability</Mono>
            <p className="mt-4 text-sm leading-relaxed text-white/45">
              Two build slots remain this quarter. Briefs are answered in order of arrival,
              not deal size.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
