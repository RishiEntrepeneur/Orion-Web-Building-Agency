import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Which cookies ${site.legal.entity} sets, why, and how to change your preferences at any time.`,
  robots: { index: true, follow: true },
};

const sections: readonly LegalSection[] = [
  {
    heading: "1. What cookies are",
    body: [
      "Cookies are small text files placed on your device by a website. Similar technologies — local storage, session storage and pixels — work in comparable ways and are covered by this policy.",
    ],
  },
  {
    heading: "2. The categories we use",
    body: [
      "Strictly necessary: required for the site to function — security, routing and form submission. These do not require consent under the Privacy and Electronic Communications Regulations (PECR) and cannot be switched off.",
      "Analytics: anonymous, aggregated statistics about page views and scroll depth, used to improve the site. Off until you allow them.",
      "Marketing: measurement of which campaigns generate enquiries. Off until you allow them.",
    ],
  },
  {
    heading: "3. Your consent choice",
    body: [
      "On your first visit you are asked to accept all, reject non-essential, or set each category individually. Rejecting is presented with equal prominence to accepting, and nothing non-essential is set before you choose.",
      "Your preference is stored locally in your browser and is not shared with any third party. You can change it at any time using the Cookie Settings control in the site footer.",
    ],
  },
  {
    heading: "4. Managing cookies in your browser",
    body: [
      "All major browsers let you block or delete cookies through their settings. Blocking strictly necessary cookies may prevent parts of this site from working correctly.",
    ],
  },
  {
    heading: "5. Third parties",
    body: [
      "If analytics or marketing cookies are enabled, they may be set by our chosen providers on our behalf. Each is bound by a data processing agreement and may not use the data for its own purposes. A current list of providers is available on request.",
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="Exactly which cookies this site can set, what each category does, and how to change your mind at any time."
      lastUpdated="1 January 2025"
      sections={sections}
    />
  );
}
