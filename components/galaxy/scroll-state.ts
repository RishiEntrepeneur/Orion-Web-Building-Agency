/**
 * Scroll singleton.
 *
 * Deliberately a plain mutable object rather than React state: it is written
 * on every scroll event and read on every animation frame inside the shader
 * loop. Routing either of those through React would re-render the tree at
 * 120Hz to change one float.
 */
export const scrollState = {
  /** 0..1 progress through the hero's descent. */
  descent: 0,
  /** 0..1 progress through the whole document. */
  page: 0,
  /**
   * 0..1 progress through the journey section, if one is mounted.
   *
   * The journey owns the camera: the sky, the flight into the screen and the
   * chapter type are all one continuous move, so they read a single number
   * rather than each deriving their own from window.scrollY and drifting
   * apart by a frame.
   */
  journey: 0,
  /**
   * Scroll speed in viewport heights per second, smoothed and signed.
   *
   * Used for motion that should respond to how fast you are travelling rather
   * than to where you are: letterforms that come apart under speed and settle
   * when you stop, motion blur, the bird beating harder to keep up.
   */
  velocity: 0,
};

/** The element the journey progress is measured against, if mounted. */
let journeyEl: HTMLElement | null = null;

/** Registers the journey container. Returns a de-registering cleanup. */
export function setJourneyElement(el: HTMLElement | null): () => void {
  journeyEl = el;
  return () => {
    if (journeyEl === el) journeyEl = null;
  };
}

let raf = 0;
let lastY = 0;
let lastT = 0;

/** Attaches a passive listener that keeps the singleton current. */
export function trackScroll(): () => void {
  const read = () => {
    raf = 0;
    const vh = Math.max(1, window.innerHeight);
    const doc = Math.max(1, document.documentElement.scrollHeight - vh);
    const y = window.scrollY;

    scrollState.descent = Math.min(1, Math.max(0, y / (vh * 1.15)));
    scrollState.page = Math.min(1, Math.max(0, y / doc));

    if (journeyEl) {
      // The journey is a tall block with a sticky stage inside it. Progress is
      // how far its top has travelled past the top of the viewport, over the
      // distance it can travel before its bottom arrives.
      const r = journeyEl.getBoundingClientRect();
      const travel = Math.max(1, r.height - vh);
      scrollState.journey = Math.min(1, Math.max(0, -r.top / travel));
    }

    const now = performance.now();
    if (lastT) {
      const dt = Math.max(16, now - lastT);
      const v = ((y - lastY) / vh) * (1000 / dt);
      // Heavy smoothing. Raw wheel deltas arrive in coarse jumps, and anything
      // driven straight off them stutters instead of surging.
      scrollState.velocity += (v - scrollState.velocity) * 0.18;
    }
    lastY = y;
    lastT = now;
  };

  const onScroll = () => {
    // Coalesce to one read per frame. A scroll handler that measures layout on
    // every event is the classic way to make a page feel heavy.
    if (!raf) raf = requestAnimationFrame(read);
  };

  // Velocity has to decay on its own: when scrolling stops, no further events
  // arrive, and without this the last value would stay latched forever.
  const idle = window.setInterval(() => {
    if (Math.abs(scrollState.velocity) < 0.001) return;
    scrollState.velocity *= 0.72;
    if (Math.abs(scrollState.velocity) < 0.001) scrollState.velocity = 0;
  }, 60);

  read();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.clearInterval(idle);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
