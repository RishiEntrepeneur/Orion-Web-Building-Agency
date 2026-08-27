"use client";

import { useEffect, useState } from "react";

/**
 * A stand-in for `next/navigation`, used only when the site is bundled as a
 * single self-contained page for sharing.
 *
 * The application is a real Next.js app; this exists so the same source can
 * also be handed to someone as one HTML file with no server behind it. Routing
 * falls back to the URL hash, which is the only thing that works from a file
 * or a static host without a rewrite rule.
 */
const read = () => {
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : "/";
};

const subs = new Set<() => void>();
let path = typeof window === "undefined" ? "/" : read();

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    path = read();
    for (const f of subs) f();
  });
}

export function usePathname(): string {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return path;
}

export function useRouter() {
  return {
    push(to: string) {
      window.location.hash = to;
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    },
    replace(to: string) { this.push(to); },
    prefetch() {},
    back() { window.history.back(); },
  };
}
