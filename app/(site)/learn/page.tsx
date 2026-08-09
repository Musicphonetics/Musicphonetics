import type { Metadata } from "next";
import { Suspense } from "react";
import { LearnExperience } from "@/components/learn/LearnExperience";

export const metadata: Metadata = {
  title: "How Classes Work & Fees",
  description:
    "See exactly how Musicphonetics classes work: pick your instrument (guitar, piano, keyboard, vocals and more), understand the one-to-one format, class duration and fees, then book a free trial. Home and online across Delhi NCR.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "How our music classes work · Musicphonetics",
    description:
      "Pick your instrument and see how classes work, the fee structure, and book a free one-to-one trial. Home and online across Delhi NCR.",
  },
};

// Interactive, WhatsApp-shareable explainer that funnels straight into the
// existing /start trial form (pre-set to the chosen instrument). Wrapped in
// Suspense so the client component can be statically exported.
export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <LearnExperience />
    </Suspense>
  );
}
