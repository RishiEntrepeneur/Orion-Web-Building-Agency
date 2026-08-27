/**
 * Scroll scrubbing, shared.
 *
 * The film gets its coherence from one rAF loop writing one progress value to
 * everything on the stage. The inner pages need the same motion language
 * without each becoming an eight-viewport film, so they register here instead:
 * one loop for the whole document, one observer deciding who is worth running.
 *
 * Why not framer-motion's `useScroll` per element: each one installs its own
 * listener and its own measurement, and thirty of them on a page means thirty
 * layout reads per frame. This measures registered elements once per frame and
 * only while they are actually on screen.
 */

type Apply = (p: number, el: HTMLElement) => void;

/**
 * How an element's progress is measured.
 *
 * `enter` completes over a fixed distance once the element's top crosses the
 * bottom of the viewport. `through` runs across the element's own travel from
 * fully below to fully above, which is what a pinned section needs.
 *
 * The distinction is not cosmetic. Measuring a reveal against the element's
 * own height means a tall card and a short one animate at completely different
 * rates from the same scroll -- a 500px card was still at 3% opacity with a
 * third of it already on screen, while a small one beside it had finished.
 */
type Mode = "enter" | "through";

type Entry = {
  el: HTMLElement;
  apply: Apply;
  mode: Mode;
  visible: boolean;
};

const entries = new Map<HTMLElement, Entry>();
let raf = 0;
let io: IntersectionObserver | null = null;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Viewport fractions a reveal takes to finish once the element starts entering. */
const REVEAL_TRAVEL = 0.62;

function frame() {
  raf = 0;
  const vh = window.innerHeight || 1;
  let live = 0;

  for (const e of entries.values()) {
    if (!e.visible) continue;
    live++;
    const r = e.el.getBoundingClientRect();
    if (e.mode === "enter") {
      // Fixed travel, so every reveal on the page moves at the same rate
      // regardless of how tall the thing being revealed happens to be.
      e.apply(clamp01((vh - r.top) / (vh * REVEAL_TRAVEL)), e.el);
    } else {
      e.apply(clamp01((vh - r.top) / Math.max(1, r.height + vh)), e.el);
    }
  }

  if (live > 0) raf = requestAnimationFrame(frame);
}

function kick() {
  if (!raf) raf = requestAnimationFrame(frame);
}

/**
 * Registers an element to be scrubbed. Returns a cleanup.
 *
 * `apply` is called with 0..1 for the element's travel through the viewport,
 * every frame it is on screen, and once immediately so the element is never
 * painted in an unstyled state before the first frame lands.
 */
export function addScrub(el: HTMLElement, apply: Apply, mode: Mode = "enter"): () => void {
  if (!io) {
    io = new IntersectionObserver(
      (recs) => {
        for (const r of recs) {
          const e = entries.get(r.target as HTMLElement);
          if (e) e.visible = r.isIntersecting;
        }
        kick();
      },
      // A generous margin: motion should be settled by the time an element is
      // properly in view, which means it has to start before it gets there.
      { rootMargin: "40% 0px 40% 0px" },
    );
  }
  const entry: Entry = { el, apply, mode, visible: true };
  entries.set(el, entry);
  io.observe(el);
  apply(0, el);
  kick();

  return () => {
    io?.unobserve(el);
    entries.delete(el);
  };
}

/** Smoothstep. */
export const ease = (t: number) => t * t * (3 - 2 * t);

/** Maps `p` through [a,b] onto 0..1, clamped. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Rises across [a,b], falls across [c,d]. */
export const band = (p: number, a: number, b: number, c: number, d: number) =>
  Math.min(ease(seg(p, a, b)), 1 - ease(seg(p, c, d)));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
