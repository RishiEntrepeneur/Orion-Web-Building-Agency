"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Boxes, Cpu, Feather, Gauge, Layers, LineChart, Menu, Radar, Sparkles, Waves, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Birds from "../../components/galaxy/Birds";
import CommandPalette, { type Command } from "../../components/galaxy/CommandPalette";
import Cursor from "../../components/galaxy/Cursor";
import PromptToSite from "../../components/galaxy/PromptToSite";
import CloudCanvas from "../../components/galaxy/CloudCanvas";
import Journey from "../../components/galaxy/Journey";
import { SPRING } from "../../components/galaxy/motion";

const ROUTES = [
  { path: "/", label: "Dream", index: "01" },
  { path: "/capabilities", label: "Craft", index: "02" },
  { path: "/work", label: "Work", index: "03" },
  { path: "/studio", label: "Studio", index: "04" },
  { path: "/contact", label: "Begin", index: "05" },
];

/* ========================================================================== */

function Mono({ children, className = "", live = false }: { children: React.ReactNode; className?: string; live?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-mute ${className}`}>
      {live && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
        </span>
      )}
      {children}
    </span>
  );
}

/** Every button in the system. The fill wipes up from the base on hover. */
function Btn({
  children, onClick, primary = false, icon,
}: { children: React.ReactNode; onClick?: () => void; primary?: boolean; icon?: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ y: -1, scale: 0.99 }}
      transition={SPRING}
      className={`group relative isolate inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[14px] font-medium tracking-tight ${
        primary
          ? "bg-ink text-cream shadow-[0_14px_34px_-14px_rgba(27,33,64,0.75)]"
          : "border border-ink/15 bg-cream/60 text-ink backdrop-blur-md"
      }`}
    >
      {!primary && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(0.2,0.65,0.3,0.9)] group-hover:scale-y-100"
        />
      )}
      <span className={primary ? "" : "transition-colors duration-500 group-hover:text-cream"}>{children}</span>
      {icon && (
        <span className={`transition-all duration-500 group-hover:translate-x-1 ${primary ? "" : "group-hover:text-cream"}`}>
          {icon}
        </span>
      )}
    </motion.button>
  );
}

/** A word that lifts letter by letter when you hover it. */
function LiftWord({ word, className = "", delay = 0 }: { word: string; className?: string; delay?: number }) {
  return (
    <span className={`group/word inline-block ${className}`}>
      {word.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: "0.5em", rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SPRING, delay: delay + i * 0.035 }}
          whileHover={{ y: -10, transition: { type: "spring", mass: 0.4, stiffness: 240, damping: 12 } }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      whileHover={{ y: -8 }}
      transition={SPRING}
      className={`card group relative isolate overflow-hidden rounded-[26px] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(91,99,232,0.13), transparent 70%)" }}
      />
      {children}
    </motion.div>
  );
}

function Shell({ index, label, title, lede, children }: {
  index: string; label: string; title: React.ReactNode; lede: string; children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 pb-28 pt-32 sm:px-10 lg:px-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
        className="copy-veil max-w-4xl"
      >
        <Mono live>{index} &mdash; {label}</Mono>
        <h1 className="ink-lift mt-6 font-display text-[clamp(2.6rem,7vw,5.6rem)] font-normal leading-[0.95] tracking-[-0.02em] text-ink">
          {title}
        </h1>
        <p className="ink-lift mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">{lede}</p>
      </motion.div>
      {children}
    </div>
  );
}

/* ========================================================================== */

