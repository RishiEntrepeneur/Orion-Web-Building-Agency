"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

/** `next/link` stand-in for the single-file build. See ./navigation.ts. */
export default function Link({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...rest}
      href={`#${href}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })}
    >
      {children}
    </a>
  );
}
