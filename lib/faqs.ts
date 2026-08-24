export type Faq = {
  question: string;
  answer: string;
};

/** Objection-handling FAQ copy, also used to emit FAQPage structured data. */
export const faqs: readonly Faq[] = [
  {
    question: "Do these sites work properly on mobile phones?",
    answer:
      "Yes — mobile is the primary target, not an afterthought. Every build is tested from 320px upwards. The 3D layer ships in three tiers: full real-time WebGL on desktop and modern phones, a lighter baked motion version on mid-range devices, and a crisp static poster frame if a device is old, throttled, or the visitor has switched on reduced motion. Nobody ever sees a broken or blank scene.",
  },
  {
    question: "Do I need to learn complex 3D software to run my site?",
    answer:
      "No. You never open Blender, Spline or any 3D tool. You send a short written brief, and we handle scene generation, modelling, lighting and optimisation. After launch you edit text and images through a simple dashboard — the 3D environment sits behind it and looks after itself.",
  },
  {
    question: "How do the animations actually work?",
    answer:
      "Two systems run together. Scroll position is mapped to a virtual camera path, so moving down the page moves the camera through the scene rather than just sliding blocks up. Cursor position feeds a parallax rig that shifts foreground and background layers by different amounts. Both are GPU-accelerated and frame-rate capped, so they stay smooth without draining battery.",
  },
  {
    question: "Will a 3D site slow my page down or hurt my Google ranking?",
    answer:
      "Handled correctly, no. Geometry is Draco-compressed, textures are streamed, and the 3D scene is lazily hydrated after first paint — so text and your primary call to action render immediately. We target a Largest Contentful Paint under two seconds and ship semantic HTML, structured data and full meta tags, which is exactly what search engines index.",
  },
  {
    question: "Is 48 hours genuinely realistic, or is that marketing?",
    answer:
      "It is genuine, and it is why the process is productised. The clock starts once your brief is approved, not when you first enquire. Because scope is fixed per package and scene generation is AI-assisted, there is no open-ended design phase to slip. If we miss the window, the project fee is refunded in full.",
  },
  {
    question: "I run a local business — is this overkill for me?",
    answer:
      "It is usually the opposite. Local competitors almost all use the same handful of templates, so an immersive site is the fastest way to look like the established, premium option in your area. The Starter Concept at £299 gives a single-page spatial layout with booking or enquiry capture, which is all most local businesses need to out-position their market.",
  },
  {
    question: "What happens if I need changes after launch?",
    answer:
      "Every package includes revisions during the build window. Afterwards you can either request ad-hoc changes at a fixed rate, or take the Infinite Horizon Retainer at £49 per month, which covers continuous 3D asset optimisation, hosting, security patches and structural updates with no long-term contract.",
  },
  {
    question: "Do I own the website and the 3D assets?",
    answer:
      "Completely. On launch day you receive the source scene files, exported models, the codebase and the deployment pipeline. There is no proprietary editor lock-in, no per-view licensing and no penalty for moving your site elsewhere later.",
  },
];