export default function App() {
  const [path, setPath] = useState<string>(() => read());
  const [open, setOpen] = useState(false);
  const [tel, setTel] = useState({ fps: 60, steps: 44, scale: 0.54 });

  useEffect(() => {
    const on = () => setPath(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  /* A client-side route change is silent: nothing reloads, so nothing is
     announced and focus stays wherever it was. Moving focus to the new
     heading is what makes the navigation exist for anyone not looking at the
     screen. Keyed on the route and skipped on first paint, so a fresh load
     does not yank focus off the top of the document. */
  /**
   * Move focus to the new page's heading on a client-side route change.
   *
   * The outgoing page holds the tree for the length of its exit under
   * `AnimatePresence mode="wait"`, so for a moment there are two pages mounted
   * and the incoming heading does not exist yet. A fixed delay long enough to
   * cover that is a race that loses whenever the exit runs a few frames long,
   * and losing it silently drops a keyboard user back at the top of the
   * document. So: poll for the heading belonging to the route being entered,
   * identified by `data-route` rather than by position, and give up rather
   * than steal focus from someone who has already moved on.
   *
   * On a timer rather than on animation frames: the sky behind this is a
   * volumetric raymarch, and on a weak GPU it can hold frames for tens of
   * milliseconds at a time. A frame-driven poll then gets only a handful of
   * attempts inside its window and loses the race precisely on the machines
   * least able to afford it. Timers are not throttled by the renderer.
   *
   * The window is deliberately long. On a machine with a real GPU the heading
   * is focused in a few hundred milliseconds; on a software rasteriser the
   * same swap has been measured taking several seconds. Nothing is stolen by
   * waiting \u2014 the guard above stops as soon as the visitor puts focus
   * anywhere in the page themselves \u2014 so the cost of a generous deadline is
   * nil and the cost of a tight one is a keyboard user left stranded.
   */
  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) { firstPaint.current = false; return; }
    const deadline = performance.now() + 5000;
    let timer = 0;
    const attempt = () => {
      const heading = document.querySelector<HTMLElement>(
        `main [data-route="${path}"] h1`,
      );
      // Take focus unless the visitor has already tabbed into the new page's
      // content. Focus sitting on a nav link, or on the palette trigger that
      // restored it, is exactly the case this is here to move.
      const here = document.activeElement as HTMLElement | null;
      if (heading && !here?.closest("main")) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        // Stop only once the browser agrees. Calling focus() during the swap
        // does not always take, and a write that silently did nothing looks
        // identical to one that worked from here.
        if (document.activeElement === heading) return;
      }
      if (performance.now() > deadline) return;
      timer = window.setTimeout(attempt, 32);
    };
    timer = window.setTimeout(attempt, 32);
    return () => window.clearTimeout(timer);
  }, [path]);

  const go = (next: string) => {
    window.location.hash = next;
    setPath(next);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const commands: Command[] = [
    ...ROUTES.map((r) => ({
      id: "route" + r.path,
      label: r.label,
      hint: "Page " + r.index,
      run: () => go(r.path),
    })),
    { id: "top", label: "Back to top", hint: "Scroll", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { id: "demo", label: "Try the live builder", hint: "Demo", run: () => {
        go("/");
        requestAnimationFrame(() => document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } },
  ];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-[13px] focus:text-cream"
      >
        Skip to content
      </a>

      <CloudCanvas onTelemetry={setTel} />
      <Birds count={6} />
      <Cursor />
      <CommandPalette commands={commands} />

      {/* Route changes are posted here so assistive technology hears them. */}
      <p aria-live="polite" className="sr-only">
        {ROUTES.find((r) => r.path === path)?.label} page
      </p>
      {/* A light haze that thickens toward the foot, so panels lower down have
          a calmer ground than the bright cloud tops up here. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, rgba(253,251,246,0) 0%, rgba(238,241,251,0.18) 46%, rgba(238,241,251,0.55) 100%)" }}
      />

      <header className="film-hide fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-4 flex h-14 w-[calc(100%-2rem)] max-w-[1500px] items-center justify-between gap-5 rounded-full border border-white/70 bg-cream/70 px-5 backdrop-blur-xl sm:px-6">
          <button onClick={() => go("/")} className="flex items-center gap-2.5" aria-label="Orion, home">
            <Feather className="size-4 text-iris" strokeWidth={1.6} />
            <span className="font-display text-[19px] leading-none tracking-tight text-ink">Orion</span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {ROUTES.map((r) => (
              <button key={r.path} onClick={() => go(r.path)} aria-current={r.path === path ? "page" : undefined} className="group relative py-1">
                <span className={`text-[14px] tracking-tight transition-colors duration-300 ${r.path === path ? "text-ink" : "text-ink-mute group-hover:text-ink"}`}>
                  {r.label}
                </span>
                <span className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-iris transition-transform duration-500 ${r.path === path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => go("/contact")} className="hidden rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-cream transition-transform duration-300 hover:-translate-y-0.5 sm:block">
              Start dreaming
            </button>
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-ink lg:hidden">
              <Menu className="size-5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-cream/95 backdrop-blur-2xl lg:hidden">
            <div className="flex h-20 items-center justify-end px-8">
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-ink"><X className="size-5" strokeWidth={1.6} /></button>
            </div>
            <nav className="px-8" aria-label="Mobile">
              {ROUTES.map((r, i) => (
                <motion.button key={r.path}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.04 + i * 0.05 }}
                  onClick={() => go(r.path)}
                  className="flex w-full items-baseline gap-5 border-b border-ink/10 py-6 text-left">
                  <Mono>{r.index}</Mono>
                  <span className="font-display text-4xl tracking-tight text-ink">{r.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" className="relative [overflow-x:clip]">
        <AnimatePresence mode="wait">
          {/* `data-route` is what the focus effect keys off. Under `mode="wait"`
              the outgoing page is still in the tree through its exit, so
              "the first h1 in main" is the page being left, not the one being
              entered. Stamping the path makes the two distinguishable. */}
          <motion.div key={path} data-route={path}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }} transition={{ duration: 0.55 }}>
            {path === "/" && <Dream go={go} tel={tel} />}
            {path === "/capabilities" && <Craft />}
            {path === "/work" && <Work />}
            {path === "/studio" && <Studio />}
            {path === "/contact" && <Begin />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative mx-auto w-full max-w-[1500px] px-6 pb-12 sm:px-10 lg:px-14">
        <div className="card rounded-[30px] p-8 sm:p-12">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <p className="font-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.98] tracking-[-0.02em] text-ink">
              Let&rsquo;s build the one<br />you keep imagining.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {ROUTES.map((r) => (
                <button key={r.path} onClick={() => go(r.path)} className="text-[14px] text-ink-mute transition-colors duration-300 hover:text-ink">
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-ink/10 pt-6 sm:flex-row sm:justify-between">
            <Mono>Orion Dream Studio &mdash; London</Mono>
            <Mono>A demonstration build</Mono>
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

/* ============================== DREAM ==================================== */

function Dream({ go, tel }: { go: (p: string) => void; tel: { fps: number; steps: number; scale: number } }) {
  return (
    <>
      {/* The opening is a film, not a hero: one camera move through one space,
          scrubbed by scroll. See Journey. */}
      <Journey go={go} tel={tel} />

      {/* The claim, demonstrated. A studio that says "prompt to site" and
          never shows one is asking to be taken on faith. */}
      <section id="builder" className="mx-auto w-full max-w-[1500px] px-6 pb-24 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }} transition={SPRING}
          className="copy-veil mb-10 max-w-2xl"
        >
          <Mono live>The engine</Mono>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.6rem)] leading-[0.98] tracking-[-0.02em] text-ink">
            Watch one get built.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
            Give it a brief and it composes a layout, resolves a palette and ships.
            The same words always produce the same site &mdash; change one and the
            whole structure changes with it.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }} transition={{ ...SPRING, delay: 0.08 }}
        >
          <PromptToSite />
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-6 pb-28 sm:px-10 lg:px-14">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { icon: Layers, t: "Elite Engineering", b: "Next.js and WebGL performance systems, authored rather than assembled. The clouds above you are a raymarch, not a video.", m: "01 — Systems" },
            { icon: Waves, t: "Cinematic Motion", b: "Interfaces that feel alive, fluid and weighted. Every transition is a spring with mass behind it, never a linear fade.", m: "02 — Motion" },
            { icon: LineChart, t: "Conversion Infrastructure", b: "Turning high traffic into high revenue. Instrumented funnels, measured against the number that pays for the build.", m: "03 — Revenue" },
          ].map((c, i) => (
            <motion.div key={c.t}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }} transition={{ ...SPRING, delay: i * 0.09 }}>
              <Card className="flex h-full min-h-[19rem] flex-col p-8">
                <div className="flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-iris/10 text-iris">
                    <c.icon className="size-[18px]" strokeWidth={1.6} />
                  </span>
                  <ArrowUpRight className="size-4 text-ink-mute transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" strokeWidth={1.6} />
                </div>
                <h3 className="mt-auto pt-10 font-display text-[27px] leading-tight tracking-tight text-ink">{c.t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{c.b}</p>
                <Mono className="mt-6">{c.m}</Mono>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ============================ INNER PAGES ================================ */

const CRAFT = [
  { icon: Layers, n: "01", name: "Real-time WebGL", body: "Bespoke scenes authored in GLSL. The sky on this site is a volumetric raymarch with a second light march per sample, which is the only reason the clouds have a silver lining.", pts: ["Authored vertex and fragment shaders", "Procedural geometry over downloaded meshes", "Pointer and scroll on one shared state", "Reduced-motion and no-WebGL paths built alongside"] },
  { icon: Gauge, n: "02", name: "Performance engineering", body: "A budget agreed before the first commit and measured before launch. Immersive and fast only coexist deliberately.", pts: ["LCP, INP and CLS budgets per route", "Render buffers below device resolution, upscaled", "Sample counts that adapt to measured frame time", "Measured before and after at handover"] },
  { icon: Boxes, n: "03", name: "Application architecture", body: "App Router, server components by default, and one canvas that survives navigation so moving between pages moves a camera rather than rebuilding a world.", pts: ["Server components unless interaction demands otherwise", "One WebGL context across every route", "Route-aware choreography", "Typed end to end, clean build as the gate"] },
  { icon: Cpu, n: "04", name: "Conversion infrastructure", body: "The instrumentation that tells you whether any of the above paid for itself.", pts: ["Event schema modelled on your funnel", "Server-side tracking where the browser cannot be trusted", "Experiment harness for offer and copy", "Monthly report against the commercial target"] },
];

function Craft() {
  return (
    <Shell index="02" label="Craft" title={<>Four disciplines,<br /><span className="italic text-iris">one standard.</span></>}
      lede="Delivered by the same four people who sell them. Nothing here is subcontracted.">
      <div className="mt-14 grid gap-5">
        {CRAFT.map((d, i) => (
          <motion.div key={d.name} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }} transition={{ ...SPRING, delay: i * 0.06 }}>
            <Card className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[auto_1.05fr_1fr] lg:gap-14">
              <Mono className="lg:pt-3">{d.n}</Mono>
              <div>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-iris/10 text-iris">
                  <d.icon className="size-[18px]" strokeWidth={1.6} />
                </span>
                <h2 className="mt-6 font-display text-[30px] leading-tight tracking-tight text-ink sm:text-[34px]">{d.name}</h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">{d.body}</p>
              </div>
              <ul className="flex flex-col justify-center gap-3">
                {d.pts.map((p) => (
                  <li key={p} className="flex items-baseline gap-3 border-b border-ink/[0.08] pb-3 text-[14px] text-ink-soft last:border-0">
                    <span className="size-1.5 shrink-0 translate-y-[-1px] rounded-full bg-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </Shell>
  );
}

const WORK = [
  { c: "Meridian Atelier", s: "Retail", y: "2025", l: "A made-to-measure tailor whose product cannot be photographed flat. The configurator renders cloth in real time.", m: [["Enquiries", "+63%"], ["LCP", "1.1s"], ["Session", "3m42"]] },
  { c: "North Quay", s: "Property", y: "2025", l: "Off-plan apartments sold before the frame went up. The scroll flies through the building at real scale.", m: [["Reservations", "41"], ["LCP", "1.3s"], ["Bounce", "-28%"]] },
  { c: "Cassia House", s: "Hospitality", y: "2024", l: "Twelve rooms against the aggregators. The room tour and the booking flow are the same interface.", m: [["Direct", "2.1x"], ["LCP", "0.9s"], ["Saved", "31k"]] },
  { c: "Halden Precision", s: "Industrial", y: "2024", l: "Five-axis machining explained to procurement officers who are not engineers.", m: [["Quotes", "+88%"], ["LCP", "1.2s"], ["Specs", "2.4x"]] },
];

function Work() {
  return (
    <Shell index="03" label="Work" title={<>Four builds, and<br /><span className="italic text-iris">what each one moved.</span></>}
      lede="Every engagement shipped against a performance budget and a commercial target. Both are quoted.">
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {WORK.map((w, i) => (
          <motion.div key={w.c} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }} transition={{ ...SPRING, delay: i * 0.07 }}>
            <Card className="flex h-full flex-col p-8 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <h2 className="font-display text-[30px] leading-tight tracking-tight text-ink">{w.c}</h2>
                <ArrowUpRight className="size-4 shrink-0 text-ink-mute transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" strokeWidth={1.6} />
              </div>
              <Mono className="mt-3">{w.s} &mdash; {w.y}</Mono>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">{w.l}</p>
              <div className="mt-auto grid grid-cols-3 gap-4 pt-10">
                {w.m.map(([k, v]) => (
                  <div key={k}>
                    <p className="font-display text-[26px] leading-none tracking-tight text-ink">{v}</p>
                    <Mono className="mt-2 !tracking-[0.16em]">{k}</Mono>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 max-w-2xl rounded-2xl border border-dashed border-ink/15 bg-cream/50 p-6 text-[14px] leading-relaxed text-ink-soft backdrop-blur-md">
        <span className="font-medium text-ink">A note on these numbers.</span> The studio and its clients
        are a demonstration set built for this preview. The figures are illustrative sample data, not
        audited results &mdash; which is exactly what any agency quoting metrics should tell you.
      </p>
    </Shell>
  );
}

function Studio() {
  const P = [
    { icon: Gauge, t: "Fast is a feature", b: "A budget is agreed before the first commit and measured before launch. If a scene cannot meet it, the scene changes, not the budget." },
    { icon: Radar, t: "Scope is fixed so quality is not", b: "Open-ended projects negotiate quality away under deadline. Fixed scope leaves one variable: how well it is built." },
    { icon: Feather, t: "Accessible by construction", b: "Reduced motion, keyboard operation and contrast are designed with the effect, not retrofitted after a report comes back." },
    { icon: Boxes, t: "You own everything", b: "Source, scenes, pipeline. No editor lock-in, no per-view licensing. If you leave, you leave with all of it." },
  ];
  return (
    <Shell index="04" label="Studio" title={<>Four people,<br /><span className="italic text-iris">one very short list.</span></>}
      lede="Orion is small on purpose. Everyone who sells the work also builds it, which is the only reliable way to keep a promise about a deadline.">
      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {P.map((p, i) => (
          <motion.div key={p.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }} transition={{ ...SPRING, delay: i * 0.07 }}>
            <Card className="flex h-full flex-col p-8 sm:p-10">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-iris/10 text-iris">
                <p.icon className="size-[18px]" strokeWidth={1.6} />
              </span>
              <h3 className="mt-8 font-display text-[26px] leading-tight tracking-tight text-ink">{p.t}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{p.b}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Shell>
  );
}

function Begin() {
  const [sent, setSent] = useState(false);
  return (
    <Shell index="05" label="Begin" title={<>Tell us the one<br /><span className="italic text-iris">you keep imagining.</span></>}
      lede="No discovery call to book a discovery call. Send the dream and we reply the same working day.">
      <div className="mt-14 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Card className="p-8 sm:p-10">
          <form className="flex flex-col gap-7" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            {[["Your name", "text", "Alex Mercer"], ["Email", "email", "alex@company.com"]].map(([l, t, ph]) => (
              <label key={l} className="flex flex-col gap-3">
                <Mono>{l}</Mono>
                <input type={t} required placeholder={ph}
                  className="w-full border-0 border-b border-ink/15 bg-transparent px-0 py-3 text-[16px] text-ink placeholder:text-ink-mute/60 focus:border-iris focus:outline-none" />
              </label>
            ))}
            <label className="flex flex-col gap-3">
              <Mono>Describe the website of your dreams</Mono>
              <textarea required rows={4} placeholder="A real-time configurator for a made-to-measure tailor."
                className="w-full resize-y border-0 border-b border-ink/15 bg-transparent px-0 py-3 text-[16px] text-ink placeholder:text-ink-mute/60 focus:border-iris focus:outline-none" />
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-5">
              <Btn primary icon={<ArrowRight className="size-4" strokeWidth={2} />}>Send the dream</Btn>
              {sent && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}>
                  <Mono live>Captured &mdash; preview does not transmit</Mono>
                </motion.span>
              )}
            </div>
          </form>
        </Card>

        <Card className="flex flex-col gap-8 p-8 sm:p-10">
          <Mono live>Direct lines</Mono>
          <ul className="flex flex-col gap-5">
            {[["Email", "studio@orion.dev"], ["Phone", "+44 20 7946 0148"], ["Studio", "London, United Kingdom"], ["Reply", "Same working day"]].map(([k, v]) => (
              <li key={k} className="flex flex-col gap-1.5 border-b border-ink/[0.08] pb-4 last:border-0">
                <Mono>{k}</Mono>
                <span className="text-[16px] text-ink">{v}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto rounded-2xl bg-iris/[0.07] p-6">
            <Mono>Availability</Mono>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Two build slots remain this quarter. Briefs are answered in order of arrival, not deal size.
            </p>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
