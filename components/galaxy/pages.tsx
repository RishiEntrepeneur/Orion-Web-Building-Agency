"use client";

import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Boxes, Cpu, Feather, Gauge, Layers, LineChart, Radar, Sparkles, Waves,
} from "lucide-react";
import { useState } from "react";

import Journey from "./Journey";
import PromptToSite from "./PromptToSite";
import { PageOpen, Rise } from "./page-parts";
import { SPRING } from "./motion";
import { Btn, Card, CONTACT, Mono } from "./ui-kit";


export function Dream() {
  return (
    <>
      {/* The opening is a film, not a hero: one camera move through one space,
          scrubbed by scroll. See Journey. */}
      <Journey />

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

/* ==========================================================================
   Pages

   Nothing on these pages is invented. There are no client names, no case
   studies and no performance figures attributed to work that was never done --
   a new studio quoting "+63% enquiries" against a company nobody can look up
   is asking to be taken on faith, and is the single fastest way to lose the
   kind of client worth having. What is here instead is the work itself, which
   happens to be running in the page you are reading.
   ========================================================================== */

const CRAFT = [
  {
    icon: Layers,
    n: "01",
    name: "Real-time WebGL",
    body: "Scenes authored in GLSL rather than assembled from a library. The sky on this site is a volumetric raymarch with a second light march per sample, which is the only reason the clouds have a lit edge instead of a flat one.",
    pts: [
      "Hand-written vertex and fragment shaders",
      "Front-to-back compositing with a per-pixel entry dither, which is what removes the concentric banding",
      "Procedural geometry rather than downloaded meshes",
      "A no-WebGL path built alongside, not bolted on after",
    ],
  },
  {
    icon: Gauge,
    n: "02",
    name: "Performance engineering",
    body: "Immersive and fast only coexist on purpose. The renderer here measures its own frame time and spends its sample budget accordingly, so a weak machine gets a softer sky rather than a slideshow.",
    pts: [
      "Sample counts adapted from measured frame time",
      "Render buffer below device resolution, upscaled \u2014 this work is fill-rate bound",
      "Animation driven by transforms written straight to nodes, never through a re-render",
      "One scroll listener for the document, coalesced to one layout read per frame",
    ],
  },
  {
    icon: Boxes,
    n: "03",
    name: "Application architecture",
    body: "One canvas that survives navigation, so moving between pages moves a camera rather than rebuilding a world. Typed end to end, with a clean build as the gate.",
    pts: [
      "Server components unless interaction demands otherwise",
      "A single WebGL context shared across every route",
      "One scroll value driving a whole sequence, so nothing can drift a frame apart from itself",
      "State that must not re-render React kept deliberately outside it",
    ],
  },
  {
    icon: Feather,
    n: "04",
    name: "Accessibility, by construction",
    body: "Designed with the effect rather than retrofitted when a report comes back. Every number below was measured on the built page, not assumed from the palette.",
    pts: [
      "Contrast sampled from screenshots at the worst frame, not calculated from tokens",
      "Focus moved to the new heading on every route change, verified 8/8 by keyboard and by pointer",
      "Reduced motion collapses the film rather than merely slowing it",
      "The command palette is fully operable without a mouse",
    ],
  },
];

export function Craft() {
  return (
    <>
      <PageOpen
        index="01"
        label="Craft"
        title={<>Four disciplines,<br /><span className="italic text-iris">one standard.</span></>}
        lede="I build the whole thing: the shader, the application around it, and the measurements that say whether it is actually fast and actually readable."
      />
      <div className="mx-auto w-full max-w-[1500px] px-6 pb-28 sm:px-10 lg:px-14">
        <div className="grid gap-5">
          {CRAFT.map((d, i) => (
            <Rise key={d.name} i={i}>
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
                  {d.pts.map((pt) => (
                    <li key={pt} className="flex items-baseline gap-3 border-b border-ink/[0.08] pb-3 text-[14px] leading-relaxed text-ink-soft last:border-0">
                      <span className="size-1.5 shrink-0 translate-y-[-1px] rounded-full bg-gold" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </Card>
            </Rise>
          ))}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The work.
 *
 * Every entry is something running on this site, which the reader can go and
 * operate rather than take on trust. That is the whole reason this page can be
 * honest about being new and still be worth reading.
 */
const BUILT = [
  {
    n: "01",
    name: "A sky that is not a video",
    where: "Behind every page, right now",
    body: "A volumetric cloud layer raymarched per pixel in a fragment shader. The camera flies inside the deck rather than looking at it from underneath, which is a different and much less forgiving problem.",
    hard: "Getting the light right. Each sample takes a second short march toward the sun to work out how much of the cloud is above it, which is what gives the tops a lit edge and the undersides their weight. It is also what makes it expensive, so the sample count is chosen from the frame time it is actually achieving.",
    facts: [["Technique", "Volumetric raymarch"], ["Lighting", "Secondary march per sample"], ["Budget", "Adaptive"]],
  },
  {
    n: "02",
    name: "A brief that becomes a layout",
    where: "On the home page, under the film",
    body: "Type a sentence and watch a site get composed from it: block structure, page count, feature set and palette. The same words always produce the same site, and one changed word changes the whole structure.",
    hard: "Making it deterministic and making it tasteful are opposite pressures. The words are hashed to a seed and one number stream decides everything, so it reproduces exactly. But a free random hue lands on hot pink beside teal about as often as anything else, so the palettes are eight chosen pairs and the ink on each generated block is picked by measuring that block's luminance.",
    facts: [["Seeding", "FNV-1a into xorshift"], ["Palettes", "8 designed pairs"], ["Ink", "Chosen by measurement"]],
  },
  {
    n: "03",
    name: "A page that is one camera move",
    where: "The home page, top to bottom",
    body: "Seven chapters \u2014 above the cloud, the descent, the machine, the flight through its screen, the assembly, the work, the rise \u2014 scrubbed entirely by scroll, with a tonal arc from daylight to a dark interior and back.",
    hard: "Keeping it one space. Everything on the stage reads a single progress number, applied in one pass per frame. Chapters each deriving their own progress from scrollY is exactly how a sequence like this ends up a frame apart from itself and stops reading as one place. Nothing in the animation path goes through React.",
    facts: [["Chapters", "7"], ["Driver", "One value, one pass"], ["Re-renders", "Chapter index only"]],
  },
  {
    n: "04",
    name: "An interface that works without a mouse",
    where: "Press Command-K, or Control-K",
    body: "A command palette with subsequence matching, arrow and Enter navigation, a trapped Tab, and focus that is returned where it came from. Route changes move focus to the new page's heading and announce themselves.",
    hard: "The failure was invisible and intermittent. Focus reached the new heading about one time in four, for three separate reasons: the selector matched the outgoing page, which is still mounted during its exit; the poll ran on animation frames, which a raymarcher starves on exactly the machines least able to afford it; and it gave up before a slow swap finished. It now confirms with the browser that the focus took, and measures 8/8.",
    facts: [["Matching", "Subsequence"], ["Focus", "8/8 measured"], ["Contrast", "9/9 sampled"]],
  },
];

export function Work() {
  return (
    <>
      <PageOpen
        index="02"
        label="Work"
        title={<>No logos.<br /><span className="italic text-iris">The work itself.</span></>}
        lede="This studio is new, so there is no back catalogue to show you. Rather than case studies you have no way to verify, here is what I have actually built \u2014 all of it running in the page you are reading."
      />
      <div className="mx-auto w-full max-w-[1500px] px-6 pb-28 sm:px-10 lg:px-14">
        <div className="grid gap-5">
          {BUILT.map((b, i) => (
            <Rise key={b.name} i={i}>
              <Card className="p-8 sm:p-10 lg:p-12">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <Mono>{b.n}</Mono>
                  <Mono live>{b.where}</Mono>
                </div>
                <h2 className="mt-7 max-w-xl font-display text-[clamp(1.8rem,3.4vw,2.7rem)] leading-[1.04] tracking-tight text-ink">
                  {b.name}
                </h2>
                <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">
                  <p className="text-[15px] leading-relaxed text-ink-soft">{b.body}</p>
                  <div>
                    <Mono>What was hard about it</Mono>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{b.hard}</p>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/[0.08] pt-7">
                  {b.facts.map(([k, v]) => (
                    <div key={k}>
                      <p className="font-display text-[clamp(1rem,1.7vw,1.35rem)] leading-tight tracking-tight text-ink">{v}</p>
                      <Mono className="mt-2 !tracking-[0.16em]">{k}</Mono>
                    </div>
                  ))}
                </div>
              </Card>
            </Rise>
          ))}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function Studio() {
  const P = [
    { icon: Gauge, t: "Fast is a feature, not a phase", b: "A performance budget is agreed before the first commit and measured before launch. If a scene cannot meet it, the scene changes, not the budget." },
    { icon: Radar, t: "Fixed scope so quality is not the variable", b: "Open-ended projects negotiate quality away under deadline. Fix the scope and the only remaining variable is how well it is built." },
    { icon: Feather, t: "Measured, not asserted", b: "Contrast is sampled from the built page at its worst frame. Keyboard paths are exercised and counted. Anything I claim here, I checked \u2014 and where a check failed, the fix is in the commit history." },
    { icon: Boxes, t: "You own all of it", b: "Source, shaders, pipeline. No editor lock-in and no per-view licensing. If you go elsewhere, you go with everything." },
  ];
  return (
    <>
      <PageOpen
        index="03"
        label="Studio"
        title={<>One engineer,<br /><span className="italic text-iris">and no middle layer.</span></>}
        lede="Orion is one person who writes the shaders, the application and the tests. There is nobody to brief, nothing subcontracted, and no account manager between you and the person making the decisions."
      />
      <div className="mx-auto w-full max-w-[1500px] px-6 pb-28 sm:px-10 lg:px-14">
        <Rise>
          <Card className="p-8 sm:p-10 lg:p-12">
            <Mono live>Where this studio actually is</Mono>
            <p className="mt-6 max-w-3xl font-display text-[clamp(1.5rem,2.9vw,2.3rem)] leading-[1.12] tracking-tight text-ink">
              New, and saying so. The alternative was inventing four colleagues
              and a client list, which would have been the least trustworthy
              thing on the site.
            </p>
            <div className="mt-9 grid gap-8 text-[15px] leading-relaxed text-ink-soft sm:grid-cols-2 lg:gap-14">
              <p>
                What being new costs you: no decade of case studies, no roster of
                names you already recognise. If that is the deciding factor, I am
                genuinely the wrong choice and would rather you knew now.
              </p>
              <p>
                What it buys you: the person who answers your email is the person
                writing the code, at a price that reflects a studio building its
                reputation rather than trading on one. The work on this site is
                the argument.
              </p>
            </div>
          </Card>
        </Rise>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {P.map((pr, i) => (
            <Rise key={pr.t} i={i + 1}>
              <Card className="flex h-full flex-col p-8 sm:p-10">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-iris/10 text-iris">
                  <pr.icon className="size-[18px]" strokeWidth={1.6} />
                </span>
                <h2 className="mt-8 font-display text-[26px] leading-tight tracking-tight text-ink">{pr.t}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{pr.b}</p>
              </Card>
            </Rise>
          ))}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function Begin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [hp, setHp] = useState("");

  return (
    <>
      <PageOpen
        index="04"
        label="Begin"
        title={<>Tell me the one<br /><span className="italic text-iris">you keep imagining.</span></>}
        lede="No discovery call to book a discovery call. Describe it in a paragraph and you will get a real answer \u2014 including if I think it is the wrong thing to build."
      />
      <div className="mx-auto w-full max-w-[1500px] px-6 pb-28 sm:px-10 lg:px-14">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Rise>
            <Card className="p-8 sm:p-10 lg:p-12">
              <form
                className="flex flex-col gap-7"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (sending) return;
                  setSending(true);
                  setResult(null);
                  try {
                    const res = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, email, brief, company: hp }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data.ok) {
                      setResult({ ok: false, text: data.error ?? "Something went wrong. Email me directly." });
                    } else if (data.delivered === false) {
                      /* Delivery is not wired up on this deployment. Saying
                         "sent" here would be the one lie the whole site is
                         built to avoid. */
                      setResult({ ok: true, text: `Received \u2014 but delivery is not configured yet, so please also email ${CONTACT.email} directly.` });
                    } else {
                      setResult({ ok: true, text: "Sent. You will get a real answer within one working day." });
                      setName(""); setEmail(""); setBrief("");
                    }
                  } catch {
                    setResult({ ok: false, text: "Network trouble. Email me directly and it will land." });
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {/* A field no person can see and no person fills in. */}
                <input
                  value={hp} onChange={(e) => setHp(e.target.value)}
                  type="text" tabIndex={-1} autoComplete="off" aria-hidden
                  className="absolute -left-[9999px] size-px opacity-0"
                />
                <label className="flex flex-col gap-3">
                  <Mono>Your name</Mono>
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    type="text" required autoComplete="name"
                    className="w-full border-0 border-b border-ink/15 bg-transparent px-0 py-3 text-[16px] text-ink placeholder:text-ink-mute focus:border-iris focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-3">
                  <Mono>Email</Mono>
                  <input
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    type="email" required autoComplete="email"
                    className="w-full border-0 border-b border-ink/15 bg-transparent px-0 py-3 text-[16px] text-ink placeholder:text-ink-mute focus:border-iris focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-3">
                  <Mono>Describe the website of your dreams</Mono>
                  <textarea
                    value={brief} onChange={(e) => setBrief(e.target.value)}
                    required rows={5}
                    className="w-full resize-y border-0 border-b border-ink/15 bg-transparent px-0 py-3 text-[16px] text-ink placeholder:text-ink-mute focus:border-iris focus:outline-none"
                  />
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-5">
                  <Btn primary icon={<ArrowRight className="size-4" strokeWidth={2} />}>
                    {sending ? "Sending\u2026" : "Send the brief"}
                  </Btn>
                  <span
                    role="status" aria-live="polite"
                    className={`max-w-xs text-[13px] leading-relaxed ${result && !result.ok ? "text-[#8c2f3c]" : "text-ink-soft"}`}
                  >
                    {result ? result.text : "Goes straight to the studio inbox. No autoresponder, no sequence."}
                  </span>
                </div>
              </form>
            </Card>
          </Rise>

          <Rise i={1}>
            <Card className="flex h-full flex-col gap-8 p-8 sm:p-10">
              <Mono live>Direct lines</Mono>
              <ul className="flex flex-col gap-5">
                <li className="flex flex-col gap-1.5 border-b border-ink/[0.08] pb-4">
                  <Mono>Email</Mono>
                  <a href={`mailto:${CONTACT.email}`} className="text-[16px] text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-iris">
                    {CONTACT.email}
                  </a>
                </li>
                <li className="flex flex-col gap-1.5 border-b border-ink/[0.08] pb-4">
                  <Mono>Based</Mono>
                  <span className="text-[16px] text-ink">{CONTACT.location}</span>
                </li>
                <li className="flex flex-col gap-1.5">
                  <Mono>Reply</Mono>
                  <span className="text-[16px] text-ink">{CONTACT.reply}</span>
                </li>
              </ul>
              <div className="mt-auto rounded-2xl bg-iris/[0.07] p-6">
                <Mono>Availability</Mono>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                  Taking on a small number of builds while the studio gets
                  established, which means the next one gets a disproportionate
                  amount of attention. Briefs are answered in order of arrival.
                </p>
              </div>
            </Card>
          </Rise>
        </div>
      </div>
    </>
  );
}