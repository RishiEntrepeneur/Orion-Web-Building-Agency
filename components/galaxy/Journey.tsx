"use client";

import { useEffect, useRef, useState } from "react";
import { scrollState, setJourneyElement } from "./scroll-state";

/**
 * The journey.
 *
 * The home page is not a stack of sections; it is one continuous camera move
 * through a single space, chaptered, scrubbed entirely by scroll. You start
 * high above a cloud deck, fall through it, arrive at a machine sitting in the
 * open air, fly into its screen, watch a site assemble around you from the
 * inside, come back out through the finished work and rise clear of the cloud
 * layer at the end.
 *
 * Everything on the stage reads one number: `scrollState.journey`. That
 * matters more than it sounds. Each chapter deriving its own progress from
 * window.scrollY is how a sequence like this ends up a frame apart from itself
 * -- the sky a step behind the type, the laptop a step behind the sky -- and
 * the whole illusion of a single space collapses. One value, read once per
 * frame, applied to everything in the same pass.
 *
 * There is no React state in the animation path either. The stage is driven by
 * writing transforms straight onto refs inside one rAF loop; the only state is
 * the active chapter index, and that is set only when it actually changes.
 * Re-rendering a tree this size at scroll frequency would cost more than every
 * transform on it put together.
 */

/* -------------------------------------------------------------------------- */
/* Scrubbing helpers                                                          */
/* -------------------------------------------------------------------------- */

/** Maps `p` through the window [a,b] onto 0..1, clamped at both ends. */
const seg = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Smoothstep. Ends the move without a corner on it. */
const ease = (t: number) => t * t * (3 - 2 * t);

/** Rises to 1 across [a,b] and falls back to 0 across [c,d]. */
const band = (p: number, a: number, b: number, c: number, d: number) =>
  Math.min(ease(seg(p, a, b)), 1 - ease(seg(p, c, d)));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* -------------------------------------------------------------------------- */
/* Chapters                                                                   */
/* -------------------------------------------------------------------------- */

type Chapter = { at: number; label: string; note: string };

const CHAPTERS: Chapter[] = [
  { at: 0.0, label: "Above", note: "Six thousand metres" },
  { at: 0.14, label: "Descent", note: "Through the deck" },
  { at: 0.29, label: "The machine", note: "One brief, typed" },
  { at: 0.45, label: "Inside", note: "Past the glass" },
  { at: 0.61, label: "Assembly", note: "Structure, then colour" },
  { at: 0.77, label: "The work", note: "Four that shipped" },
  { at: 0.91, label: "Begin", note: "Back above the cloud" },
];

/** Total scroll length of the film, in viewport heights. */
const LENGTH_VH = 760;

/* -------------------------------------------------------------------------- */

