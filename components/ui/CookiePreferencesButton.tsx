"use client";

import { SlidersHorizontal } from "lucide-react";
import { COOKIE_PREFERENCES_EVENT } from "@/components/CookieConsent";

/** Re-opens the cookie control panel from anywhere on the page. */
export default function CookiePreferencesButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT))
      }
      className={
        className ??
        "inline-flex items-center gap-2 text-sm text-ink-muted transition-colors duration-300 hover:text-chrome"
      }
    >
      <SlidersHorizontal className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
      Cookie Settings
    </button>
  );
}
