"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Stagger in milliseconds applied once the element enters the viewport. */
  delay?: number;
  className?: string;
  /* Deliberately a narrow union rather than React's ElementType.
     @react-three/fiber augments the global JSX namespace with every three.js
     object, which widens ElementType far enough that TypeScript can no longer
     resolve props for a polymorphic tag and falls back to `never`. */
  as?: "div" | "li" | "section" | "article" | "span";
  /** How much of the element must be visible before revealing (0–1). */
  threshold?: number;
};

/**
 * Scroll-triggered entrance animation.
 * Uses IntersectionObserver (no animation library), reveals once, and falls
 * back to instantly-visible content when the API is unavailable or the user
 * has requested reduced motion (handled in globals.css).
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  threshold = 0.16,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}
