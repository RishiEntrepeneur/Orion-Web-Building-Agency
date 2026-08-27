import type { Metadata } from "next";
import { Studio } from "@/components/galaxy/pages";

export const metadata: Metadata = {
  title: "Studio — Orion Dream Studio",
  description: "One engineer, and no middle layer. What being new costs you, and what it buys you.",
};

export default function Page() { return <Studio />; }
