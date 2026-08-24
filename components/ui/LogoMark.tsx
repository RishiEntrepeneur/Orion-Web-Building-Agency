import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  /**
   * Unique suffix for the SVG gradient id. Required because the mark is
   * rendered more than once per document and duplicate ids are invalid HTML
   * (and make one instance reference the wrong gradient).
   */
  instanceId: string;
};

/**
 * Floating logo marker — a wireframe cube suspended inside two counter-rotating
 * orbital rings. Decorative; the wordmark beside it carries the accessible name.
 */
export default function LogoMark({ className, instanceId }: LogoMarkProps) {
  const gradientId = `aurex-mark-${instanceId}`;
  return (
    <span
      aria-hidden="true"
      className={cn("relative flex size-10 shrink-0 items-center justify-center sm:size-11", className)}
    >
      {/* Ambient bloom */}
      <span className="absolute inset-0 rounded-full bg-neon-cyan/25 blur-lg transition-all duration-500 group-hover/logo:bg-neon-cyan/45 group-hover/logo:blur-xl" />

      {/* Outer orbital ring */}
      <svg
        viewBox="0 0 44 44"
        className="absolute inset-0 size-full animate-spin-slow text-neon-cyan/50"
        fill="none"
      >
        <circle
          cx="22"
          cy="22"
          r="20"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
      </svg>

      {/* Inner counter-rotating ring */}
      <svg
        viewBox="0 0 44 44"
        className="absolute inset-0 size-full animate-spin-reverse text-neon-violet/60"
        fill="none"
      >
        <circle
          cx="22"
          cy="22"
          r="15"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
      </svg>

      {/* Wireframe cube */}
      <svg
        viewBox="0 0 32 32"
        className="relative size-5 sm:size-[22px] animate-float"
        fill="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38f2ff" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ff2fb3" />
          </linearGradient>
        </defs>
        <path
          d="M16 2 29 9.5v13L16 30 3 22.5v-13L16 2Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M3 9.5 16 17l13-7.5M16 17v13"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.75"
        />
        <circle cx="16" cy="17" r="2.1" fill="#38f2ff" />
      </svg>
    </span>
  );
}
