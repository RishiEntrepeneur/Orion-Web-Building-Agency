"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ACCENT_CLASS, ROUTES, routeFor } from "@/lib/routes";
import { site } from "@/lib/site";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import CtaLink from "@/components/ui/CtaLink";
import LogoMark from "@/components/ui/LogoMark";

/**
 * Primary navigation.
 *
 * The route list is rendered as a constellation: each page is a numbered node
 * on a single hairline, and the active one lights in that page's own colour.
 * Because the bar is fixed it sits outside every page's accent scope, so it
 * adopts the active route's accent explicitly.
 */
export default function Navbar() {
  const pathname = usePathname();
  const active = routeFor(pathname);
  const accentClass = ACCENT_CLASS[active.accent];

  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Condensed chrome + per-page reading progress. */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = window.scrollY;
      const track = document.documentElement.scrollHeight - window.innerHeight || 1;
      setScrolled(top > 24);
      setProgress(Math.min(100, Math.max(0, (top / track) * 100)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Close the drawer whenever the route actually changes. */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Drawer: lock scroll (Lenis included), trap focus, close on Escape. */
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();

    const panel = panelRef.current;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((node) => node.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-700",
        accentClass,
      )}
    >
      {/* Reading progress for the current page */}
      <div aria-hidden="true" className="h-px w-full bg-transparent">
        <div
          className="h-px bg-linear-to-r from-transparent via-accent to-accent transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={cn(
          "relative transition-all duration-500 ease-out",
          scrolled
            ? "border-b border-edge/70 bg-abyss/72 backdrop-blur-2xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8 lg:px-10"
        >
          <Link
            href="/"
            className="group/logo relative flex shrink-0 items-center gap-3 rounded-xl py-1 pr-2"
          >
            <LogoMark instanceId="nav" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-bold tracking-[0.24em] text-ink transition-colors duration-300 group-hover/logo:text-accent sm:text-lg">
                {site.name}
              </span>
              <span className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.3em] text-ink-dim sm:block">
                {site.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop: the routes as a constellation of nodes on one line */}
          <ul className="relative hidden items-center gap-1 lg:flex">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent via-edge to-transparent"
            />
            {ROUTES.map((route) => {
              const isActive = route.path === active.path;
              return (
                <li key={route.path} className="relative">
                  <Link
                    href={route.path}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group/nav relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300",
                      isActive ? "text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative size-1.5 shrink-0 rounded-full transition-all duration-500",
                        isActive
                          ? "bg-accent shadow-[0_0_10px_2px_color-mix(in_oklab,var(--accent)_65%,transparent)]"
                          : "bg-steel/60 group-hover/nav:bg-steel",
                      )}
                    />
                    <span className="relative z-10">{route.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <CtaLink
              href="/contact"
              size="sm"
              trailingIcon={<ArrowUpRight className="size-4" strokeWidth={2.4} />}
            >
              Start a Project
            </CtaLink>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex size-11 items-center justify-center rounded-xl border border-edge bg-white/[0.04] text-ink backdrop-blur-md transition-all duration-300 hover:border-accent/60 hover:text-accent lg:hidden"
          >
            {menuOpen ? <X className="size-5" strokeWidth={2} /> : <Menu className="size-5" strokeWidth={2} />}
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div id="mobile-navigation" hidden={!menuOpen} className="lg:hidden">
        <div
          className="fixed inset-0 top-16 z-40 bg-void/80 backdrop-blur-xs sm:top-20"
          onClick={closeMenu}
          aria-hidden="true"
        />
        <div
          ref={panelRef}
          className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] origin-top overflow-y-auto overscroll-contain border-b border-edge bg-abyss/95 px-5 pb-8 pt-6 backdrop-blur-2xl sm:top-20 sm:max-h-[calc(100dvh-5rem)] sm:px-8"
        >
          <ul className="relative flex flex-col gap-1">
            {ROUTES.map((route, index) => {
              const isActive = route.path === active.path;
              return (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    onClick={closeMenu}
                    aria-current={isActive ? "page" : undefined}
                    style={{ animationDelay: `${index * 45}ms` }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-300 animate-rise",
                      isActive
                        ? "border-accent/40 bg-accent/10 text-ink"
                        : "border-transparent text-ink-muted hover:border-edge hover:bg-white/[0.04] hover:text-ink",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full",
                          isActive ? "bg-accent" : "bg-steel/60",
                        )}
                      />
                      {route.label}
                    </span>
                    <span className="font-mono text-xs text-ink-dim">{route.node}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="relative mt-6 flex flex-col gap-3">
            <CtaLink href="/contact" size="md" onClick={closeMenu} className="w-full">
              Start a Project
            </CtaLink>
            <CtaLink
              href={`mailto:${site.email}`}
              variant="ghost"
              size="md"
              onClick={closeMenu}
              className="w-full"
            >
              {site.email}
            </CtaLink>
          </div>
        </div>
      </div>
    </header>
  );
}
