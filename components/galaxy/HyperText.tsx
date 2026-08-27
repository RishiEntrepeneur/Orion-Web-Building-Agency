"use client";

import { motion } from "framer-motion";
import { Fragment } from "react";

/** The accent ramp, violet through white to cyan. */
const RAMP: Array<[number, number, number]> = [
  [0x63, 0x66, 0xf1],
  [0xa5, 0xb4, 0xfc],
  [0xff, 0xff, 0xff],
  [0x67, 0xe8, 0xf9],
  [0x06, 0xb6, 0xd4],
];

/**
 * Colour at `t` (0..1) along the ramp.
 *
 * The accented run is coloured per character rather than by clipping a
 * gradient to the text. That is not a stylistic preference: each character
 * animates its own `filter: blur()`, and a filter on a descendant gives it its
 * own containing block, so it is painted separately from the ancestor whose
 * background the gradient lives on. The glyphs then render with the inherited
 * `color: transparent` and nothing paints them — the line disappears entirely.
 * Sampling the ramp per character survives the filter and reads identically.
 */
function rampColour(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const a = RAMP[i];
  const b = RAMP[i + 1];
  const mix = (n: number) => Math.round(a[n] + (b[n] - a[n]) * f);
  return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}

/**
 * Staggered headline reveal.
 *
 * Characters animate individually but are wrapped per word, so the line still
 * breaks on word boundaries at every width — a naive per-character map wraps
 * mid-word on a phone and turns the headline into gibberish.
 *
 * The full string is carried on the container's aria-label with the pieces
 * hidden, so a screen reader hears one sentence rather than twenty-four
 * separate letters.
 */
export default function HyperText({
  text,
  className = "",
  delay = 0,
  stagger = 0.028,
  accent = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Colour the run along the violet-to-cyan ramp. */
  accent?: boolean;
}) {
  const words = text.split(" ");
  const total = Math.max(1, text.replace(/\s/g, "").length - 1);
  let index = 0;

  return (
    <span aria-label={text} className={className}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden className="inline-block">
            {word.split("").map((char) => {
              const i = index++;
              return (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform"
                  style={accent ? { color: rampColour(i / total) } : undefined}
                  initial={{ opacity: 0, y: "0.42em", filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
                  transition={{
                    type: "spring",
                    mass: 0.5,
                    stiffness: 100,
                    damping: 15,
                    delay: delay + i * stagger,
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
          {w < words.length - 1 && <span aria-hidden> </span>}
        </Fragment>
      ))}
    </span>
  );
}
