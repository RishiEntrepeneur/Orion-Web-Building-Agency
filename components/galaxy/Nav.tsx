"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SPRING, SPRING_SNAP } from "./motion";
import { MonoLabel } from "./ui";

export type Route = { path: string; label: string; index: string };

/**
 * Header navigation.
 *
 * The active pill is one shared layout element rather than a class on each
 * link, so Framer Motion interpolates it between items -- the highlight slides
 * to the tab you picked instead of blinking out and back in somewhere else.
 */
export default function Nav({
  routes,
  current,
  onNavigate,
}: {
  routes: Route[];
  current: string;
  onNavigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/85 via-[#030303]/45 to-transparent backdrop-blur-xl" />
        <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6 sm:px-10 lg:px-16">
          <button
            onClick={() => onNavigate("/")}
            className="group flex items-center gap-3 text-left"
            aria-label="Orion, home"
          >
            <span className="relative flex size-8 items-center justify-center">
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#06B6D4] opacity-90 blur-[7px] transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative size-2 rounded-full bg-[#FAFAFA]" />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-medium tracking-[0.26em] text-[#FAFAFA]">ORION</span>
              <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.28em] text-[#888888]">
                Creative Studio
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {routes.map((r) => {
              const active = r.path === current;
              return (
                <button
                  key={r.path}
                  onClick={() => onNavigate(r.path)}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-[13px] tracking-tight transition-colors duration-300 ${
                    active ? "text-[#FAFAFA]" : "text-[#888888] hover:text-[#FAFAFA]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="galaxy-nav-pill"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.06]"
                    />
                  )}
                  <span className="relative">{r.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => onNavigate("/contact")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
              className="hidden rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-[13px] tracking-tight text-[#FAFAFA] backdrop-blur-xl transition-colors duration-300 hover:border-white/25 sm:inline-flex"
            >
              Initiate Discovery
            </motion.button>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#FAFAFA] lg:hidden"
            >
              <Menu className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[#030303]/97 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-20 items-center justify-end px-6 sm:px-10">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#FAFAFA]"
              >
                <X className="size-4" strokeWidth={1.8} />
              </button>
            </div>
            <nav className="px-6 sm:px-10" aria-label="Mobile">
              {routes.map((r, i) => (
                <motion.button
                  key={r.path}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING_SNAP, delay: 0.05 + i * 0.05 }}
                  onClick={() => {
                    onNavigate(r.path);
                    setOpen(false);
                  }}
                  className="flex w-full items-baseline gap-5 border-b border-white/[0.07] py-6 text-left"
                >
                  <MonoLabel>{r.index}</MonoLabel>
                  <span className="text-3xl font-medium tracking-tighter text-[#FAFAFA]">{r.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
