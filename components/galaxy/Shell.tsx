"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Feather, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import Birds from "./Birds";
import CloudCanvas from "./CloudCanvas";
import CommandPalette, { type Command } from "./CommandPalette";
import Cursor from "./Cursor";
import { setTelemetry } from "./telemetry";
import { trackScroll } from "./scroll-state";
import { CONTACT, Mono, ROUTES } from "./ui-kit";

/**
 * Everything that outlives a route change.
 *
 * The sky, the flock, the cursor and the palette are mounted once here rather
 * than per page. That is the whole reason navigating this site moves a camera
 * instead of rebuilding a world: one WebGL context, one flock, one scroll
 * listener, for the life of the session.
 */
export default function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  useEffect(() => trackScroll(), []);
  useEffect(() => setMenu(false), [path]);

  /**
   * Move focus to the new page's heading on a route change.
   *
   * On a timer rather than on animation frames: the sky behind this is a
   * volumetric raymarch, and on a weak GPU it can hold frames for tens of
   * milliseconds at a time, so a frame-driven poll loses the race precisely on
   * the machines least able to afford it. It stops only once the browser
   * confirms the focus took -- calling focus() during a swap does not always
   * land, and a write that silently did nothing looks identical to one that
   * worked. Nothing is stolen from a visitor who has already moved into the
   * page themselves.
   */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const deadline = performance.now() + 5000;
    let timer = 0;
    const attempt = () => {
      const h = document.querySelector<HTMLElement>("main h1");
      const here = document.activeElement as HTMLElement | null;
      if (h && !here?.closest("main")) {
        h.setAttribute("tabindex", "-1");
        h.focus({ preventScroll: true });
        if (document.activeElement === h) return;
      }
      if (performance.now() > deadline) return;
      timer = window.setTimeout(attempt, 32);
    };
    timer = window.setTimeout(attempt, 32);
    return () => window.clearTimeout(timer);
  }, [path]);

  const commands: Command[] = [
    ...ROUTES.map((r) => ({
      id: `route${r.path}`,
      label: `${r.label}`,
      hint: `Page ${r.index}`,
      run: () => router.push(r.path),
    })),
    { id: "mail", label: "Email the studio", hint: CONTACT.email,
      run: () => { window.location.href = `mailto:${CONTACT.email}`; } },
    { id: "top", label: "Back to the top", hint: "Scroll",
      run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  ];

  const active = ROUTES.find((r) => r.path === path);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-[13px] focus:text-cream"
      >
        Skip to content
      </a>

      <CloudCanvas onTelemetry={setTelemetry} />
      <Birds count={6} />
      <Cursor />
      <CommandPalette commands={commands} />

      {/* Route changes are posted here so assistive technology hears them. */}
      <p aria-live="polite" className="sr-only">{active?.label} page</p>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, rgba(253,251,246,0) 0%, rgba(238,241,251,0.18) 46%, rgba(238,241,251,0.55) 100%)" }}
      />

      <header className="film-hide fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-4 flex h-14 w-[calc(100%-2rem)] max-w-[1500px] items-center justify-between gap-5 rounded-full border border-white/70 bg-cream/70 px-5 backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Orion, home">
            <Feather className="size-4 text-iris" strokeWidth={1.6} />
            <span className="font-display text-[19px] leading-none tracking-tight text-ink">Orion</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {ROUTES.map((r) => (
              <Link key={r.path} href={r.path} aria-current={r.path === path ? "page" : undefined} className="group relative py-1">
                <span className={`text-[14px] tracking-tight transition-colors duration-300 ${r.path === path ? "text-ink" : "text-ink-mute group-hover:text-ink"}`}>
                  {r.label}
                </span>
                <span className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-iris transition-transform duration-500 ${r.path === path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/contact" className="hidden rounded-full bg-ink px-5 py-2.5 text-[14px] text-cream transition-transform duration-300 hover:scale-[1.03] sm:block">
              Start dreaming
            </Link>
            <button onClick={() => setMenu(true)} aria-label="Open menu" className="text-ink lg:hidden">
              <Menu className="size-5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-cream/95 backdrop-blur-2xl lg:hidden">
            <div className="flex h-20 items-center justify-end px-8">
              <button onClick={() => setMenu(false)} aria-label="Close menu" className="text-ink">
                <X className="size-5" strokeWidth={1.6} />
              </button>
            </div>
            <nav className="px-8" aria-label="Mobile">
              {ROUTES.map((r, i) => (
                <motion.div key={r.path} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.05 }}>
                  <Link href={r.path} className="block border-b border-ink/10 py-6 text-left font-display text-[34px] tracking-tight text-ink">
                    {r.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" className="relative [overflow-x:clip]">{children}</main>

      <footer className="relative mx-auto w-full max-w-[1500px] px-6 pb-12 sm:px-10 lg:px-24 lg:pb-24">
        <div className="card rounded-[30px] p-8 sm:p-12">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <p className="font-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.98] tracking-[-0.02em] text-ink">
              Let&rsquo;s build the one<br />you keep imagining.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {ROUTES.map((r) => (
                <Link key={r.path} href={r.path} className="text-[14px] text-ink-mute transition-colors duration-300 hover:text-ink">
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-ink/10 pt-6 sm:flex-row sm:justify-between">
            <Mono>Orion Dream Studio &mdash; {CONTACT.location}</Mono>
            <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-ink">
              <Mono>{CONTACT.email}</Mono>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
