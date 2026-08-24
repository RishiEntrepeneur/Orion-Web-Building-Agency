"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import CtaLink from "@/components/ui/CtaLink";
import LogoMark from "@/components/ui/LogoMark";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Condensed chrome + reading-progress rail --------------------------- */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const track =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      setScrolled(scrollTop > 24);
      setProgress(Math.min(100, Math.max(0, (scrollTop / track) * 100)));
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

  /* Scrollspy ---------------------------------------------------------- */
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* Mobile drawer: lock scroll, trap focus, close on Escape ------------- */
  useEffect(() => {
    if (!menuOpen) return;

    lockScroll();

    const panel = panelRef.current;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
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
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Reading progress rail */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-transparent"
      >
        <div
          className="h-px bg-linear-to-r from-chrome via-steel to-steel shadow-[0_0_12px_rgba(246,248,251,0.56)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={cn(
          "relative transition-all duration-500 ease-out",
          scrolled
            ? "border-b border-edge/70 bg-abyss/72 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_18px_60px_-30px_rgba(246,248,251,0.31)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {/* Cyber edge with travelling highlight */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-chrome/90 to-transparent animate-sheen" />
        </span>

        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8 lg:px-10"
        >
          {/* Floating logo marker */}
          <a
            href="#top"
            className="group/logo relative flex shrink-0 items-center gap-3 rounded-xl py-1 pr-2 transition-transform duration-300 hover:scale-[1.02]"
          >
            <LogoMark instanceId="nav" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-bold tracking-[0.24em] text-ink transition-colors duration-300 group-hover/logo:text-chrome sm:text-lg">
                {site.name}
              </span>
              <span className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.3em] text-ink-dim sm:block">
                {site.tagline}
              </span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = activeId === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group/nav relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                      isActive
                        ? "text-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 rounded-full border transition-all duration-300",
                        isActive
                          ? "border-chrome/35 bg-chrome/[0.07] shadow-[0_0_22px_-6px_rgba(246,248,251,0.50)]"
                          : "border-transparent group-hover/nav:border-edge group-hover/nav:bg-white/[0.04]",
                      )}
                    />
                    <span className="relative z-10">{link.label}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-px left-1/2 h-px -translate-x-1/2 bg-linear-to-r from-transparent via-chrome to-transparent transition-all duration-300",
                        isActive ? "w-3/5" : "w-0 group-hover/nav:w-2/5",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`mailto:${site.email}`}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-chrome"
            >
              {site.email}
            </a>
            <CtaLink
              href="#packages"
              size="sm"
              trailingIcon={<ArrowUpRight className="size-4" strokeWidth={2.4} />}
            >
              Launch Your Site
            </CtaLink>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex size-11 items-center justify-center rounded-xl border border-edge bg-white/[0.04] text-ink backdrop-blur-md transition-all duration-300 hover:border-chrome/60 hover:text-chrome hover:shadow-[0_0_24px_-6px_rgba(246,248,251,0.56)] lg:hidden"
          >
            {menuOpen ? (
              <X className="size-5" strokeWidth={2} />
            ) : (
              <Menu className="size-5" strokeWidth={2} />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-navigation"
        hidden={!menuOpen}
        className="lg:hidden"
      >
        <div
          className="fixed inset-0 top-16 z-40 bg-void/80 backdrop-blur-xs sm:top-20"
          onClick={closeMenu}
          aria-hidden="true"
        />
        <div
          ref={panelRef}
          className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] origin-top overflow-y-auto overscroll-contain border-b border-edge bg-abyss/95 px-5 pb-8 pt-6 backdrop-blur-2xl sm:top-20 sm:max-h-[calc(100dvh-5rem)] sm:px-8">
          <div aria-hidden="true" className="absolute inset-0 grid-mesh-fine-fine opacity-40" />
          <ul className="relative flex flex-col gap-1">
            {navLinks.map((link, index) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  style={{ animationDelay: `${index * 55}ms` }}
                  className="flex items-center justify-between rounded-xl border border-transparent px-4 py-4 text-lg font-medium text-ink-muted transition-all duration-300 animate-rise hover:border-chrome/30 hover:bg-white/[0.04] hover:text-ink"
                >
                  <span>{link.label}</span>
                  <span className="font-mono text-xs text-ink-dim">
                    0{index + 1}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="relative mt-6 flex flex-col gap-3">
            <CtaLink href="#packages" size="md" onClick={closeMenu} className="w-full">
              Launch Your Site
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
