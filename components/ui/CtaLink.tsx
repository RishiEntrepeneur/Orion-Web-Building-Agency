import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  sm: "h-10 px-4 text-[13px] gap-1.5",
  md: "h-12 px-6 text-sm gap-2",
  lg: "h-14 px-7 text-[15px] gap-2.5 sm:h-16 sm:px-9 sm:text-base",
};

const variantStyles: Record<Variant, string> = {
  primary: cn(
    "text-void",
    "bg-linear-to-r from-neon-cyan via-[#7ee8ff] to-neon-violet",
    "shadow-[0_0_0_1px_rgba(56,242,255,0.55),0_10px_36px_-8px_rgba(56,242,255,0.65)]",
    "hover:shadow-[0_0_0_1px_rgba(56,242,255,0.9),0_18px_54px_-8px_rgba(56,242,255,0.85)]",
    "hover:brightness-110",
  ),
  secondary: cn(
    "text-ink border border-neon-violet/40 bg-white/[0.035] backdrop-blur-md",
    "shadow-[0_0_0_1px_rgba(139,92,246,0.12),0_8px_30px_-12px_rgba(139,92,246,0.55)]",
    "hover:border-neon-violet/80 hover:bg-white/[0.07]",
    "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_16px_44px_-12px_rgba(139,92,246,0.8)]",
  ),
  ghost: cn(
    "text-ink-muted border border-hairline/80 bg-transparent",
    "hover:text-ink hover:border-neon-cyan/50 hover:bg-white/[0.04]",
  ),
};

/**
 * Primary call-to-action anchor with an animated specular sweep on hover.
 * Rendered as a plain <a> so it works for in-page jumps, mailto and tel links.
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
  return (
    <a
      href={href}
      className={cn(
        "group/cta relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold tracking-tight",
        "transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...rest}
    >
      {/* Specular sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
      />
      {leadingIcon ? (
        <span aria-hidden="true" className="relative z-10 flex shrink-0">
          {leadingIcon}
        </span>
      ) : null}
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      {trailingIcon ? (
        <span
          aria-hidden="true"
          className="relative z-10 flex shrink-0 transition-transform duration-300 group-hover/cta:translate-x-1"
        >
          {trailingIcon}
        </span>
      ) : null}
    </a>
  );
}
