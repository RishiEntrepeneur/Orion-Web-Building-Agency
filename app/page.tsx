import type { Metadata } from "next";
import { Dream } from "@/components/galaxy/pages";

export const metadata: Metadata = {
  title: "Orion Dream Studio — Build the website of your dreams",
  description:
    "One brief, one fixed price, live in forty-eight hours. Real-time WebGL, performance engineering and accessibility built in rather than retrofitted.",
};

export default function Page() { return <Dream />; }
