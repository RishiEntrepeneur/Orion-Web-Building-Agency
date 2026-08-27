import type { Metadata } from "next";
import { Begin } from "@/components/galaxy/pages";

export const metadata: Metadata = {
  title: "Begin — Orion Dream Studio",
  description: "Describe the website of your dreams in a paragraph and get a real answer.",
};

export default function Page() { return <Begin />; }