export default function Journey({
  go,
  tel,
}: {
  go: (path: string) => void;
  tel: { fps: number; steps: number; scale: number };
}) {
  const wrap = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const [reduced, setReduced] = useState(false);

  /* Every animated node, collected once. Querying the DOM inside the frame
     loop would be the single most expensive thing in it. */
  const R = {
    title: useRef<HTMLDivElement>(null),
    titleWords: useRef<(HTMLSpanElement | null)[]>([]),
    fly: useRef<(HTMLDivElement | null)[]>([]),
    laptop: useRef<HTMLDivElement>(null),
    lid: useRef<HTMLDivElement>(null),
    typed: useRef<HTMLSpanElement>(null),
    caret: useRef<HTMLSpanElement>(null),
    inside: useRef<HTMLDivElement>(null),
    blocks: useRef<(HTMLDivElement | null)[]>([]),
    stageLabel: useRef<HTMLSpanElement>(null),
    work: useRef<(HTMLDivElement | null)[]>([]),
    finale: useRef<HTMLDivElement>(null),
    rail: useRef<HTMLDivElement>(null),
    vignette: useRef<HTMLDivElement>(null),
    telemetry: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const release = setJourneyElement(el);
    let raf = 0;
    let lastChapter = -1;
    let insideFlag = false;
    const t0 = performance.now();
    /** Seconds since the film mounted, for entrances that owe nothing to scroll. */
    const mounted = () => (performance.now() - t0) / 1000;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const p = scrollState.journey;
      const v = Math.min(1, Math.abs(scrollState.velocity) * 0.55);

      /* The sky is part of the same camera. Writing the descent here rather
         than letting the shader derive its own from scrollY is what keeps the
         cloud layer and the type on the same frame. */
      scrollState.descent = ease(seg(p, 0.02, 0.34));

      const set = (
        node: HTMLElement | null | undefined,
        transform: string,
        opacity: number,
        extra?: Partial<CSSStyleDeclaration>,
      ) => {
        if (!node) return;
        node.style.transform = transform;
        node.style.opacity = String(opacity);
        // Paint cost: a fully transparent layer still composites. Take it out.
        node.style.visibility = opacity < 0.004 ? "hidden" : "visible";
        if (extra) Object.assign(node.style, extra);
      };

      /* ---- 1. Above ------------------------------------------------------ */
      const aTitle = band(p, 0, 0.03, 0.1, 0.19);
      if (R.title.current) {
        const rise = ease(seg(p, 0, 0.16));
        set(
          R.title.current,
          `translate3d(0, ${lerp(0, -14, rise)}vh, ${lerp(0, 420, rise)}px)`,
          aTitle,
        );
      }
      /* The words assemble on a clock, not on scroll, and only their dispersion
         answers to the wheel. Tying the entrance to scroll meant landing on a
         headline that was 20% arrived and mostly invisible -- the first frame
         of the site was an empty sky. It is composed when you get here; what
         scroll does is take it apart again as you leave. */
      R.titleWords.current.forEach((w, i) => {
        if (!w) return;
        const settle = ease(Math.min(1, Math.max(0, (mounted() - 0.12 - i * 0.09) / 0.72)));
        const sign = i % 2 ? 1 : -1;
        const jitter = v * sign * (7 + i * 4);
        w.style.transform =
          `translate3d(${lerp(sign * 46, 0, settle) + jitter}px,` +
          ` ${lerp(30, 0, settle)}px, ${lerp(-380, 0, settle)}px)` +
          ` rotate(${lerp(sign * 6, 0, settle) + v * sign * 2.2}deg)`;
        w.style.opacity = String(settle);
      });

      /* ---- 2. Descent: type flying past the camera ----------------------- */
      // Each phrase runs its own leg of the same flight, so they arrive one
      // after another rather than as a single clump.
      R.fly.current.forEach((f, i) => {
        if (!f) return;
        const a = 0.12 + i * 0.05;
        const t = seg(p, a, a + 0.11);
        const z = lerp(-1800, 900, t);
        // Fade in from the far distance, then out as it passes the lens.
        const o = Math.min(ease(seg(t, 0, 0.24)), 1 - ease(seg(t, 0.74, 1)));
        set(
          f,
          `translate3d(${(i - 1) * 12}vw, ${(i - 1) * -6}vh, ${z}px)`,
          o,
        );
      });

      /* ---- 3. The machine ------------------------------------------------ */
      const arrive = ease(seg(p, 0.26, 0.38));
      const intoGlass = ease(seg(p, 0.44, 0.58));
      if (R.laptop.current) {
        // One transform carries both the arrival and the flight in: the scale
        // grows about the screen's centre, so the bezel leaves frame outward
        // while the glass stays put and swallows the viewport.
        const s = lerp(lerp(0.72, 1, arrive), 17, ease(intoGlass));
        const y = lerp(lerp(26, 0, arrive), -4, intoGlass);
        /* The handover has to overlap. Fading the laptop out only after the
           interior had begun left a stretch around p=0.5 where the screen had
           already swallowed the viewport but nothing had replaced it: ten
           percent of the film was a flat black frame. */
        const o = Math.min(arrive, 1 - ease(seg(p, 0.5, 0.57)));
        set(
          R.laptop.current,
          `translate3d(0, ${y}vh, 0) scale(${s})`,
          o,
        );
      }
      if (R.lid.current) {
        // The hinge. Closed at -92deg so the lid is face-down on the deck.
        R.lid.current.style.transform =
          `rotateX(${lerp(-92, 0, ease(seg(p, 0.29, 0.4)))}deg)`;
      }
      if (R.typed.current) {
        const q = "how to build a website";
        const n = Math.round(q.length * ease(seg(p, 0.36, 0.45)));
        R.typed.current.textContent = q.slice(0, n);
        if (R.caret.current)
          R.caret.current.style.opacity = n > 0 && n < q.length ? "1" : "0.25";
      }

      /* ---- 4/5. Inside the glass, the build ------------------------------ */
      /* The assembly clears before the work arrives. Holding it until 0.86 left
         the finished-site cards flying over a layout that was still on screen,
         which reads as a card floating on a mockup rather than as coming out
         the far side of the build. */
      const insideOn = band(p, 0.465, 0.55, 0.76, 0.83);
      if (R.inside.current) {
        set(
          R.inside.current,
          `translate3d(0,0,0) scale(${lerp(1.34, 1, ease(seg(p, 0.465, 0.6)))})`,
          insideOn,
        );
      }
      R.blocks.current.forEach((b, i) => {
        if (!b) return;
        const a = 0.54 + i * 0.017;
        const t = ease(seg(p, a, a + 0.065));
        const colour = ease(seg(p, 0.68 + i * 0.008, 0.74 + i * 0.008));
        b.style.transform =
          `translate3d(0, ${lerp(70, 0, t)}px, ${lerp(-500, 0, t)}px)`;
        b.style.opacity = String(t);
        // Structure first, colour second -- the order a build actually goes in.
        const fill = b.dataset.fill;
        b.style.backgroundColor = fill
          ? colour > 0.01
            ? fill
            : "rgba(150,166,220,0.20)"
          : colour > 0.01
          ? "rgba(226,232,255,0.13)"
          : "rgba(150,166,220,0.13)";
        b.style.borderColor =
          colour > 0.6 ? "transparent" : `rgba(168,184,236,${lerp(0.85, 0.14, colour)})`;
        // Emissive once the palette lands: on a dark interior a flat fill reads
        // as a hole, and a lit one reads as a screen.
        b.style.boxShadow =
          fill && colour > 0.02
            ? `0 0 ${lerp(0, 46, colour)}px ${lerp(0, 6, colour)}px ${fill}33`
            : "none";
      });
      if (R.stageLabel.current) {
        const names = ["PARSING BRIEF", "COMPOSING LAYOUT", "RESOLVING PALETTE", "SETTING TYPE", "DEPLOYING"];
        const i = Math.min(names.length - 1, Math.floor(seg(p, 0.54, 0.82) * names.length));
        R.stageLabel.current.textContent = names[i];
      }

      /* ---- 6. The work, flying past -------------------------------------- */
      R.work.current.forEach((w, i) => {
        if (!w) return;
        /* Spaced far enough apart that only one card owns the frame at a time.
           At a 0.026 stride three were on screen together at similar screen
           positions, and the one passing the lens was large, transparent and
           laid straight across the two behind it. */
        const a = 0.765 + i * 0.036;
        const t = seg(p, a, a + 0.092);
        const o = Math.min(ease(seg(t, 0, 0.26)), 1 - ease(seg(t, 0.58, 0.92)));
        const lane = [-19, 17, -14, 21][i % 4];
        set(
          w,
          `translate3d(${lane}vw, ${(i % 2 ? -4 : 5)}vh, ${lerp(-1600, 620, t)}px)` +
            ` rotateY(${(i % 2 ? -1 : 1) * 13}deg)`,
          o,
        );
      });

      /* ---- 7. Rise ------------------------------------------------------- */
      if (R.finale.current) {
        const t = ease(seg(p, 0.9, 0.985));
        set(R.finale.current, `translate3d(0, ${lerp(16, 0, t)}vh, 0)`, t);
      }

      /* ---- Chrome -------------------------------------------------------- */
      if (R.rail.current)
        R.rail.current.style.setProperty("--rail", String(p));
      const interior = p > 0.46 && p < 0.9;
      if (interior !== insideFlag) {
        insideFlag = interior;
        document.documentElement.dataset.interior = interior ? "on" : "off";
      }
      if (R.telemetry.current)
        R.telemetry.current.style.opacity = String(1 - ease(seg(p, 0.3, 0.46)));
      if (R.vignette.current)
        /* The film's tonal arc, and the reason the middle of it reads as a
           different place rather than the same pale sky with boxes on it:
           bright sky, then genuine dark once the camera is through the glass,
           then back out into light. A 50%-opacity vignette was not a interior,
           it was a smudge. */
        R.vignette.current.style.opacity = String(band(p, 0.43, 0.53, 0.88, 0.95));

      let next = 0;
      for (let i = 0; i < CHAPTERS.length; i++) if (p >= CHAPTERS[i].at) next = i;
      if (next !== lastChapter) {
        lastChapter = next;
        setChapter(next);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      release();
      // Leaving the film must not leave the rest of the site hidden.
      delete document.documentElement.dataset.interior;
    };
  }, []);

  const TITLE = ["Build", "the", "website", "of", "your", "dreams."];
  const FLY = ["ONE PROMPT", "ONE SITE", "FORTY-EIGHT HOURS"];
  const BLOCKS = [
    { span: 12, h: 92, fill: "#2f47a8" },
    { span: 7, h: 60, fill: "" },
    { span: 5, h: 60, fill: "#2f47a8" },
    { span: 4, h: 44, fill: "" },
    { span: 4, h: 44, fill: "" },
    { span: 4, h: 44, fill: "#e0913f" },
    { span: 12, h: 52, fill: "" },
  ];
  const WORK = [
    { c: "Halcyon Row", s: "Property", m: "+38% enquiries" },
    { c: "Vessel & Vine", s: "Hospitality", m: "2.1s to interactive" },
    { c: "Meridian Craft", s: "Manufacturing", m: "+64% qualified leads" },
    { c: "Aster Clinic", s: "Healthcare", m: "AA on every route" },
  ];

  return (
    <section
      ref={wrap}
      aria-label="The build, from brief to launch"
      style={{ height: reduced ? "auto" : `${LENGTH_VH}vh` }}
      className="relative"
    >
      {/* The stage. One viewport, held still while the film runs past it. */}
      <div
        className={
          reduced
            ? "relative flex flex-col gap-24 px-6 py-24"
            : "sticky top-0 h-svh overflow-hidden [perspective:1200px] [transform-style:preserve-3d] lg:[--rail-gutter:9rem]"
        }
      >
        {/* Interior darkening for the stretch spent inside the machine. */}
        <div
          ref={R.vignette}
          aria-hidden
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-[35] bg-[radial-gradient(120%_95%_at_50%_44%,#1a2352_0%,#0d1330_42%,#070a1c_74%,#04060f_100%)]"
        />

        {/* ---- 1. Above --------------------------------------------------- */}
        <div
          ref={R.title}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center lg:px-[var(--rail-gutter,0px)]"
        >
          <div className="copy-veil flex flex-col items-center">
          <span className="mb-7 font-mono text-[11px] uppercase tracking-[0.34em] text-iris">
            Orion Dream Studio
          </span>
          <h1 className="max-w-[13ch] font-display text-[clamp(2.6rem,7.4vw,6.6rem)] font-normal leading-[0.94] tracking-[-0.03em] text-ink">
            {TITLE.map((w, i) => (
              <span
                key={w + i}
                ref={(n) => { R.titleWords.current[i] = n; }}
                className={`mr-[0.26em] inline-block will-change-transform ${
                  i >= 4 ? "italic text-iris" : ""
                }`}
              >
                {w}
              </span>
            ))}
          </h1>
          <p className="mt-9 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Describe it once. Watch it get built. The sky you are standing in is
            rendering live in your browser.
          </p>
          {/* ink-soft, not ink-mute: this sits at the outer falloff of the veil
              where the sky is still coming through, and measured 3.96:1 there
              against a 4.5 requirement. */}
          <span className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
            Scroll to fall
          </span>
          </div>
        </div>

        {/* ---- 2. Descent: phrases passing the lens ------------------------ */}
        {FLY.map((t, i) => (
          <div
            key={t}
            ref={(n) => { R.fly.current[i] = n; }}
            aria-hidden
            style={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center will-change-transform"
          >
            <span className="font-display text-[clamp(3rem,12vw,11rem)] leading-none tracking-[-0.04em] text-ink/85">
              {t}
            </span>
          </div>
        ))}

        {/* ---- 3. The machine --------------------------------------------- */}
        <div
          ref={R.laptop}
          aria-hidden
          style={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-center justify-center will-change-transform"
        >
          <div className="relative w-[min(64vw,760px)] [transform-style:preserve-3d]">
            {/* Lid, on its hinge. */}
            <div
              ref={R.lid}
              className="origin-bottom rounded-t-[14px] border border-black/60 bg-[#0d1020] p-[10px] shadow-[0_30px_80px_-20px_rgba(10,14,40,0.55)] [transform-style:preserve-3d]"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-[#05060f]">
                <div className="flex items-center gap-1.5 px-3 py-2">
                  <span className="size-[5px] rounded-full bg-[#ff5f57]" />
                  <span className="size-[5px] rounded-full bg-[#febc2e]" />
                  <span className="size-[5px] rounded-full bg-[#28c840]" />
                  <span className="ml-3 font-mono text-[7px] tracking-[0.2em] text-white/30">
                    orion.studio
                  </span>
                </div>
                <div className="px-6 pt-6">
                  <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-white/35">
                    Ask Orion
                  </span>
                  <p className="mt-3 font-mono text-[clamp(9px,1.5vw,15px)] text-white/90">
                    <span ref={R.typed} />
                    <span ref={R.caret} className="ml-0.5 inline-block w-[0.5em] bg-white/80 align-middle" style={{ height: "1em" }} />
                  </p>
                </div>
              </div>
            </div>
            {/* Deck. */}
            <div className="h-[10px] rounded-b-[14px] border-x border-b border-black/60 bg-[#111529]" />
            <div className="mx-auto h-[4px] w-[16%] rounded-b-[4px] bg-[#0b0e1c]" />
          </div>
        </div>

        {/* ---- 4/5. Inside: the site assembling around you ----------------- */}
        <div
          ref={R.inside}
          style={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center px-5 will-change-transform sm:px-10 lg:px-[var(--rail-gutter,0px)]"
        >
          <div className="w-full max-w-[940px]">
            <div className="mb-5 flex items-baseline justify-between gap-6">
              {/* Light type: this chapter plays on a near-black interior, and
                  the page's ink colours are pitched for cream. */}
              <span
                ref={R.stageLabel}
                className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#8ea2ff]"
              >
                PARSING BRIEF
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                a made-to-measure tailor in Mayfair
              </span>
            </div>
            <div className="grid grid-cols-12 gap-2.5 sm:gap-3">
              {BLOCKS.map((b, i) => (
                <div
                  key={i}
                  ref={(n) => { R.blocks.current[i] = n; }}
                  data-fill={b.fill || undefined}
                  style={{
                    gridColumn: `span ${b.span}`,
                    height: `clamp(${b.h * 0.5}px, ${b.h / 5.4}vh, ${b.h * 1.7}px)`,
                    opacity: 0,
                  }}
                  className="rounded-xl border border-dashed will-change-transform"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---- 6. The work ------------------------------------------------ */}
        {WORK.map((w, i) => (
          <div
            key={w.c}
            ref={(n) => { R.work.current[i] = n; }}
            style={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-6 will-change-transform"
          >
            <div className="card w-[min(86vw,520px)] rounded-[26px] p-9">
              <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-ink-mute">
                {w.s}
              </span>
              <p className="mt-4 font-display text-[clamp(1.8rem,4vw,2.9rem)] leading-[1.02] tracking-[-0.02em] text-ink">
                {w.c}
              </p>
              <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.18em] text-iris">
                {w.m}
              </p>
            </div>
          </div>
        ))}

        {/* ---- 7. Rise ---------------------------------------------------- */}
        <div
          ref={R.finale}
          style={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          <div className="copy-veil flex flex-col items-center">
          <h2 className="max-w-[14ch] font-display text-[clamp(2.4rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.03em] text-ink">
            Now build <span className="italic text-iris">yours.</span>
          </h2>
          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-ink-soft">
            One brief, one fixed price, live in forty-eight hours. We take two
            builds a month so that stays true.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => go("/contact")}
              className="rounded-full bg-ink px-7 py-3.5 text-[15px] text-cream transition-transform duration-300 hover:scale-[1.03]"
            >
              Start dreaming
            </button>
            <button
              onClick={() => go("/work")}
              className="rounded-full border border-ink/15 bg-cream/70 px-7 py-3.5 text-[15px] text-ink backdrop-blur-xl transition-transform duration-300 hover:scale-[1.03]"
            >
              See what we&rsquo;ve built
            </button>
          </div>
          </div>
        </div>

        {/* Live renderer readout. It belongs to the sky, so it leaves when the
            camera does -- gone by the time we are through the glass. */}
        <div
          ref={R.telemetry}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-6 z-[60] mx-auto flex w-fit items-center gap-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute"
        >
          <span>{tel.fps ? `${tel.fps.toFixed(0)} fps` : "static"}</span>
          <span className="h-3 w-px bg-ink/20" />
          <span>{tel.steps} samples / px</span>
          <span className="h-3 w-px bg-ink/20" />
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gold" />
            Sky rendering live
          </span>
        </div>

        {/* ---- Chapter rail ----------------------------------------------- */}
        <div
          ref={R.rail}
          aria-hidden
          className="pointer-events-none absolute right-6 top-1/2 z-[60] hidden -translate-y-1/2 flex-col gap-4 lg:flex"
        >
          {CHAPTERS.map((c, i) => (
            <div key={c.label} className="flex items-center justify-end gap-3">
              <div
                className={`text-right transition-all duration-500 ${
                  i === chapter ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="film-rail-label block font-mono text-[10px] uppercase tracking-[0.22em]">
                  {c.label}
                </span>
                <span className="film-rail-note block font-mono text-[9px] uppercase tracking-[0.18em]">
                  {c.note}
                </span>
              </div>
              <span
                data-state={i === chapter ? "now" : i < chapter ? "done" : "next"}
                className={`film-rail-dot block rounded-full transition-all duration-500 ${
                  i === chapter ? "size-2.5" : "size-1.5"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
