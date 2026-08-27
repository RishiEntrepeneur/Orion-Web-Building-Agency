"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SPRING } from "./motion";

const PROMPTS = [
  "A made-to-measure tailor in Mayfair",
  "Off-plan apartments by the water",
  "A twelve-room hotel that hates aggregators",
  "Five-axis machining for aerospace",
];

const STAGES = [
  { key: "parse", label: "Parsing brief", ms: 900 },
  { key: "layout", label: "Composing layout", ms: 1100 },
  { key: "palette", label: "Resolving palette", ms: 900 },
  { key: "type", label: "Writing copy", ms: 1000 },
  { key: "ship", label: "Deploying to edge", ms: 800 },
] as const;

type StageKey = (typeof STAGES)[number]["key"] | "idle" | "done";

/* -------------------------------------------------------------------------
   Deterministic generation.

   The same brief must always produce the same site. That is the whole claim
   being demonstrated -- if the layout reshuffled on every run it would read as
   a random block generator with a text field bolted on. So everything derives
   from one 32-bit hash of the prompt: block structure, column splits, hue,
   even which words get emphasised.
   ------------------------------------------------------------------------- */

function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A small deterministic PRNG seeded from the hash. */
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

type Block = { span: number; kind: "media" | "text" | "cta" | "stat"; h: number };

/**
 * The palettes the engine is allowed to resolve to.
 *
 * A random hue with a complementary accent is what a generator does; it lands
 * on hot pink beside teal roughly as often as it lands on anything else. These
 * are chosen pairs, and each carries the saturation and lightness its own hue
 * actually needs \u2014 ochre at the lightness that suits cobalt is mud, cobalt
 * at the lightness that suits ochre is a pastel. `onField` is the ink that
 * clears the field colour it sits on, which is why the two sand-toned entries
 * take dark copy and the rest take light.
 */
type Palette = { name: string; field: string; tint: string; accent: string };

/**
 * WCAG relative luminance of an `hsl(H S% L%)` string.
 *
 * The generated blocks are filled with palette colours and then have copy laid
 * over them, and which ink clears which fill is not something to guess per
 * palette by hand \u2014 plum\u2019s chartreuse accent needs dark copy while its own
 * field needs light. Measuring it means every palette added later is correct
 * without anyone remembering to think about it.
 */
