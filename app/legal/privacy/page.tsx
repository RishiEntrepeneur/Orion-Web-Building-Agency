import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.legal.entity} collects, uses and protects personal data under the UK GDPR and the Data Protection Act 2018.`,
  robots: { index: true, follow: true },
};

const sections: readonly LegalSection[] = [
  {
    heading: "1. Who we are",
    body: [
      `${site.legal.entity} (company number ${site.legal.companyNumber}), registered at ${site.legal.registeredOffice}, is the data controller for personal data collected through this website.`,
      `We are registered with the Information Commissioner's Office under registration reference ${site.legal.icoRegistration}.`,
    ],
  },
  {
    heading: "2. What we collect",
    body: [
      "Enquiry data: the name, email address, telephone number and project details you choose to send us through a form or by email.",
      "Technical data: IP address, browser type, device class, referring URL and pages viewed. Where analytics cookies are permitted, this is collected in aggregated, anonymised form.",
      "Consent data: the cookie preferences you set, stored in your browser so we do not ask you repeatedly.",
    ],
  },
  {
    heading: "3. Why we process it and our lawful basis",
    body: [
      "To respond to enquiries and deliver a project you have commissioned — performance of a contract, or steps taken at your request before entering a contract.",
      "To keep the site secure and functioning — our legitimate interests in operating a safe service.",
      "To measure how the site performs and which campaigns generate enquiries — your consent, which you may withdraw at any time from the cookie controls in the footer.",
    ],
  },
  {
    heading: "4. How long we keep it",
    body: [
      "Enquiries that do not become projects are deleted within 12 months. Project records, including invoices, are retained for six years to meet HMRC and statutory accounting requirements. Analytics data is retained for a maximum of 14 months.",
    ],
  },
  {
    heading: "5. Sharing and international transfers",
    body: [
      "We share data only with processors who help us run the business — hosting, email, analytics and payment providers — each bound by a written data processing agreement.",
      "Where a processor stores data outside the UK, transfers are protected by UK adequacy regulations or the International Data Transfer Addendum to the EU Standard Contractual Clauses.",
      "We never sell personal data.",
    ],
  },
  {
    heading: "6. Your rights",
    body: [
      "Under the UK GDPR you have the right to access your data, to rectification, to erasure, to restrict or object to processing, and to data portability. Where processing relies on consent, you can withdraw that consent at any time.",
      "To exercise any of these rights, email us using the address below. We will respond within one calendar month.",
    ],
  },
  {
    heading: "7. Security",
    body: [
      "All traffic is served over TLS. Access to enquiry data is limited to staff who need it, protected by multi-factor authentication, and reviewed regularly. In the event of a personal data breach that presents a risk to your rights, we will notify the ICO within 72 hours and inform you where legally required.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what personal data we collect through this website, why we collect it, how long we keep it and what rights you have over it."
      lastUpdated="1 January 2025"
      sections={sections}
    />
  );
}
