"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ACCENT_CLASS, routeFor } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Applies the active route's accent to everything inside it.
 *
 * Pages do not set their own colour — the route registry decides, in one place,
 * and every descendant inherits it through the `--accent` custom property. That
 * keeps a page's colour identity and its position in the 3D scene defined
 * together rather than in two files that can drift.
 */
export default function RouteAccentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = routeFor(pathname);

  return (
    <div
      data-route={route.path}
      className={cn("contents", ACCENT_CLASS[route.accent])}
    >
      {children}
    </div>
  );
}
