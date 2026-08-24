import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
  /** Renders as <h1> when this heading opens the document. */
  as?: "h2" | "h3";
};

/** Shared section header: neon eyebrow chip, display title, supporting copy. */
export default function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = "center",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Reveal>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-chrome/25 bg-chrome/[0.06] px-4 py-1.5",
            "font-mono text-[11px] uppercase tracking-[0.22em] text-chrome",
            "shadow-[0_0_24px_-6px_rgba(246,248,251,0.34)] backdrop-blur-sm",
          )}
        >
          {eyebrowIcon ? (
            <span aria-hidden="true" className="flex shrink-0">
              {eyebrowIcon}
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-chrome animate-breathe"
            />
          )}
          {eyebrow}
        </span>
      </Reveal>

      <Reveal delay={90}>
        <Heading
          className={cn(
            "mt-6 text-balance font-semibold leading-[1.05] text-ink",
            "text-[clamp(2rem,5.2vw,3.6rem)]",
            centered ? "mx-auto max-w-4xl" : "max-w-3xl",
          )}
        >
          {title}
        </Heading>
      </Reveal>

      {description ? (
        <Reveal delay={170}>
          <p
            className={cn(
              "mt-5 text-pretty text-base leading-relaxed text-ink-muted sm:text-lg",
              centered ? "mx-auto max-w-2xl" : "max-w-2xl",
            )}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
