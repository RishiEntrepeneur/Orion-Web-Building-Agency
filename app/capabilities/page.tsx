import type { Metadata } from "next";
import { Craft } from "@/components/galaxy/pages";

export const metadata: Metadata = {
  title: "Craft — Orion Dream Studio",
  description:
    "Real-time WebGL, performance engineering, application architecture and accessibility by construction.",
};

export default function Page() { return <Craft />; }
