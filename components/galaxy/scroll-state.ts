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
};

let raf = 0;

/** Attaches a passive listener that keeps the singleton current. */
export function trackScroll(): () => void {
  const read = () => {
    raf = 0;
    const vh = Math.max(1, window.innerHeight);
    const doc = Math.max(1, document.documentElement.scrollHeight - vh);
    scrollState.descent = Math.min(1, Math.max(0, window.scrollY / (vh * 1.15)));
    scrollState.page = Math.min(1, Math.max(0, window.scrollY / doc));
  };

  const onScroll = () => {
    // Coalesce to one read per frame. A scroll handler that measures layout on
    // every event is the classic way to make a page feel heavy.
    if (!raf) raf = requestAnimationFrame(read);
  };

  read();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
