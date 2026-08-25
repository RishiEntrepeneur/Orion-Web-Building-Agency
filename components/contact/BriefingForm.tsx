"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail, RotateCcw } from "lucide-react";
import {
  ADD_ONS,
  PACKAGES,
  estimate,
  gbp,
  type AddOnId,
  type Config,
  type PackageId,
} from "@/lib/estimator";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Project briefing form with a live cost estimate.
 *
 * The estimate reads the same pricing model as the calculator on /pricing, so
 * the two can never disagree about the same configuration.
 *
 * There is no server endpoint in this build. Rather than fake a submission,
 * the form assembles the brief and hands over a prefilled mail draft — which
 * actually works — and says plainly what a production deployment needs.
 */

type Fields = {
  name: string;
  email: string;
  company: string;
  timeline: string;
  detail: string;
};

const TIMELINES = ["As soon as possible", "Within a month", "This quarter", "Just exploring"] as const;

export default function BriefingForm() {
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    company: "",
    timeline: TIMELINES[0],
    detail: "",
  });
  const [config, setConfig] = useState<Config>({
    packageId: "cinematic",
    pages: 5,
    addOns: [],
    withRetainer: true,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);

  const pkg = PACKAGES.find((p) => p.id === config.packageId) ?? PACKAGES[0];
  const result = useMemo(() => estimate(config), [config]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) e.name = "Tell us who you are.";
    if (!fields.email.trim()) e.email = "We need somewhere to reply.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      e.email = "That address does not look right.";
    if (fields.detail.trim().length < 12)
      e.detail = "A sentence or two about the project, please.";
    return e;
  }, [fields]);

  const valid = Object.keys(errors).length === 0;

  const summary = useMemo(() => {
    const lines = [
      `Package: ${pkg.name}`,
      pkg.recurring ? null : `Pages: ${config.pages}`,
      config.addOns.length
        ? `Add-ons: ${config.addOns
            .map((id) => ADD_ONS.find((a) => a.id === id)?.name)
            .filter(Boolean)
            .join(", ")}`
        : "Add-ons: none",
      config.withRetainer && !pkg.recurring ? "Retainer: yes (£49/mo)" : null,
      "",
      result.oneOff > 0
        ? `Estimate: ${gbp(result.oneOff)} one-off (likely ${gbp(result.range[0])}–${gbp(result.range[1])} once scoped)`
        : `Estimate: ${gbp(result.monthly)}/month`,
      result.monthly > 0 && result.oneOff > 0 ? `Then ${gbp(result.monthly)}/month` : null,
      "",
      `Timeline: ${fields.timeline}`,
      `Company: ${fields.company || "—"}`,
      "",
      "Project:",
      fields.detail,
    ];
    return lines.filter((l) => l !== null).join("\n");
  }, [pkg, config, result, fields]);

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
    `Project brief — ${fields.company || fields.name || "new enquiry"}`,
  )}&body=${encodeURIComponent(summary)}`;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, email: true, detail: true });
    if (!valid) return;
    setSent(true);
  };

  const toggleAddOn = (id: AddOnId) =>
    setConfig((c) => ({
      ...c,
      addOns: c.addOns.includes(id) ? c.addOns.filter((a) => a !== id) : [...c.addOns, id],
    }));

  if (sent) {
    return (
      <div className="rounded-3xl border border-accent/35 glass-accent p-7 sm:p-10">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full border border-accent/50 bg-accent/12 text-accent"
        >
          <Check className="size-6" strokeWidth={2.4} />
        </span>
        <h2 className="mt-6 font-display text-h3 font-bold text-ink">Brief assembled.</h2>
        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
          This demonstration build has no server endpoint, so nothing was transmitted. Your brief
          is below and the button opens it as a prefilled email — that part genuinely works.
        </p>

        <pre className="mt-7 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-edge bg-void/60 p-5 font-mono text-[12px] leading-relaxed text-ink-muted">
          {summary}
        </pre>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href={mailto}
            className="metal-chrome inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-sm font-semibold text-void transition-all duration-300 hover:brightness-[1.06]"
          >
            <Mail className="size-4" strokeWidth={2.2} aria-hidden="true" />
            Open In Your Mail App
          </a>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-edge px-7 text-sm font-semibold text-ink-muted transition-all duration-300 hover:border-accent/50 hover:text-ink"
          >
            <RotateCcw className="size-4" strokeWidth={2.2} aria-hidden="true" />
            Edit The Brief
          </button>
        </div>

        <p className="mt-6 border-t border-edge pt-5 font-mono text-micro uppercase text-ink-dim">
          To go live: POST this payload to a route handler at app/api/brief/route.ts
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
      <div className="flex flex-col gap-6">
        <Field
          id="name"
          label="Your name"
          value={fields.name}
          error={touched.name ? errors.name : undefined}
          onChange={(v) => setFields((f) => ({ ...f, name: v }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          autoComplete="name"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={fields.email}
          error={touched.email ? errors.email : undefined}
          onChange={(v) => setFields((f) => ({ ...f, email: v }))}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          autoComplete="email"
        />
        <Field
          id="company"
          label="Company"
          optional
          value={fields.company}
          onChange={(v) => setFields((f) => ({ ...f, company: v }))}
          autoComplete="organization"
        />

        <fieldset>
          <legend className="font-mono text-micro uppercase text-ink-dim">Timeline</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIMELINES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFields((f) => ({ ...f, timeline: t }))}
                aria-pressed={fields.timeline === t}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all duration-300",
                  fields.timeline === t
                    ? "border-accent/55 bg-accent/12 text-ink"
                    : "border-edge bg-white/[0.02] text-ink-muted hover:border-accent/30 hover:text-ink",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-mono text-micro uppercase text-ink-dim">Package</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PACKAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, packageId: p.id as PackageId }))}
                aria-pressed={config.packageId === p.id}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all duration-300",
                  config.packageId === p.id
                    ? "border-accent/55 bg-accent/12 text-ink"
                    : "border-edge bg-white/[0.02] text-ink-muted hover:border-accent/30 hover:text-ink",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-mono text-micro uppercase text-ink-dim">Anything extra</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {ADD_ONS.map((a) => {
              const on = config.addOns.includes(a.id);
              const bundled = a.includedIn.includes(pkg.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAddOn(a.id)}
                  aria-pressed={on}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300",
                    on
                      ? "border-accent/55 bg-accent/12 text-ink"
                      : "border-edge bg-white/[0.02] text-ink-muted hover:border-accent/30 hover:text-ink",
                  )}
                >
                  {a.name}
                  <span className="font-mono text-[11px] tabular-nums text-ink-dim">
                    {bundled ? "inc." : `+${gbp(a.price)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field
          id="detail"
          label="What are you building, and who is it for?"
          value={fields.detail}
          error={touched.detail ? errors.detail : undefined}
          onChange={(v) => setFields((f) => ({ ...f, detail: v }))}
          onBlur={() => setTouched((t) => ({ ...t, detail: true }))}
          multiline
        />
      </div>

      {/* Live estimate */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl border border-accent/30 glass-accent p-6 sm:p-7">
          <h2 className="font-mono text-micro uppercase text-accent">Live estimate</h2>
          <p className="mt-5 flex items-end gap-2">
            <span
              aria-live="polite"
              className="font-display text-[clamp(2.25rem,5vw,3rem)] font-bold leading-none tabular-nums text-ink"
            >
              {result.oneOff > 0 ? gbp(result.oneOff) : gbp(result.monthly)}
            </span>
            {result.oneOff === 0 ? (
              <span className="pb-1 text-base font-medium text-ink-muted">/month</span>
            ) : null}
          </p>
          {result.oneOff > 0 ? (
            <p className="mt-2 font-mono text-micro uppercase text-ink-dim">
              Likely {gbp(result.range[0])} – {gbp(result.range[1])}
            </p>
          ) : null}
          {result.monthly > 0 && result.oneOff > 0 ? (
            <p className="mt-1 font-mono text-micro uppercase text-ink-dim">
              plus {gbp(result.monthly)}/month
            </p>
          ) : null}

          <p className="mt-6 border-t border-edge pt-5 text-xs leading-relaxed text-ink-dim">
            Updates as you change the brief. Excludes VAT. Nothing is charged until the scope is
            approved in writing.
          </p>

          <button
            type="submit"
            className="metal-chrome mt-6 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full text-sm font-semibold text-void transition-all duration-300 hover:brightness-[1.06] disabled:opacity-60"
          >
            Send The Brief
            <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
          </button>

          {!valid && Object.keys(touched).length > 0 ? (
            <p role="alert" className="mt-3 text-center text-xs text-ink-muted">
              A few fields still need filling in.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  multiline,
  optional,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
  multiline?: boolean;
  optional?: boolean;
  autoComplete?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;
  const shared = cn(
    "w-full rounded-2xl border bg-white/[0.02] px-4 py-3.5 text-base text-ink transition-colors duration-300",
    "placeholder:text-ink-dim focus:outline-none focus-visible:border-accent/70",
    error ? "border-nebula/70" : "border-edge hover:border-steel/60",
  );

  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-micro uppercase text-ink-dim">{label}</span>
        {optional ? <span className="font-mono text-[10px] uppercase text-ink-dim">optional</span> : null}
      </label>
      <div className="mt-2.5">
        {multiline ? (
          <textarea
            id={id}
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(shared, "resize-y")}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={shared}
          />
        )}
      </div>
      {error ? (
        <p id={describedBy} role="alert" className="mt-2 text-xs text-nebula">
          {error}
        </p>
      ) : null}
    </div>
  );
}
