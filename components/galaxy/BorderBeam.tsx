"use client";

/**
 * A light travelling around a border.
 *
 * The beam is a conic gradient rotating inside the element, masked to a ring
 * one pixel wide by compositing two rounded boxes: `padding-box` fills the
 * inside, `border-box` fills the whole thing, and `xor` leaves only the border
 * itself. That is what makes the beam a border rather than a glow behind the
 * button, and it costs one compositor-only animation rather than a repaint.
 */
export default function BorderBeam({
  duration = 6,
  delay = 0,
  radius = "9999px",
  from = "#6366F1",
  via = "#06B6D4",
}: {
  duration?: number;
  delay?: number;
  radius?: string;
  from?: string;
  via?: string;
}) {
  return (
    <span
      aria-hidden
      className="galaxy-beam pointer-events-none absolute inset-0"
      style={
        {
          borderRadius: radius,
          "--beam-from": from,
          "--beam-via": via,
          "--beam-duration": `${duration}s`,
          "--beam-delay": `${delay}s`,
        } as React.CSSProperties
      }
    />
  );
}