function luminance(hsl: string): number {
  const m = /hsl\((\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\)/.exec(hsl);
  if (!m) return 0;
  const h = Number(m[1]) / 360;
  const sat = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
  const pp = 2 * l - q;
  const chan = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return pp + (q - pp) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6;
    return pp;
  };
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const r = sat === 0 ? l : chan(h + 1 / 3);
  const g = sat === 0 ? l : chan(h);
  const b = sat === 0 ? l : chan(h - 1 / 3);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** The ink that clears a given fill \u2014 whichever of the two contrasts more. */
function inkOn(fill: string): string {
  return luminance(fill) > 0.32 ? "rgba(24,20,14,0.58)" : "rgba(255,255,255,0.74)";
}

const PALETTES: Palette[] = [
  { name: "Oxblood", field: "hsl(354 40% 33%)", tint: "hsl(354 26% 94%)", accent: "hsl(18 66% 50%)" },
  { name: "Ink", field: "hsl(224 44% 24%)", tint: "hsl(224 30% 94%)", accent: "hsl(196 70% 44%)" },
  { name: "Forest", field: "hsl(158 32% 25%)", tint: "hsl(158 22% 93%)", accent: "hsl(38 72% 52%)" },
  { name: "Ochre", field: "hsl(36 50% 54%)", tint: "hsl(36 44% 94%)", accent: "hsl(348 46% 40%)" },
  { name: "Plum", field: "hsl(286 26% 31%)", tint: "hsl(286 20% 94%)", accent: "hsl(66 54% 50%)" },
  { name: "Slate", field: "hsl(206 20% 37%)", tint: "hsl(206 18% 94%)", accent: "hsl(14 64% 52%)" },
  { name: "Sand", field: "hsl(28 28% 63%)", tint: "hsl(28 32% 95%)", accent: "hsl(200 42% 30%)" },
  { name: "Cobalt", field: "hsl(224 58% 44%)", tint: "hsl(224 42% 95%)", accent: "hsl(28 80% 54%)" },
];

type Recipe = {
  palette: Palette;
  blocks: Block[];
  pages: number;
  tags: string[];
};

function compose(prompt: string): Recipe {
  const r = rng(hash32(prompt.trim().toLowerCase()));
  const palette = PALETTES[Math.floor(r() * PALETTES.length)];

  const rows = 3 + Math.floor(r() * 2);
  const blocks: Block[] = [{ span: 12, kind: "media", h: 46 }];
  for (let i = 0; i < rows; i++) {
    const roll = r();
    if (roll < 0.32) {
      blocks.push({ span: 7, kind: "text", h: 26 }, { span: 5, kind: "media", h: 26 });
    } else if (roll < 0.6) {
      blocks.push({ span: 4, kind: "stat", h: 20 }, { span: 4, kind: "stat", h: 20 }, { span: 4, kind: "stat", h: 20 });
    } else if (roll < 0.84) {
      blocks.push({ span: 5, kind: "media", h: 28 }, { span: 7, kind: "text", h: 28 });
    } else {
      blocks.push({ span: 12, kind: "text", h: 22 });
    }
  }
  blocks.push({ span: 12, kind: "cta", h: 22 });

  const pool = ["responsive", "webgl", "cms", "commerce", "booking", "analytics", "i18n", "a11y"];
  const tags: string[] = [];
  while (tags.length < 3) {
    const t = pool[Math.floor(r() * pool.length)];
    if (!tags.includes(t)) tags.push(t);
  }

  return { palette, blocks, pages: 3 + Math.floor(r() * 4), tags };
}

/* ------------------------------------------------------------------------- */

export default function PromptToSite() {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [stage, setStage] = useState<StageKey>("idle");
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<number[]>([]);
  const recipe = useMemo(() => compose(prompt), [prompt]);

  const stageIndex = STAGES.findIndex((s) => s.key === stage);
  const reached = (key: (typeof STAGES)[number]["key"]) => {
    if (stage === "done") return true;
    const i = STAGES.findIndex((s) => s.key === key);
    return stageIndex >= i && stageIndex !== -1;
  };

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  const build = useCallback(() => {
    clear();
    setElapsed(0);
    setStage(STAGES[0].key);

    let at = 0;
    STAGES.forEach((s, i) => {
      at += s.ms;
      const next = STAGES[i + 1];
      timers.current.push(
        window.setTimeout(() => setStage(next ? next.key : "done"), at),
      );
    });

    // The counter runs against the real elapsed time, scaled so the whole
    // build reads as the 48-hour window compressed. It is a demonstration,
    // and it says so.
    const total = STAGES.reduce((sum, s) => sum + s.ms, 0);
    const started = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - started) / total);
      setElapsed(p * 48);
      if (p < 1) timers.current.push(window.setTimeout(tick, 60) as unknown as number);
    };
    tick();
  }, [clear]);

  const running = stage !== "idle" && stage !== "done";
  const shipped = stage === "done";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      {/* ---------------- Controls ---------------- */}
      <div className="card flex flex-col rounded-[26px] p-7 sm:p-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-mute">
          The brief
        </span>

        <div className="mt-5 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <motion.button
              key={p}
              onClick={() => { setPrompt(p); setStage("idle"); clear(); }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING}
              className={`rounded-full border px-3.5 py-2 text-left text-[13px] leading-tight transition-colors duration-300 ${
                p === prompt
                  ? "border-iris/40 bg-iris/10 text-ink"
                  : "border-ink/12 text-ink-soft hover:border-ink/25 hover:text-ink"
              }`}
            >
              {p}
            </motion.button>
          ))}
        </div>

        <label className="mt-6 flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-mute">
            Or write your own
          </span>
          <input
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setStage("idle"); clear(); }}
            className="w-full border-0 border-b border-ink/15 bg-transparent px-0 py-2.5 text-[15px] text-ink placeholder:text-ink-mute/60 focus:border-iris focus:outline-none"
            placeholder="Describe the site"
          />
        </label>

        <div className="mt-7 flex items-center gap-3">
          <motion.button
            onClick={running ? undefined : build}
            whileHover={running ? undefined : { y: -3 }}
            whileTap={running ? undefined : { scale: 0.98 }}
            transition={SPRING}
            aria-busy={running}
            className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-cream disabled:opacity-70"
            disabled={running}
          >
            {running ? <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              : shipped ? <RotateCcw className="size-4" strokeWidth={2} />
              : <Play className="size-4" strokeWidth={2} />}
            {running ? "Building" : shipped ? "Build again" : "Build it"}
          </motion.button>

          <span className="font-mono text-[11px] tabular-nums text-ink-mute">
            {elapsed > 0 ? `${elapsed.toFixed(1)}h / 48h` : "48h window"}
          </span>
        </div>

        {/* Stage ledger */}
        <ol className="mt-7 flex flex-col gap-2.5 border-t border-ink/10 pt-6">
          {STAGES.map((s) => {
            const done = stage === "done" || (stageIndex > STAGES.findIndex((x) => x.key === s.key) && stageIndex !== -1);
            const active = stage === s.key;
            return (
              <li key={s.key} className="flex items-center gap-3">
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                    done ? "border-iris bg-iris text-cream"
                      : active ? "border-iris text-iris"
                      : "border-ink/20 text-transparent"
                  }`}
                >
                  {done ? <Check className="size-2.5" strokeWidth={3} />
                    : active ? <motion.span className="size-1.5 rounded-full bg-iris"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.1, repeat: Infinity }} />
                    : null}
                </span>
                <span className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                  done || active ? "text-ink" : "text-ink-mute"
                }`}>
                  {s.label}
                </span>

                {/* A stage that says "resolving palette" and never says what it
                    resolved to is a progress bar wearing a label. */}
                {s.key === "palette" && reached("palette") && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={SPRING}
                    className="ml-auto flex items-center gap-2"
                  >
                    <span className="flex overflow-hidden rounded-full border border-ink/10">
                      {[recipe.palette.field, recipe.palette.accent, recipe.palette.tint].map((c) => (
                        <span key={c} className="size-3" style={{ backgroundColor: c }} />
                      ))}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                      {recipe.palette.name}
                    </span>
                  </motion.span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* ---------------- Output ---------------- */}
      <div className="card overflow-hidden rounded-[26px]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3">
          <span className="size-2 rounded-full bg-ink/15" />
          <span className="size-2 rounded-full bg-ink/15" />
          <span className="size-2 rounded-full bg-ink/15" />
          <div className="ml-2 flex flex-1 items-center gap-2 rounded-full bg-ink/[0.05] px-3 py-1">
            <span className="font-mono text-[10px] text-ink-mute">
              {shipped ? "https://" : ""}
              {shipped
                ? prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 26) + ".orion.site"
                : "about:blank"}
            </span>
            {shipped && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
                className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-700"
              >
                Live
              </motion.span>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative min-h-[22rem] bg-white/55 p-4">
          <AnimatePresence mode="wait">
            {stage === "idle" ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-mute">
                  Awaiting brief
                </span>
                <p className="max-w-[16rem] text-[13px] leading-relaxed text-ink-mute">
                  Pick a brief or write one, then build. The same words always
                  produce the same site.
                </p>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-12 gap-2">
                {recipe.blocks.map((b, i) => {
                  const shown = reached("layout");
                  const coloured = reached("palette");
                  const typed = reached("type");

                  const p = recipe.palette;
                  const bg = coloured
                    ? b.kind === "media"
                      ? p.field
                      : b.kind === "cta"
                      ? p.accent
                      : p.tint
                    : "hsl(220 12% 90%)";
                  // Copy lines on a filled block need ink that clears that
                  // block, not one ink for the whole grid.
                  const lineInk = coloured ? inkOn(bg) : "rgba(18,20,32,0.25)";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 18, scale: 0.96 }}
                      animate={shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
                      transition={{ ...SPRING, delay: shown ? i * 0.055 : 0 }}
                      style={{ gridColumn: `span ${b.span}`, height: `${b.h * 4}px`, backgroundColor: bg }}
                      className="relative overflow-hidden rounded-lg"
                    >
                      {/* Copy lines resolve last, the way a real build fills a
                          layout only once the structure is settled. */}
                      {typed && (b.kind === "text" || b.kind === "cta" || b.kind === "stat") && (
                        <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-3">
                          {(b.kind === "stat" ? [0.5] : [0.85, 0.65, 0.4]).map((w, k) => (
                            <motion.span
                              key={k}
                              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                              transition={{ ...SPRING, delay: 0.1 + i * 0.03 + k * 0.06 }}
                              style={{ width: `${w * 100}%`, backgroundColor: lineInk }}
                              className="h-1.5 origin-left rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parse readout */}
          <AnimatePresence>
            {reached("parse") && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={SPRING}
                className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-1.5"
              >
                {[`${recipe.pages} pages`, ...recipe.tags].map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING, delay: i * 0.07 }}
                    className="rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-cream backdrop-blur"
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
