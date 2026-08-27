/**
 * The film plays itself.
 *
 * Scrolling is how the sequence is scrubbed, but nobody should have to work a
 * wheel to see the opening. This advances the page slowly and continuously so
 * the film runs on its own, and gets out of the way the instant the visitor
 * takes over.
 *
 * Three rules it will not break:
 *
 *  - It stops the moment a person touches the page. Not "slows down", not
 *    "resumes after a pause" -- fighting someone for control of their own
 *    scroll position is the single most hostile thing a page can do.
 *  - It never starts when the operating system has asked for reduced motion.
 *  - It exposes a pause control, and the caller is expected to render one. Motion
 *    that lasts more than five seconds and cannot be stopped is an
 *    accessibility failure (WCAG 2.2.2), and a full-length film is well past
 *    that.
 */

export type PlayState = "playing" | "paused" | "done" | "off";

type Opts = {
  /** Seconds the camera takes to travel one viewport height. */
  secondsPerViewport?: number;
  /** Scroll position, in px, past which the film is over and playback stops. */
  until: () => number;
  onState: (s: PlayState) => void;
};

export function createAutoplay({ secondsPerViewport = 7.5, until, onState }: Opts) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let state: PlayState = reduced ? "off" : "paused";
  let raf = 0;
  /* Playback is paced off the wall clock, from a position and a time captured
     when play started, rather than by accumulating a per-frame delta.
     Accumulating means clamping that delta -- otherwise one long frame jumps
     the film -- and a clamp makes the playback rate a function of the frame
     rate: measured on a software rasteriser it ran at a fifth of the intended
     speed, because every 200ms frame was counted as 50ms. Position from
     elapsed time cannot drift and cannot care how fast the renderer is. */
  let originY = 0;
  let originT = 0;
  let disposed = false;

  const set = (s: PlayState) => {
    if (state === s) return;
    state = s;
    onState(s);
  };

  const frame = (now: number) => {
    if (disposed || state !== "playing") { raf = 0; return; }
    raf = requestAnimationFrame(frame);

    const vh = window.innerHeight || 1;
    const target = originY + ((now - originT) / 1000) * (vh / secondsPerViewport);

    /* `behavior: "instant"` is load-bearing. The document sets
       `scroll-behavior: smooth` so in-page anchors glide, and under that a
       plain scrollTo starts an animation toward the target rather than going
       there. Called every frame with a target six pixels further on, each call
       restarts that animation and none of them ever arrive: the film reported
       itself as playing and the page did not move at all. */
    const end = until();
    if (target >= end) {
      window.scrollTo({ top: end, behavior: "instant" });
      set("done");
      return;
    }
    window.scrollTo({ top: target, behavior: "instant" });
  };

  const play = () => {
    if (state === "off" || state === "playing") return;
    originY = window.scrollY;
    originT = performance.now();
    set("playing");
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const pause = (next: PlayState = "paused") => {
    if (state === "off" || state === "done") return;
    set(next);
  };

  /* Taking over.
     Deliberately listening for the *inputs* rather than for scroll events:
     our own scrollTo fires scroll events too, and telling the two apart by
     comparing positions is a race that gets it wrong exactly when the page is
     busy. A wheel, a touch, a key or a drag on the scrollbar is unambiguous. */
  /* A press on the film's own controls is not the visitor taking over the
     scroll -- without this, clicking "play" fired pointerdown, paused, and then
     the click toggled it back, so the button appeared to do nothing at all. */
  const fromControls = (e: Event) =>
    e.target instanceof Element && !!e.target.closest("[data-film-control]");
  const yield_ = (e: Event) => { if (!fromControls(e)) pause(); };
  const opts = { passive: true } as const;
  window.addEventListener("wheel", yield_, opts);
  window.addEventListener("touchstart", yield_, opts);
  window.addEventListener("pointerdown", yield_, opts);
  const onKey = (e: KeyboardEvent) => {
    const keys = ["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," ","Space"];
    if (keys.includes(e.key)) yield_(e);
  };
  window.addEventListener("keydown", onKey);

  // A film playing in a tab nobody is looking at is wasted motion, and comes
  // back having silently scrolled the page while they were gone.
  const onVis = () => { if (document.hidden) pause(); };
  document.addEventListener("visibilitychange", onVis);

  onState(state);

  return {
    play,
    pause: () => pause(),
    toggle: () => (state === "playing" ? pause() : play()),
    get state() { return state; },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("wheel", yield_);
      window.removeEventListener("touchstart", yield_);
      window.removeEventListener("pointerdown", yield_);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
