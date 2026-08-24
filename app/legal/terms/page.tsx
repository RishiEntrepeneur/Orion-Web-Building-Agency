import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms on which ${site.legal.entity} supplies website design, 3D and AI development services.`,
  robots: { index: true, follow: true },
};

const sections: readonly LegalSection[] = [
  {
    heading: "1. These terms",
    body: [
      `These terms govern the supply of design, 3D and development services by ${site.legal.entity} (company number ${site.legal.companyNumber}). By commissioning a package you accept them.`,
      "Nothing in these terms limits your statutory rights. Where you contract as a consumer rather than a business, the Consumer Rights Act 2015 applies in addition to the terms below.",
    ],
  },
  {
    heading: "2. Packages, scope and price",
    body: [
      "Each package has a fixed scope and a fixed price, stated on the website at the time of order. Work outside that scope is quoted separately and only begins once you approve it in writing.",
      "Prices are shown in pounds sterling and exclude VAT where applicable. Recurring retainer fees are billed monthly in advance and may be cancelled with 30 days' notice.",
    ],
  },
  {
    heading: "3. The 48-hour build window",
    body: [
      "The 48-hour delivery window starts when we confirm in writing that your completed brief is approved, not when you first make contact. It is measured in consecutive working hours and depends on you supplying required assets and responding to review requests promptly.",
      "If we fail to deliver a live site within that window for reasons within our control, the project fee is refunded in full. The refund is your sole remedy for late delivery.",
    ],
  },
  {
    heading: "4. Your responsibilities",
    body: [
      "You confirm that any brand assets, imagery, copy or trade marks you supply are yours to use, and you indemnify us against third-party claims arising from material you provide.",
      "You are responsible for the accuracy of business information published on your site, including prices, availability and any regulated claims.",
    ],
  },
  {
    heading: "5. Intellectual property",
    body: [
      "On receipt of payment in full, ownership of the delivered website, source code and 3D scene files transfers to you.",
      "We retain ownership of our pre-existing tooling, component libraries and generation pipelines, and grant you a perpetual, non-exclusive licence to use them as embedded in your delivered site.",
      "Unless you ask us in writing not to, we may display the finished work in our portfolio.",
    ],
  },
  {
    heading: "6. Cancellation and consumer rights",
    body: [
      "Where you contract as a consumer, you have 14 days to cancel under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013. If you ask us to begin work within that period, you may be charged for work already carried out.",
      "Business clients may cancel before production starts for a full refund; once scene generation has begun, the fee becomes non-refundable except under the delivery guarantee in section 3.",
    ],
  },
  {
    heading: "7. Liability",
    body: [
      "We do not exclude liability for death or personal injury caused by negligence, for fraud, or for any liability that cannot lawfully be excluded.",
      "Subject to that, our total liability in connection with a project is limited to the fees you paid for it, and we are not liable for loss of profit, loss of business or any indirect or consequential loss.",
    ],
  },
  {
    heading: "8. Governing law",
    body: [
      "These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction over any dispute arising from them.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The commercial terms on which we accept projects, deliver work, transfer ownership and handle cancellations."
      lastUpdated="1 January 2025"
      sections={sections}
    />
  );
}
