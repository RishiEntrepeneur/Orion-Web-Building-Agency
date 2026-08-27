"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Command = { id: string; label: string; hint: string; run: () => void };

/**
 * Command palette.
 *
 * Keyboard behaviour is the whole point of the component, so it is handled
 * properly rather than approximately:
 *  - Cmd/Ctrl+K toggles, Escape closes, arrows move, Enter runs.
 *  - Focus is trapped while open and returned to whatever had it before, so a
 *    keyboard user is never dumped at the top of the document.
 *  - The listbox follows the ARIA combobox pattern with aria-activedescendant,
 *    which is what lets a screen reader announce the highlighted row while
 *    focus stays in the input.
 *  - Matching is subsequence, not substring, so "cnt" finds "Contact".
 */
export default function CommandPalette({ commands }: { commands: Command[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const hay = (c.label + " " + c.hint).toLowerCase();
      let i = 0;
      for (const ch of q) {
        i = hay.indexOf(ch, i);
        if (i === -1) return false;
        i++;
      }
      return true;
    });
  }, [commands, query]);

  /**
   * Close the palette.
   *
   * `restore` is false when a command ran. Dismissing the palette should put
   * focus back where it was taken from, but running a command hands the page
   * to somewhere else \u2014 a route change moves focus to the new heading \u2014 and
   * restoring here as well makes two writers race for it. That race is only
   * lost some of the time, which is the worst way for it to be wrong.
   */
  const close = useCallback((restore = true) => {
    setOpen(false);
    setQuery("");
    setActive(0);
    if (restore) restoreTo.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) restoreTo.current = document.activeElement as HTMLElement;
          return !v;
        });
        return;
      }
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  /**
   * Give the input focus once it is actually mounted.
   *
   * Not on an animation frame: the page behind this is a volumetric raymarch,
   * and when the renderer is holding frames the callback can be tens or
   * hundreds of milliseconds late \u2014 long enough that the first characters a
   * fast typist presses after \u2318K go nowhere. Retry on a short timer until the
   * browser confirms the input has focus.
   */
  useEffect(() => {
    if (!open) return;
    let timer = 0;
    const grab = () => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        // Stop as soon as the browser confirms it. No clock on this loop: the
        // input is the only thing that should hold focus while the palette is
        // open, and closing tears the effect down, so "still trying" cannot
        // outlive the reason to try.
        if (document.activeElement === el) return;
      }
      timer = window.setTimeout(grab, 24);
    };
    grab();
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % Math.max(1, results.length)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + results.length) % Math.max(1, results.length)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) { close(false); cmd.run(); }
    } else if (e.key === "Tab") {
      // Trap: the palette is the only thing on screen while it is open.
      e.preventDefault();
    }
  };

  return (
    <>
      {/* The affordance. A palette nobody knows about is a palette nobody uses.
          Bottom-right rather than bottom-centre: the hero pins its own live
          telemetry to the centre of that edge, and two things fixed to the same
          point is how a viewport ends up with one drawn through the other. */}
      <button
        onClick={() => { restoreTo.current = document.activeElement as HTMLElement; setOpen(true); }}
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-white/70 bg-cream/75 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute backdrop-blur-xl transition-colors duration-300 hover:text-ink lg:flex"
      >
        <Search className="size-3" strokeWidth={2} />
        Search
        <kbd className="rounded border border-ink/15 px-1.5 py-0.5 text-[9px]">&#8984;K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/25 px-4 pt-[14vh] backdrop-blur-md"
            onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ type: "spring", mass: 0.5, stiffness: 220, damping: 22 }}
              role="dialog" aria-modal="true" aria-label="Command palette"
              className="card w-full max-w-lg overflow-hidden rounded-[20px]"
            >
              <div className="flex items-center gap-3 border-b border-ink/10 px-4">
                <Search className="size-4 shrink-0 text-ink-mute" strokeWidth={2} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                  aria-autocomplete="list"
                  placeholder="Jump to&hellip;"
                  className="w-full bg-transparent py-4 text-[15px] text-ink placeholder:text-ink-mute/70 focus:outline-none"
                />
              </div>

              <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-[46vh] overflow-y-auto p-2">
                {results.length === 0 && (
                  <li className="px-3 py-6 text-center text-[13px] text-ink-mute">Nothing matches that.</li>
                )}
                {results.map((c, i) => (
                  <li
                    key={c.id}
                    id={`cmd-${c.id}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => { e.preventDefault(); close(false); c.run(); }}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors duration-150 ${
                      i === active ? "bg-iris/12" : ""
                    }`}
                  >
                    <span className="text-[14px] text-ink">{c.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">{c.hint}</span>
                      {i === active && <CornerDownLeft className="size-3 text-ink-mute" strokeWidth={2} />}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
