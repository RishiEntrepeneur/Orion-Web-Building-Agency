import type { Metadata } from "next";
import { Compass, Gauge, Ruler, ShieldCheck } from "lucide-react";
import Process from "@/components/sections/Process";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";

export const metadata: Metadata = {
  title: "About",
  description:
    "The engineering philosophy behind ORION Studio, the team, and why the studio is named after the constellation.",
};

const principles = [
  {
    icon: Gauge,
    title: "Fast is a feature, not a phase",
    body: "A performance budget is agreed before the first commit and measured before launch. If a scene cannot meet it, the scene changes — not the budget.",
  },
  {
    icon: Ruler,
    title: "Scope is fixed so quality is not",
    body: "Open-ended projects negotiate quality away under deadline. Productised scope means the only variable left is how well the thing is built.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible by construction",
    body: "Reduced-motion, keyboard operation and contrast are designed at the same time as the effect, not retrofitted after a report comes back.",
  },
  {
    icon: Compass,
    title: "You own everything",
    body: "Source, scenes, pipeline. No proprietary editor lock-in and no per-view licensing. If you leave, you leave with the whole thing.",
  },
] as const;

const team = [
  { name: "Rhea Alderton", role: "Principal Engineer", focus: "WebGL · shaders · performance" },
  { name: "Idris Vance", role: "Design Director", focus: "Art direction · motion · type" },
  { name: "Noor Habib", role: "Full-Stack Engineer", focus: "Next.js · CMS · integrations" },
  { name: "Tomas Vrba", role: "Conversion Strategist", focus: "Offer positioning · analytics" },
] as const;

const BELT = [
  { star: "Alnitak", meaning: "The build", body: "The engineering that has to hold weight." },
  { star: "Alnilam", meaning: "The idea", body: "Brightest of the three, and the one people remember." },
  { star: "Mintaka", meaning: "The proof", body: "The measurement that says whether it worked." },
] as const;

export default function AboutPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="The Studio"
        title={
          <>
            Four people, one standard, and a{" "}
            <span className="accent-text">very short list</span> of things we do.
          </>
        }
        lede="ORION Studio is small on purpose. Everyone who sells the work also builds it, which is the only reliable way to keep a promise about a deadline."
        meta={[
          { label: "Founded", value: "2023" },
          { label: "Team", value: "4" },
          { label: "Based", value: "London" },
        ]}
      />

      {/* Brand story */}
      <section aria-labelledby="story-heading" className="relative px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <SpotlightCard className="grid grid-cols-1 gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <div>
                <h2 id="story-heading" className="font-display text-h2 font-bold text-ink">
                  Why the belt.
                </h2>
                <p className="mt-6 text-pretty text-lead leading-relaxed text-ink-muted">
                  Orion is the one constellation almost everyone can find. Not because it is the
                  brightest patch of sky, but because three stars sit in a row at almost even
                  spacing — a pattern the eye locks onto before the brain has named it.
                </p>
                <p className="mt-5 text-pretty text-sm leading-relaxed text-ink-dim">
                  That is the whole ambition for a website. Not more elements, more colour or more
                  motion — one arrangement so clear that a visitor recognises what you do before
                  they have consciously read anything. The three stars in our mark are Alnitak,
                  Alnilam and Mintaka, at their true relative spacing and brightness. Alnilam, the
                  middle one, is the brightest and sits fractionally off centre. Getting that
                  slightly-wrong-looking detail right is what makes the mark read as Orion instead
                  of as three dots.
                </p>
              </div>

              <ul className="flex flex-col gap-4">
                {BELT.map((b, i) => (
                  <li
                    key={b.star}
                    className="flex items-start gap-5 rounded-2xl border border-edge bg-white/[0.02] p-5"
                  >
                    <span
                      aria-hidden="true"
                      className="relative mt-1 flex size-3 shrink-0 items-center justify-center"
                    >
                      <span
                        className="absolute size-3 rounded-full bg-accent"
                        style={{ opacity: [0.72, 1, 0.82][i] }}
                      />
                      <span className="absolute size-7 rounded-full bg-accent/20 blur-md" />
                    </span>
                    <span className="flex flex-col">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-display text-h4 font-semibold text-ink">{b.star}</span>
                        <span className="font-mono text-micro uppercase text-accent">{b.meaning}</span>
                      </span>
                      <span className="mt-2 text-sm leading-relaxed text-ink-muted">{b.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      {/* Philosophy */}
      <section aria-labelledby="philosophy-heading" className="relative px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <h2 id="philosophy-heading" className="font-display text-h2 font-bold text-ink">
              Engineering philosophy
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <SpotlightCard as="article" className="flex h-full flex-col p-6 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-white/[0.04] text-accent"
                  >
                    <p.icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-5 text-h4 font-semibold leading-snug text-ink">{p.title}</h3>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-muted">{p.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section aria-labelledby="team-heading" className="relative px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <h2 id="team-heading" className="font-display text-h2 font-bold text-ink">
              The four
            </h2>
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 60} as="li">
                <SpotlightCard className="flex h-full flex-col p-6">
                  <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full border border-accent/35 bg-accent/10 font-display text-lead font-bold text-accent"
                  >
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <h3 className="mt-5 font-display text-lead font-semibold text-ink">{member.name}</h3>
                  <p className="mt-1.5 font-mono text-micro uppercase text-accent">{member.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim">{member.focus}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={120}>
            <p className="mt-8 font-mono text-micro uppercase text-ink-dim">
              Sample team — replace in app/about/page.tsx before publishing.
            </p>
          </Reveal>
        </div>
      </section>

      <Process />
    </main>
  );
}
