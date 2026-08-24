import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: `How ${site.legal.entity} makes immersive 3D websites usable for everyone, including visitors who use assistive technology or prefer reduced motion.`,
  robots: { index: true, follow: true },
};

const sections: readonly LegalSection[] = [
  {
    heading: "1. Our commitment",
    body: [
      "Immersive does not have to mean inaccessible. We build to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA and treat accessibility as part of delivery, not an optional extra.",
    ],
  },
  {
    heading: "2. What we do on every build",
    body: [
      "Semantic HTML5 landmarks, a working skip link, logical heading order and visible focus styles throughout.",
      "Full keyboard operability: every interactive control can be reached and used without a pointing device.",
      "Decorative 3D scenes and HUD chrome are hidden from assistive technology, with meaningful text alternatives supplied for anything that carries information.",
      "Colour contrast is checked against AA thresholds for body text and interface controls.",
    ],
  },
  {
    heading: "3. Motion and vestibular safety",
    body: [
      "All scroll-driven camera motion, parallax and looping animation respect the operating system's 'reduce motion' setting. When it is enabled, animation is disabled and the 3D layer is replaced with a static frame.",
      "No content flashes more than three times per second.",
    ],
  },
  {
    heading: "4. Known limitations",
    body: [
      "Real-time WebGL scenes are inherently visual. Where a scene conveys information rather than atmosphere, we provide an equivalent text or static-image description; if you find a case where we have not, please tell us.",
    ],
  },
  {
    heading: "5. Feedback",
    body: [
      `If you encounter an accessibility barrier on this site, email ${site.email}. We aim to respond within five working days and to fix confirmed issues within 30 days.`,
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility Statement"
      intro="How we make cinematic 3D experiences work for keyboard users, screen reader users and anyone who prefers reduced motion."
      lastUpdated="1 January 2025"
      sections={sections}
    />
  );
}
