"use client";

import { MonoLabel } from "./ui";
import type { Route } from "./Nav";

export default function Footer({
  routes,
  onNavigate,
}: {
  routes: Route[];
  onNavigate: (path: string) => void;
}) {
  return (
    <footer className="relative border-t border-white/[0.07] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-5xl font-medium leading-[0.9] tracking-tighter text-[#FAFAFA] sm:text-7xl">
              Let&rsquo;s build
              <br />
              <span className="galaxy-accent-text">something vast.</span>
            </p>
            <MonoLabel className="mt-8" dot>
              Orion // Accepting two builds this quarter
            </MonoLabel>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">
            {routes.map((r) => (
              <button
                key={r.path}
                onClick={() => onNavigate(r.path)}
                className="text-sm tracking-tight text-[#888888] transition-colors duration-300 hover:text-[#FAFAFA]"
              >
                {r.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <MonoLabel>Orion Creative Studio // London</MonoLabel>
          <MonoLabel>System v1.0 &mdash; A demonstration build</MonoLabel>
        </div>
      </div>
    </footer>
  );
}
