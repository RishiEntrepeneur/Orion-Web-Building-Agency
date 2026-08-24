/**
 * Fixed, non-interactive atmosphere behind the whole page:
 * grid-mesh overlay, drifting nebula orbs, film grain and a deep vignette.
 * Purely decorative, therefore hidden from assistive technology.
 */
export default function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_82%_at_50%_-12%,#111838_0%,#080b18_46%,#04050a_100%)]" />

      {/* Perspective grid mesh */}
      <div className="absolute inset-0 grid-mesh mask-fade-edges opacity-70 animate-grid-drift" />

      {/* Nebula orbs */}
      <div className="absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-neon-violet/12 blur-[130px] animate-float-slow" />
      <div className="absolute -left-40 top-[38%] size-[34rem] rounded-full bg-neon-cyan/10 blur-[120px] animate-float" />
      <div className="absolute -right-48 top-[62%] size-[38rem] rounded-full bg-neon-magenta/8 blur-[140px] animate-float-slow" />

      {/* Horizon glow line */}
      <div className="absolute left-1/2 top-[86vh] h-px w-[140%] -translate-x-1/2 bg-linear-to-r from-transparent via-neon-cyan/25 to-transparent" />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_50%,transparent_42%,rgba(4,5,10,0.82)_100%)]" />
    </div>
  );
}
