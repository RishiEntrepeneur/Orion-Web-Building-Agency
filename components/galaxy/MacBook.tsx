"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const QUERY = "how to build a website";

type Stage = "closed" | "opening" | "waking" | "typing" | "thinking" | "resolved";

/**
 * The opening shot.
 *
 * A laptop built out of CSS 3D rather than a model: two planes sharing a
 * hinge, with the lid rotated about its bottom edge. `transform-style:
 * preserve-3d` on the shell and a perspective on the stage are what make the
 * lid a physical object instead of a rectangle changing height — a scaleY
 * animation reads as a shutter and is the giveaway that there is no geometry.
 *
 * The sequence is a small state machine rather than a pile of timeouts, so
 * every stage has one place that owns it and skipping straight to the end
 * under reduced motion is a single branch.
 */
export default function MacBook({ onResolved }: { onResolved?: () => void }) {
  const [stage, setStage] = useState<Stage>("closed");
  const [typed, setTyped] = useState("");
  const lid = useAnimation();

  /* Held in a ref, not a dependency. The parent passes an inline arrow, so as
     a dependency it changes identity on every render -- and since typing sets
     state on every character, the effect would tear the whole sequence down
     and restart it from the first letter, forever. */
  const resolvedCb = useRef(onResolved);
  resolvedCb.current = onResolved;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("resolved");
      setTyped(QUERY);
      lid.set({ rotateX: -14 });
      resolvedCb.current?.();
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));

    (async () => {
      await wait(350);
      if (cancelled) return;
      setStage("opening");

      /* The lid overshoots slightly and settles. A hinge with a real spring in
         it does that; a lid that stops dead at its final angle does not. */
      await lid.start({
        rotateX: -14,
        transition: { type: "spring", mass: 1.1, stiffness: 62, damping: 13 },
      });
      if (cancelled) return;

      setStage("waking");
      await wait(420);
      if (cancelled) return;

      setStage("typing");
      for (let i = 1; i <= QUERY.length; i++) {
        // Uneven cadence. A fixed interval reads as a machine printing; a
        // human hesitates, and the hesitation is most of the illusion.
        const gap = QUERY[i - 1] === " " ? 120 : 46 + Math.random() * 70;
        await wait(gap);
        if (cancelled) return;
        setTyped(QUERY.slice(0, i));
      }

      await wait(520);
      if (cancelled) return;
      setStage("thinking");
      await wait(1150);
      if (cancelled) return;
      setStage("resolved");
      resolvedCb.current?.();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [lid]);

  const awake = stage !== "closed" && stage !== "opening";

  return (
    <div className="relative w-full select-none" style={{ perspective: "1700px" }}>
      <div className="relative mx-auto w-full max-w-[540px]" style={{ transformStyle: "preserve-3d" }}>
        {/* Lid */}
        <motion.div
          initial={{ rotateX: -90 }}
          animate={lid}
          style={{ transformOrigin: "bottom center", transformStyle: "preserve-3d" }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-t-[14px] border border-b-0 border-white/25 bg-[#141821] p-[9px] shadow-[0_30px_80px_-30px_rgba(20,24,40,0.85)]">
            {/* Screen */}
            <div className="relative aspect-[16/10.4] overflow-hidden rounded-[7px] bg-[#07080d]">
              <motion.div
                animate={{ opacity: awake ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.04] px-3 py-2">
                  <span className="size-[7px] rounded-full bg-[#ff5f57]" />
                  <span className="size-[7px] rounded-full bg-[#febc2e]" />
                  <span className="size-[7px] rounded-full bg-[#28c840]" />
                  <span className="ml-2 flex-1 truncate rounded-[5px] bg-black/45 px-2.5 py-[3px] text-left font-mono text-[8px] tracking-wide text-white/35">
                    orion.studio
                  </span>
                </div>

                {/* Prompt */}
                <div className="flex flex-1 flex-col justify-center px-5">
                  {stage !== "resolved" ? (
                    <>
                      <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-white/25">
                        Ask Orion
                      </p>
                      <p className="mt-2 text-left font-mono text-[11px] text-white/90 sm:text-[13px]">
                        {typed}
                        <motion.span
                          animate={{ opacity: [1, 1, 0, 0] }}
                          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                          className="ml-[1px] inline-block h-[1.05em] w-[6px] translate-y-[2px] bg-[#7c8cff]"
                        />
                      </p>
                      {stage === "thinking" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 flex items-center gap-1.5"
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16 }}
                              className="size-1 rounded-full bg-[#7c8cff]"
                            />
                          ))}
                          <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.24em] text-white/35">
                            Composing
                          </span>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ type: "spring", mass: 0.5, stiffness: 100, damping: 15 }}
                      className="text-left"
                    >
                      <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#7c8cff]">
                        Built in 48 hours
                      </p>
                      <p className="mt-2 font-display text-[26px] leading-[0.95] text-white sm:text-[34px]">
                        ORION
                      </p>
                      <p className="mt-1.5 text-[9px] leading-snug text-white/45 sm:text-[10px]">
                        The website of your dreams, rendered while you watch.
                      </p>
                      <div className="mt-3 flex gap-1.5">
                        {["3D", "AI", "48H"].map((t, i) => (
                          <motion.span
                            key={t}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.08, type: "spring", mass: 0.5, stiffness: 100, damping: 15 }}
                            className="rounded-full border border-white/15 px-2 py-[2px] font-mono text-[7px] tracking-[0.16em] text-white/60"
                          >
                            {t}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Screen glass: a raking highlight across the panel. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(118deg, rgba(255,255,255,0.11) 0%, transparent 38%, transparent 68%, rgba(255,255,255,0.05) 100%)" }}
              />
            </div>
            <p className="pt-[5px] text-center font-mono text-[6px] tracking-[0.3em] text-white/25">ORION</p>
          </div>
        </motion.div>

        {/* Base */}
        <div className="relative">
          <div className="h-[11px] rounded-b-[9px] border border-t-0 border-white/20 bg-gradient-to-b from-[#20242f] to-[#11141c]" />
          <div className="mx-auto h-[4px] w-[22%] rounded-b-[6px] bg-gradient-to-b from-[#1b1f28] to-[#0d1015]" />
          {/* Contact shadow. Its opacity follows the lid, so the machine reads
              as sitting on a surface rather than floating. */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scaleX: 0.7 }}
            animate={{ opacity: awake ? 0.6 : 0.15, scaleX: awake ? 1 : 0.8 }}
            transition={{ duration: 1 }}
            className="mx-auto mt-2 h-8 w-[86%] rounded-[50%] bg-black/40 blur-2xl"
          />
        </div>
      </div>
    </div>
  );
}
