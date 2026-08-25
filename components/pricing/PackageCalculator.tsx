"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import {
  ADD_ONS,
  PACKAGES,
  PAGE_RATE,
  estimate,
  gbp,
  type AddOnId,
  type Config,
  type PackageId,
} from "@/lib/estimator";
import { cn } from "@/lib/utils";
import CtaLink from "@/components/ui/CtaLink";

/**
 * Interactive package calculator.
 *
 * Everything recomputes locally from one shared pricing model, so the number
 * moves the instant a control does — a quote that needs a round trip stops
 * being a thinking tool and becomes a form.
 *
 * Add-ons already bundled into the selected package are shown as included
 * rather than hidden, so the value of moving up a tier is visible instead of
 * having to be explained.
 */
export default function PackageCalculator() {
  const [config, setConfig] = useState<Config>({
    packageId: "cinematic",
    pages: 5,
    addOns: ["customScene"],
    withRetainer: true,
  });

  const pkg = PACKAGES.find((p) => p.id === config.packageId) ?? PACKAGES[0];
  const result = useMemo(() => estimate(config), [config]);

  const setPackage = (packageId: PackageId) => {
    const next = PACKAGES.find((p) => p.id === packageId);
    setConfig((c) => ({
      ...c,
      packageId,
      // Snap the page count into the new package's sensible range.
      pages: next ? Math.max(next.includedPages, Math.min(c.pages, 12)) : c.pages,
    }));
  };

  const toggleAddOn = (id: AddOnId) =>
    setConfig((c) => ({
      ...c,
      addOns: c.addOns.includes(id) ? c.addOns.filter((a) => a !== id) : [...c.addOns, id],
    }));

  const setPages = (delta: number) =>
    setConfig((c) => ({ ...c, pages: Math.max(pkg.includedPages, Math.min(12, c.pages + delta)) }));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      {/* ---------------- Controls ---------------- */}
      <div className="flex flex-col gap-8">
        <fieldset>
          <legend className="font-mono text-micro uppercase text-ink-dim">1 · Package</legend>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PACKAGES.map((p) => {
              const active = p.id === config.packageId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPackage(p.id)}
                  aria-pressed={active}
                  className={cn(
                    "group/pk relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-300",
                    active
                      ? "border-accent/55 bg-accent/10"
                      : "border-edge bg-white/[0.02] hover:border-accent/30 hover:bg-white/[0.04]",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-semibold text-ink">{p.name}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                        active ? "border-accent bg-accent text-void" : "border-steel/70",
                      )}
                    >
                      {active ? <Check className="size-2.5" strokeWidth={4} /> : null}
                    </span>
                  </span>
                  <span className="mt-2 font-display text-h4 font-bold tabular-nums text-ink">
                    {gbp(p.base)}
                    {p.recurring ? <span className="text-sm font-medium text-ink-muted">/mo</span> : null}
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-ink-dim">{p.blurb}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {!pkg.recurring && (
          <fieldset>
            <legend className="font-mono text-micro uppercase text-ink-dim">2 · Pages</legend>
            <div className="mt-4 flex items-center gap-5 rounded-2xl border border-edge bg-white/[0.02] p-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPages(-1)}
                  disabled={config.pages <= pkg.includedPages}
                  aria-label="Remove a page"
                  className="flex size-10 items-center justify-center rounded-full border border-edge text-ink transition-all duration-300 hover:border-accent/50 hover:text-accent disabled:opacity-35"
                >
                  <Minus className="size-4" strokeWidth={2.4} />
                </button>
                <span
                  aria-live="polite"
                  className="w-10 text-center font-display text-h4 font-bold tabular-nums text-ink"
                >
                  {config.pages}
                </span>
                <button
                  type="button"
                  onClick={() => setPages(1)}
                  disabled={config.pages >= 12}
                  aria-label="Add a page"
                  className="flex size-10 items-center justify-center rounded-full border border-edge text-ink transition-all duration-300 hover:border-accent/50 hover:text-accent disabled:opacity-35"
                >
                  <Plus className="size-4" strokeWidth={2.4} />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-ink-dim">
                {pkg.includedPages} included with {pkg.name}.
                {result.pages.charged > 0
                  ? ` ${result.pages.charged} extra at ${gbp(PAGE_RATE)} each.`
                  : " No extra pages selected."}
              </p>
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="font-mono text-micro uppercase text-ink-dim">
            {pkg.recurring ? "2" : "3"} · Add-ons
          </legend>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ADD_ONS.map((a) => {
              const selected = config.addOns.includes(a.id);
              const bundled = a.includedIn.includes(pkg.id);
              return (
                <label
                  key={a.id}
                  className={cn(
                    "group/add relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-300",
                    selected
                      ? "border-accent/50 bg-accent/[0.08]"
                      : "border-edge bg-white/[0.02] hover:border-accent/25",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleAddOn(a.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-300",
                      "peer-focus-visible:shadow-[0_0_0_2px_var(--color-void),0_0_0_4px_var(--accent)]",
                      selected ? "border-accent bg-accent text-void" : "border-steel/70",
                    )}
                  >
                    {selected ? <Check className="size-3" strokeWidth={4} /> : null}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-medium text-ink">{a.name}</span>
                      <span
                        className={cn(
                          "font-mono text-[11px] tabular-nums",
                          bundled ? "text-accent" : "text-ink-dim",
                        )}
                      >
                        {bundled ? "included" : `+${gbp(a.price)}`}
                      </span>
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-ink-dim">{a.note}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {!pkg.recurring && (
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-edge bg-white/[0.02] p-4 transition-colors duration-300 hover:border-accent/25">
            <input
              type="checkbox"
              checked={config.withRetainer}
              onChange={() => setConfig((c) => ({ ...c, withRetainer: !c.withRetainer }))}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-300",
                "peer-focus-visible:shadow-[0_0_0_2px_var(--color-void),0_0_0_4px_var(--accent)]",
                config.withRetainer ? "border-accent bg-accent text-void" : "border-steel/70",
              )}
            >
              {config.withRetainer ? <Check className="size-3" strokeWidth={4} /> : null}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">
                Add the Infinite Horizon Retainer
              </span>
              <span className="mt-1 text-xs leading-relaxed text-ink-dim">
                {gbp(49)}/month, rolling. Hosting, patches, monitoring and structural updates.
              </span>
            </span>
          </label>
        )}
      </div>

      {/* ---------------- Running total ---------------- */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl border border-accent/30 glass-accent p-6 sm:p-7">
          <h3 className="font-mono text-micro uppercase text-accent">Your estimate</h3>

          <p className="mt-5 flex items-end gap-2">
            <span
              className="font-display text-[clamp(2.5rem,6vw,3.5rem)] font-bold leading-none tabular-nums text-ink"
              aria-live="polite"
            >
              {result.oneOff > 0 ? gbp(result.oneOff) : gbp(result.monthly)}
            </span>
            {result.oneOff === 0 ? (
              <span className="pb-1.5 text-base font-medium text-ink-muted">/month</span>
            ) : null}
          </p>

          {result.oneOff > 0 ? (
            <p className="mt-2 font-mono text-micro uppercase text-ink-dim">
              Likely {gbp(result.range[0])} – {gbp(result.range[1])} once scoped
            </p>
          ) : null}

          <dl className="mt-6 flex flex-col gap-2.5 border-t border-edge pt-5 text-sm">
            {result.base > 0 ? (
              <Row label={pkg.name} value={gbp(result.base)} />
            ) : (
              <Row label={pkg.name} value={`${gbp(pkg.base)}/mo`} />
            )}

            {result.pages.charged > 0 ? (
              <Row
                label={`${result.pages.charged} extra page${result.pages.charged > 1 ? "s" : ""}`}
                value={gbp(result.pages.cost)}
              />
            ) : null}

            {result.addOns.map((a) => (
              <Row
                key={a.id}
                label={a.name}
                value={a.bundled ? "included" : gbp(a.cost)}
                muted={a.bundled}
              />
            ))}

            {result.monthly > 0 && result.oneOff > 0 ? (
              <Row label="Retainer" value={`${gbp(result.monthly)}/mo`} muted />
            ) : null}
          </dl>

          <div className="mt-6 border-t border-edge pt-5">
            <CtaLink
              href="/contact"
              size="md"
              className="w-full"
              trailingIcon={<ArrowRight className="size-4" strokeWidth={2.4} />}
            >
              Send This Brief
            </CtaLink>
            <p className="mt-3.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
              Excludes VAT · no deposit until approved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn("text-ink-muted", muted && "text-ink-dim")}>{label}</dt>
      <dd
        className={cn(
          "shrink-0 font-mono text-[13px] tabular-nums",
          muted ? "text-accent" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
