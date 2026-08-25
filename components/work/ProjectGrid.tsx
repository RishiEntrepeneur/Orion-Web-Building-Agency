"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects, SECTORS, type Project, type Sector } from "@/lib/projects";
import { useTilt } from "@/lib/use-tilt";
import { cn } from "@/lib/utils";
import SpotlightCard from "@/components/ui/SpotlightCard";

/**
 * Filterable case-study grid.
 *
 * Filtering is client state rather than a route parameter: the whole list is
 * already on the page, so a round trip would only make it slower — and it would
 * re-run the route transition, flying the camera for what is really a sort.
 */
export default function ProjectGrid() {
  const [sector, setSector] = useState<Sector>("All");

  const counts = useMemo(() => {
    const map = new Map<Sector, number>();
    for (const s of SECTORS) {
      map.set(s, s === "All" ? projects.length : projects.filter((p) => p.sector === s).length);
    }
    return map;
  }, []);

  const visible = useMemo(
    () => (sector === "All" ? projects : projects.filter((p) => p.sector === sector)),
    [sector],
  );

  return (
    <div>
      <div role="group" aria-label="Filter case studies by sector" className="flex flex-wrap items-center gap-2">
        {SECTORS.map((s) => {
          const isActive = s === sector;
          const count = counts.get(s) ?? 0;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              aria-pressed={isActive}
              disabled={count === 0}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                "disabled:cursor-not-allowed disabled:opacity-40",
                isActive
                  ? "border-accent/55 bg-accent/12 text-ink"
                  : "border-edge bg-white/[0.02] text-ink-muted hover:border-accent/35 hover:text-ink",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("size-1.5 rounded-full transition-colors duration-300", isActive ? "bg-accent" : "bg-steel/60")}
              />
              {s}
              <span className="font-mono text-[10px] tabular-nums text-ink-dim">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Announced, not just repainted */}
      <p aria-live="polite" className="mt-5 font-mono text-micro uppercase text-ink-dim">
        Showing {visible.length} of {projects.length} case studies
        {sector !== "All" ? ` in ${sector}` : ""}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const tiltRef = useTilt<HTMLDivElement>({ max: 4, scale: 1.01 });

  return (
    <SpotlightCard as="article" className="h-full">
      <div ref={tiltRef} className="flex h-full flex-col will-change-transform">
        <div className="relative aspect-16/9 w-full overflow-hidden border-b border-edge">
          <ProjectPlate form={project.form} />
          <span className="absolute left-4 top-4 rounded-full border border-edge bg-void/70 px-3 py-1 font-mono text-micro uppercase text-ink-muted backdrop-blur-md">
            {project.sector}
          </span>
          <span className="absolute right-4 top-4 font-mono text-micro uppercase text-ink-dim">{project.year}</span>
        </div>

        <div className="flex grow flex-col p-6 sm:p-7">
          <h3 className="font-display text-h4 font-semibold text-ink">{project.client}</h3>
          <p className="mt-3 grow text-pretty text-sm leading-relaxed text-ink-muted">{project.summary}</p>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-edge pt-5">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">{m.label}</dt>
                <dd className="mt-1 font-display text-lead font-semibold tabular-nums text-accent">{m.value}</dd>
                <dd className="mt-0.5 text-[11px] leading-snug text-ink-dim">{m.note}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {project.stack.map((s) => (
              <span key={s} className="rounded-full border border-edge bg-white/[0.02] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
                {s}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-micro uppercase text-accent">
              Case study
              <ArrowUpRight className="size-3.5" strokeWidth={2.4} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

/** Procedural cover art, keyed to the project's form. Nothing here pretends to
    be a screenshot of real work. */
function ProjectPlate({ form }: { form: Project["form"] }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(150deg,#12151c,#0b0d12)]">
      <div className="absolute inset-0 grid-mesh-fine opacity-30" />
      <svg viewBox="0 0 320 180" className="absolute inset-0 size-full" fill="none">
        {form === "orbit" && (
          <>
            <ellipse cx="160" cy="90" rx="74" ry="26" stroke="var(--accent)" strokeOpacity="0.55" />
            <ellipse cx="160" cy="90" rx="52" ry="52" stroke="var(--accent)" strokeOpacity="0.28" />
            <circle cx="160" cy="90" r="11" fill="var(--accent)" fillOpacity="0.85" />
            <circle cx="234" cy="90" r="4" fill="#fff" />
          </>
        )}
        {form === "grid" &&
          Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={60 + i * 33} y1="34" x2={30 + i * 43} y2="150" stroke="var(--accent)" strokeOpacity={0.16 + i * 0.05} />
          ))}
        {form === "grid" && <rect x="118" y="60" width="84" height="62" stroke="var(--accent)" strokeOpacity="0.7" />}
        {form === "prism" && (
          <>
            <path d="M160 34 226 122 94 122Z" stroke="var(--accent)" strokeOpacity="0.65" />
            <path d="M160 34 160 122M94 122 226 122" stroke="var(--accent)" strokeOpacity="0.25" />
            <circle cx="160" cy="78" r="6" fill="var(--accent)" />
          </>
        )}
        {form === "wave" &&
          Array.from({ length: 5 }).map((_, i) => (
            <path
              key={i}
              d={`M20 ${62 + i * 14} Q 90 ${34 + i * 14} 160 ${62 + i * 14} T 300 ${62 + i * 14}`}
              stroke="var(--accent)"
              strokeOpacity={0.55 - i * 0.09}
            />
          ))}
      </svg>
    </div>
  );
}
