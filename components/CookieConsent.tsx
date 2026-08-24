"use client";

import { useCallback, useEffect, useState } from "react";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { COOKIE_CONSENT_KEY } from "@/lib/site";
import { cn } from "@/lib/utils";

export const COOKIE_PREFERENCES_EVENT = "aurex:open-cookie-preferences";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    /* Private mode / storage disabled — treat as "not yet decided". */
    return null;
  }
}

function writeConsent(consent: Consent) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  } catch {
    /* Storage unavailable — the banner simply reappears next visit. */
  }
}

/**
 * UK/EU-style cookie control.
 * Non-essential cookies stay off until the visitor opts in, "Reject" is given
 * the same visual weight as "Accept", and the choice can be reopened at any
 * time from the footer via a custom DOM event.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readConsent();
    if (stored) {
      setAnalytics(Boolean(stored.analytics));
      setMarketing(Boolean(stored.marketing));
    } else {
      setVisible(true);
    }

    const open = () => {
      const current = readConsent();
      setAnalytics(Boolean(current?.analytics));
      setMarketing(Boolean(current?.marketing));
      setVisible(true);
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, open);
  }, []);

  const decide = useCallback((next: { analytics: boolean; marketing: boolean }) => {
    writeConsent({
      essential: true,
      analytics: next.analytics,
      marketing: next.marketing,
      decidedAt: new Date().toISOString(),
    });
    setAnalytics(next.analytics);
    setMarketing(next.marketing);
    setVisible(false);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-3 bottom-3 z-[60] max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-h-[calc(100dvh-3rem)] sm:max-w-md"
    >
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-abyss/95 p-5 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neon-cyan/70 to-transparent"
        />

        <button
          type="button"
          onClick={() => decide({ analytics: false, marketing: false })}
          aria-label="Dismiss and reject non-essential cookies"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg border border-transparent text-ink-dim transition-all duration-300 hover:border-hairline hover:text-ink"
        >
          <X className="size-4" strokeWidth={2.2} />
        </button>

        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan"
          >
            <Cookie className="size-5" strokeWidth={1.9} />
          </span>
          <div className="pr-6">
            <h2
              id="cookie-consent-title"
              className="text-sm font-semibold text-ink sm:text-base"
            >
              Cookie preferences
            </h2>
            <p
              id="cookie-consent-description"
              className="mt-1.5 text-pretty text-[13px] leading-relaxed text-ink-muted"
            >
              We use strictly necessary cookies to run this site. Analytics and
              marketing cookies stay switched off until you allow them, in line
              with UK GDPR and PECR.
            </p>
          </div>
        </div>

        {/* Granular toggles */}
        <div className="mt-5 flex flex-col gap-2.5">
          <ConsentRow
            label="Strictly necessary"
            description="Security, routing and form submission. Always on."
            checked
            locked
          />
          <ConsentRow
            label="Analytics"
            description="Anonymous page and scroll-depth statistics."
            checked={analytics}
            onChange={setAnalytics}
          />
          <ConsentRow
            label="Marketing"
            description="Measuring which campaigns bring enquiries."
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => decide({ analytics: true, marketing: true })}
            className="h-11 flex-1 rounded-xl bg-linear-to-r from-neon-cyan to-neon-violet text-sm font-semibold text-void transition-all duration-300 hover:brightness-110 hover:shadow-[0_10px_36px_-10px_rgba(56,242,255,0.9)]"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => decide({ analytics: false, marketing: false })}
            className="h-11 flex-1 rounded-xl border border-hairline bg-white/[0.04] text-sm font-semibold text-ink transition-all duration-300 hover:border-neon-cyan/45 hover:bg-white/[0.08]"
          >
            Reject non-essential
          </button>
        </div>

        <button
          type="button"
          onClick={() => decide({ analytics, marketing })}
          className="mt-2.5 h-11 w-full rounded-xl border border-transparent text-[13px] font-medium text-ink-muted transition-colors duration-300 hover:text-neon-cyan"
        >
          Save my selection
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
          <ShieldCheck className="size-3" strokeWidth={2.4} aria-hidden="true" />
          Stored locally · never sold
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ConsentRow({
  label,
  description,
  checked,
  locked = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-xl border border-hairline/70 bg-white/[0.02] px-3.5 py-3 transition-colors duration-300",
        locked ? "cursor-default opacity-80" : "cursor-pointer hover:border-neon-cyan/30",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-all duration-300",
          /* The real <input> is sr-only, so keyboard focus has to be painted
             on this proxy or the control is invisible to keyboard users. */
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neon-cyan",
          checked
            ? "border-neon-cyan/60 bg-neon-cyan/25"
            : "border-hairline bg-white/[0.05]",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full transition-all duration-300",
            checked
              ? "left-[1.15rem] bg-neon-cyan shadow-[0_0_12px_rgba(56,242,255,1)]"
              : "left-0.5 bg-ink-dim",
          )}
        />
      </span>
      <span className="flex flex-col">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="text-[12px] leading-snug text-ink-dim">{description}</span>
      </span>
    </label>
  );
}
