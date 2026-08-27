"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>=+*#%$@";

/**
 * Decode-in text.
 *
 * Each character resolves at its own time; until it does, it cycles through
 * junk glyphs. Chosen over a fade because a fade is what every template does
 * and a decode is legibly a *process* — it reads as something being computed
 * rather than something being revealed.
 *
 * Widths are held by rendering junk of the same length from the first frame,
 * so nothing reflows as it resolves. The real string sits on the container's
 * aria-label with the animated glyphs hidden.
 */
export default function ScrambleText({
  text,
  className = "",
  delay = 0,
  speed = 34,
  perChar = 44,
}: {
  text: string;
  className?: string;
  delay?: number;
  /** ms between glyph swaps */
  speed?: number;
  /** ms of extra scramble each successive character earns */
  perChar?: number;
}) {
  const [out, setOut] = useState(() =>
    text.replace(/[^\s]/g, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]),
  );
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }

    let raf = 0;
    let timer = 0;
    const chars = text.split("");
    const started = { at: 0 };

    const tick = (now: number) => {
      if (!started.at) started.at = now;
      const elapsed = now - started.at;

      let done = true;
      const next = chars.map((ch, i) => {
        if (ch === " ") return " ";
        const settleAt = i * perChar + 260;
        if (elapsed >= settleAt) return ch;
        done = false;
        // Re-roll on a fixed cadence rather than every frame, so the churn
        // reads as discrete machine output instead of a blur.
        const seed = Math.floor(elapsed / speed) + i;
        return GLYPHS[seed % GLYPHS.length];
      });

      setOut(next.join(""));
      frame.current = elapsed;
      if (!done) raf = requestAnimationFrame(tick);
    };

    timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, delay, speed, perChar]);

  return (
    <span aria-label={text} className={className}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
