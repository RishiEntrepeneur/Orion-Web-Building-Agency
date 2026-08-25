import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import BriefingForm from "@/components/contact/BriefingForm";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send ORION Studio a project brief and see the estimate update as you write it.",
};

export default function ContactPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Project Briefing"
        title={
          <>
            Tell us what you are building.{" "}
            <span className="accent-text">See the price as you type.</span>
          </>
        }
        lede="No discovery call to book a discovery call. Fill this in, watch the estimate move, and we reply the same working day."
      />

      <section className="relative px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <BriefingForm />
          </Reveal>
        </div>
      </section>

      <section className="relative px-5 pb-28 sm:px-8 lg:px-10 lg:pb-36">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <ul className="grid grid-cols-1 gap-5 border-t border-edge pt-10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
                { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s+/g, "")}` },
                { icon: MapPin, label: "Studio", value: site.location },
                { icon: Clock3, label: "Reply time", value: "Same working day" },
              ].map((item) => (
                <li key={item.label} className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 font-mono text-micro uppercase text-ink-dim">
                    <item.icon className="size-3.5 text-accent" strokeWidth={2} aria-hidden="true" />
                    {item.label}
                  </span>
                  {item.href ? (
                    <a href={item.href} className="text-base text-ink transition-colors duration-300 hover:text-accent">
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-base text-ink">{item.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
