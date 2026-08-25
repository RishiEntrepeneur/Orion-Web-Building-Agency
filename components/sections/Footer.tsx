import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { footerColumns, site } from "@/lib/site";
import LogoMark from "@/components/ui/LogoMark";
import CookiePreferencesButton from "@/components/ui/CookiePreferencesButton";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      aria-labelledby="footer-heading"
      className="relative overflow-hidden border-t border-edge bg-abyss/40 px-5 pb-10 pt-20 sm:px-8 sm:pb-12 sm:pt-24 lg:px-10"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer, contact details and legal information
      </h2>

      {/* Ambient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[60rem] max-w-none -translate-x-1/2 translate-y-1/3 bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--accent)_24%,transparent),transparent_70%)] blur-2xl"
      />

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Top: brand + link columns */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10">
          {/* Brand */}
          <div className="group/logo flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <LogoMark instanceId="footer" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold tracking-[0.24em] text-ink">
                  {site.name}
                </span>
                <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-ink-dim">
                  {site.tagline}
                </span>
              </span>
            </div>

            <p className="max-w-sm text-pretty text-sm leading-relaxed text-ink-muted">
              We design and engineer cinematic 3D and AI-driven websites for
              premium brands and ambitious local businesses — briefed, built and
              deployed in 48 hours.
            </p>

            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="group/link inline-flex items-center gap-2.5 text-ink-muted transition-colors duration-300 hover:text-accent"
                >
                  <Mail className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2.5 text-ink-muted transition-colors duration-300 hover:text-accent"
                >
                  <Phone className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-ink-dim">
                <MapPin className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                {site.location}
              </li>
            </ul>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                {column.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <a
                      href={link.href}
                      className="group/foot relative inline-flex text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 left-0 h-px w-0 bg-linear-to-r from-accent to-steel transition-all duration-300 group-hover/foot:w-full"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* UK legal compliance block */}
        <div className="mt-14 rounded-2xl border border-edge bg-white/[0.02] p-6 sm:mt-16 sm:p-7">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dim">
            Company &amp; Compliance
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-ink-dim">Registered entity</dt>
              <dd className="mt-1 text-ink-muted">{site.legal.entity}</dd>
            </div>
            <div>
              <dt className="text-ink-dim">Company number</dt>
              <dd className="mt-1 font-mono text-ink-muted">
                {site.legal.companyNumber}
              </dd>
            </div>
            <div>
              <dt className="text-ink-dim">VAT number</dt>
              <dd className="mt-1 font-mono text-ink-muted">
                {site.legal.vatNumber}
              </dd>
            </div>
            <div>
              <dt className="text-ink-dim">ICO registration</dt>
              <dd className="mt-1 font-mono text-ink-muted">
                {site.legal.icoRegistration}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-ink-dim">Registered office</dt>
              <dd className="mt-1 text-ink-muted">
                {site.legal.registeredOffice}
              </dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-edge pt-5 text-pretty text-xs leading-relaxed text-ink-dim">
            Placeholder details — replace the values in{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
              lib/site.ts
            </code>{" "}
            with your Companies House registration, VAT number and ICO data
            protection registration before going live. Consumer contracts are
            subject to the Consumer Contracts (Information, Cancellation and
            Additional Charges) Regulations 2013; personal data is processed
            under the UK GDPR and the Data Protection Act 2018.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-6 border-t border-edge pt-8 sm:mt-12 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs text-ink-dim">
            © {year} {site.legal.entity}. All rights reserved.
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <li>
              <CookiePreferencesButton />
            </li>
            <li>
              <a
                href="/legal/privacy"
                className="text-sm text-ink-muted transition-colors duration-300 hover:text-accent"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                href="/legal/terms"
                className="text-sm text-ink-muted transition-colors duration-300 hover:text-accent"
              >
                Terms
              </a>
            </li>
          </ul>

          <a
            href="#top"
            className="group/top inline-flex items-center gap-2 self-start rounded-full border border-edge bg-white/[0.03] px-4 py-2 text-xs font-medium text-ink-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/55 hover:text-accent hover:shadow-[0_0_28px_-8px_color-mix(in_oklab,var(--accent)_74%,transparent)] lg:self-auto"
          >
            Back to top
            <ArrowUp
              className="size-3.5 transition-transform duration-300 group-hover/top:-translate-y-0.5"
              strokeWidth={2.4}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
