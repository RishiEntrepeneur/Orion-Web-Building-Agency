"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMagnetic } from "@/lib/use-magnetic";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type CtaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
};

const sizeStyles: Record<Size, string> = {
  sm: "h-10 px-5 text-[13px] gap-2",
  md: "h-12 px-7 text-sm gap-2.5",
  lg: "h-14 px-8 text-[15px] gap-3 sm:h-16 sm:px-10 sm:text-base",
};

/**
 * Primary call to action.
 *
 * Three metals rather than three colours:
 *   primary   — polished chrome plate carrying dark ink
 *   secondary — machined raised control, bright bevel above, dark underside
 *   ghost     — a hairline etched into the surface
 *
 * Every variant is magnetic: the control leans toward the cursor and its label
 * leans a little further, and the specular sweep tracks the same `--magnet`
 * proximity value so the highlight rakes across as the pointer approaches.
 */
export default function CtaLink({
  href,
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  children,
  className,
  ...rest
}: CtaLinkProps) {
  const { hostRef, labelRef } = useMagnetic<HTMLAnchorElement>({
    radius: variant === "primary" ? 140 : 110,
    pull: variant === "primary" ? 13 : 9,
    labelPull: variant === "primary" ? 22 : 15,
  });

  const variantStyles: Record<Variant, string> = {
    primary: cn(
      "metal-chrome font-semibold text-void",
      "hover:brightness-[1.06]",
    ),
    secondary: cn(
      "metal-control border border-edge text-ink",
      "hover:border-steel/70",
    ),
    ghost: cn(
      "border border-edge bg-white/[0.015] text-ink-muted backdrop-blur-sm",
      "hover:border-steel/60 hover:bg-white/[0.05] hover:text-ink",
    ),
  };

  return (
    <a
      ref={hostRef}
      href={href}
      className={cn(
        "group/cta relative inline-flex items-center justify-center overflow-hidden rounded-full tracking-tight",
        "transition-[filter,background-color,border-color,box-shadow] duration-300 ease-out will-change-transform",
        "active:scale-[0.985]",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...rest}
    >
      {/* Raking specular tied to pointer proximity, not to hover state, so the
          highlight builds as the cursor approaches rather than snapping on. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[calc(var(--magnet,0)*0.85)] transition-opacity duration-200"
        style={{
          background:
            variant === "primary"
              ? "linear-gradient(112deg, transparent 20%, rgba(255,255,255,0.85) 46%, rgba(255,255,255,0.2) 58%, transparent 76%)"
              : "linear-gradient(112deg, transparent 22%, rgba(255,255,255,0.16) 48%, transparent 74%)",
        }}
      />
      {/* Travelling sheen on hover, for the moment of commitment. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-[900ms] ease-out group-hover/cta:translate-x-full"
      />

      <span ref={labelRef} className="relative z-10 flex items-center will-change-transform"
            style={{ gap: "inherit" }}>
        {leadingIcon ? (
          <span aria-hidden="true" className="flex shrink-0">
            {leadingIcon}
          </span>
        ) : null}
        <span className="whitespace-nowrap">{children}</span>
        {trailingIcon ? (
          <span
            aria-hidden="true"
            className="flex shrink-0 transition-transform duration-300 group-hover/cta:translate-x-1"
          >
            {trailingIcon}
          </span>
        ) : null}
      </span>
    </a>
  );
}
