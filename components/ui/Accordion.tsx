"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Faq } from "@/lib/faqs";
import { cn } from "@/lib/utils";

/**
 * Single-open disclosure list.
 * Uses a real <button> per row with aria-expanded / aria-controls, and animates
 * height with the grid-template-rows 0fr→1fr technique so no fixed max-height
 * has to be guessed.
 */
export default function Accordion({ items }: { items: readonly Faq[] }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={item.question}
            className={cn(
              "group/faq relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out",
              isOpen
                ? "border-neon-cyan/40 bg-white/[0.045] shadow-[0_24px_70px_-40px_rgba(56,242,255,0.9)]"
                : "border-hairline bg-white/[0.02] hover:border-neon-cyan/25 hover:bg-white/[0.035]",
            )}
          >
            {/* Left accent rail */}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-b from-neon-cyan via-neon-violet to-transparent transition-opacity duration-500",
                isOpen ? "opacity-100" : "opacity-0 group-hover/faq:opacity-50",
              )}
            />

            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition-colors duration-300 sm:px-7 sm:py-6"
              >
                <span
                  className={cn(
                    "text-pretty text-base font-medium leading-snug transition-colors duration-300 sm:text-lg",
                    isOpen ? "text-ink" : "text-ink-muted group-hover/faq:text-ink",
                  )}
                >
                  {item.question}
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                    isOpen
                      ? "rotate-180 border-neon-cyan/50 bg-neon-cyan/12 text-neon-cyan shadow-[0_0_24px_-6px_rgba(56,242,255,0.9)]"
                      : "border-hairline bg-white/[0.04] text-ink-dim group-hover/faq:border-neon-cyan/35 group-hover/faq:text-neon-cyan",
                  )}
                >
                  {isOpen ? (
                    <Minus className="size-4" strokeWidth={2.4} />
                  ) : (
                    <Plus className="size-4" strokeWidth={2.4} />
                  )}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-pretty px-5 pb-6 pr-14 text-sm leading-relaxed text-ink-muted sm:px-7 sm:pb-7 sm:pr-20 sm:text-[15px]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
