"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { addScrub, band, ease, lerp, seg } from "./scrub";

/**
 * The motion language the inner pages share with the film.
 *
 * The film works because things move through depth on a camera path rather
 * than fading up from twelve pixels below. These are the two pieces of that
 * the rest of the site needs: an opening that holds while its type separates
 * on scroll, and content that arrives from distance rather than from nowhere.
 */

/* -------------------------------------------------------------------------- */

/**
 * A page opening. Pinned for one viewport while the type parts on scroll.
 *
 * The index and label counter-move against the title, so the whole header
 * comes apart in depth instead of sliding as one block -- the difference
 * between a camera moving through a scene and a div translating up a page.
 */
export function PageOpen({
  index,
  label,
  title,
  lede,
}: {
  index: string;
  label: string;
  title: ReactNode;
  lede: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLParagraphElement>(null);
  const rule = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    return addScrub(el, (p) => {
      const out = ease(seg(p, 0.42, 0.96));
      if (stage.current) stage.current.style.opacity = String(1 - out * 0.92);
      if (h1.current)
        h1.current.style.transform = `translate3d(0, ${lerp(0, -7, out)}vh, ${lerp(0, 340, out)}px)`;
      if (meta.current)
        meta.current.style.transform = `translate3d(0, ${lerp(0, -3, out)}vh, ${lerp(0, -180, out)}px)`;
      if (lead.current)
        lead.current.style.transform = `translate3d(0, ${lerp(0, -2, out)}vh, ${lerp(0, -300, out)}px)`;
      if (rule.current) rule.current.style.transform = `scaleX(${ease(seg(p, 0.1, 0.44))})`;
    }, "through");
  }, []);

  return (
    <div ref={wrap} className="relative h-[168svh]">
      <div
        ref={stage}
        className="sticky top-0 flex h-svh items-center [perspective:1100px] [transform-style:preserve-3d]"
      >
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-14">
          <div className="copy-veil max-w-4xl">
            <div ref={meta} className="flex items-center gap-4 will-change-transform">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-iris">
                {index}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink-soft">
                {label}
              </span>
              <span
                ref={rule}
                aria-hidden
                className="h-px w-24 origin-left bg-ink/20 will-change-transform"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <h1
              ref={h1}
              className="mt-7 font-display text-[clamp(2.5rem,7.4vw,6.2rem)] leading-[0.94] tracking-[-0.03em] text-ink will-change-transform"
            >
              {title}
            </h1>
            <p
              ref={lead}
              className="mt-8 max-w-xl text-[17px] leading-relaxed text-ink-soft will-change-transform"
            >
              {lede}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Content arriving from distance.
 *
 * A real z translation under a perspective, not a y offset: near the start of
 * its travel the element is genuinely further away, so it scales the way the
 * rest of the site's depth does. `i` staggers siblings without any of them
 * needing to know how many there are.
 */
export function Rise({
  children,
  i = 0,
  className = "",
}: {
  children: ReactNode;
  i?: number;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const a = Math.min(0.3, i * 0.07);
    return addScrub(node, (p) => {
      const t = ease(seg(p, a, a + 0.5));
      node.style.opacity = String(t);
      node.style.transform = `translate3d(0, ${lerp(52, 0, t)}px, ${lerp(-420, 0, t)}px)`;
    });
  }, [i]);
  return (
    <div
      ref={el}
      style={{ opacity: 0 }}
      className={`[transform-style:preserve-3d] will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A figure that holds the frame while its own detail is scrubbed through.
 *
 * Used for the pieces of work that have something to show rather than
 * something to list: the panel pins, and the caption steps as you scroll.
 */
export function Pinned({
  steps,
  children,
  height = 260,
}: {
  steps: string[];
  children: (p: number) => ReactNode;
  height?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const prog = useRef(0);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    return addScrub(el, (p) => {
      prog.current = p;
      const i = Math.min(steps.length - 1, Math.floor(seg(p, 0.12, 0.92) * steps.length));
      if (label.current && label.current.textContent !== steps[i])
        label.current.textContent = steps[i];
      if (bar.current) bar.current.style.transform = `scaleX(${seg(p, 0.08, 0.94)})`;
      if (host.current)
        host.current.style.setProperty("--p", seg(p, 0.08, 0.94).toFixed(4));
    }, "through");
  }, [steps]);

  return (
    <div ref={wrap} className="relative" style={{ height: `${height}svh` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center">
        <div ref={host} className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-14">
          <div className="mb-6 flex items-center gap-5">
            <span
              ref={label}
              className="font-mono text-[11px] uppercase tracking-[0.26em] text-iris"
            >
              {steps[0]}
            </span>
            <span aria-hidden className="relative h-px flex-1 bg-ink/12">
              <span
                ref={bar}
                className="absolute inset-0 origin-left bg-iris/60"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
          </div>
          <ScrubHost get={() => prog.current} render={children} />
        </div>
      </div>
    </div>
  );
}

/**
 * Re-renders its children against a progress value on animation frames.
 *
 * Deliberately the only place in this file that re-renders: everything else
 * writes transforms straight onto nodes. A figure whose *content* changes with
 * scroll cannot do that, so it gets React -- but on a quantised value, so the
 * frames where nothing meaningful moved cost nothing. A figure does not need
 * sub-percent updates.
 */
function ScrubHost({
  get,
  render,
}: {
  get: () => number;
  render: (p: number) => ReactNode;
}) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const q = Math.round(get() * 120);
      if (q === last) return;
      last = q;
      setP(q / 120);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [get]);
  return <>{render(p)}</>;
}
