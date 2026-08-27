"use client";

/**
 * Instrument chrome.
 *
 * Corner brackets, edge ticks and a live readout. The numbers are not
 * decoration: they are the renderer's actual frame rate, its current sample
 * count and the buffer scale it settled on. A studio that claims performance
 * work should be willing to print its own.
 */
export function Ticks({ side }: { side: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 ${side}-0 hidden h-6 lg:block`}
    >
      <div className="relative mx-auto h-full max-w-[1600px] overflow-hidden px-8">
        {Array.from({ length: 41 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-0 w-px bg-white/20"
            style={{ left: `calc(${(i / 40) * 100}% - ${i === 40 ? 1 : 0}px)`, height: i % 5 === 0 ? "10px" : "5px" }}
          />
        ))}
      </div>
    </div>
  );
}

export function Corner({ at }: { at: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: "left-5 top-5 border-l border-t",
    tr: "right-5 top-5 border-r border-t",
    bl: "left-5 bottom-5 border-l border-b",
    br: "right-5 bottom-5 border-r border-b",
  }[at];
  return <span aria-hidden className={`pointer-events-none absolute size-8 border-white/25 ${pos}`} />;
}

export function Readout({
  fps,
  steps,
  scale,
}: {
  fps: number;
  steps: number;
  scale: number;
}) {
  const rows: Array<[string, string]> = [
    ["RENDER", "RAYMARCH / VOLUMETRIC"],
    ["SAMPLES", `${steps}/PX`],
    ["BUFFER", `${Math.round(scale * 100)}%`],
    ["FRAME", fps ? `${fps.toFixed(0)} FPS` : "STATIC"],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] sm:grid-cols-4 lg:grid-cols-1">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] pb-1.5">
          <dt className="text-white/35">{k}</dt>
          <dd className="tabular-nums text-white/80">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
