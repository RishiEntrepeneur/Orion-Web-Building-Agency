import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  /** Unique suffix for the gradient id — the mark renders more than once per
      document and duplicate ids are invalid HTML. */
  instanceId: string;
};

/**
 * Logo mark: a machined aperture ring around a wireframe solid.
 *
 * Monochrome, lit from the upper left like every other metal surface in the
 * system, so the highlight direction is consistent across the page.
 */
export default function LogoMark({ className, instanceId }: LogoMarkProps) {
  const edge = `orion-edge-${instanceId}`;
  const face = `orion-face-${instanceId}`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center sm:size-11",
        className,
      )}
    >
      <span className="absolute inset-0 rounded-full bg-white/[0.07] blur-md transition-all duration-500 group-hover/logo:bg-white/15" />

      <svg viewBox="0 0 44 44" className="absolute inset-0 size-full" fill="none">
        <defs>
          <linearGradient id={edge} x1="6" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="38%" stopColor="#a9b2c1" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#6f7889" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={face} x1="10" y1="6" x2="34" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#c3cad6" />
            <stop offset="100%" stopColor="#6f7889" />
          </linearGradient>
        </defs>

        {/* Aperture ring, brightest where the light lands */}
        <circle cx="22" cy="22" r="20" stroke={`url(#${edge})`} strokeWidth="1" />
        <circle
          cx="22"
          cy="22"
          r="16.5"
          stroke="#6f7889"
          strokeOpacity="0.35"
          strokeWidth="0.75"
          strokeDasharray="1.5 6"
        />
      </svg>

      <svg viewBox="0 0 32 32" className="relative size-5 sm:size-[22px]" fill="none">
        <path
          d="M16 3 28 10v14L16 31 4 24V10L16 3Z"
          stroke={`url(#${face})`}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M4 10l12 7 12-7M16 17v14"
          stroke={`url(#${face})`}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <circle cx="16" cy="17" r="1.9" fill="#ffffff" />
      </svg>
    </span>
  );
}
