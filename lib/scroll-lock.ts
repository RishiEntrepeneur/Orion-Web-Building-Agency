/**
 * Scroll locking that also stops Lenis.
 *
 * Setting `overflow: hidden` is not enough once a smooth-scroll library is
 * driving the page: Lenis listens for wheel and touch events itself and keeps
 * scrolling regardless of what CSS says. The lock therefore has to do both —
 * pin the document for native scrolling, and tell Lenis to stand down.
 */
type LenisLike = { stop: () => void; start: () => void };

let lenis: LenisLike | null = null;
let depth = 0;
let restore: { root: string; body: string; padding: string } | null = null;

/** Called by LenisProvider so the lock can reach the live instance. */
export function registerLenis(instance: LenisLike | null) {
  lenis = instance;
}

export function lockScroll() {
  depth += 1;
  if (depth > 1) return;

  const root = document.documentElement;
  const body = document.body;
  restore = {
    root: root.style.overflow,
    body: body.style.overflow,
    padding: body.style.paddingRight,
  };

  // Compensate for the scrollbar so the page does not jump as it locks.
  const scrollbar = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  body.style.overflow = "hidden";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

  lenis?.stop();
}

export function unlockScroll() {
  depth = Math.max(0, depth - 1);
  if (depth > 0 || !restore) return;

  const root = document.documentElement;
  const body = document.body;
  root.style.overflow = restore.root;
  body.style.overflow = restore.body;
  body.style.paddingRight = restore.padding;
  restore = null;

  lenis?.start();
}
