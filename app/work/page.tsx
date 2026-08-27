import type { Metadata } from "next";
import { Work } from "@/components/galaxy/pages";

export const metadata: Metadata = {
  title: "Work — Orion Dream Studio",
  description:
    "No client logos. The work itself: a raymarched sky, a brief-to-layout engine, a scroll film and a keyboard-first interface, all running in the page.",
};

export default function Page() { return <Work />; }
