import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { Credentials } from "@/components/trust/Credentials";
import { Operations } from "@/components/trust/Operations";
import { Documentation } from "@/components/trust/Documentation";
import { Recognition } from "@/components/trust/Recognition";
import { CompanyTimeline } from "@/components/trust/CompanyTimeline";
import { TrustDashboard } from "@/components/trust/TrustDashboard";
import { GlobalPresence } from "@/components/trust/GlobalPresence";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Trust Centre",
  description:
    "The Musicphonetics Trust Centre — credentials, operations, standards, documentation, public recognition, company timeline, and a live trust dashboard. Built on systems, not promises.",
};

export default function TrustPage() {
  return (
    <div className="bg-midnight text-paper">
      {/* Cinematic header */}
      <section className="relative overflow-hidden border-b border-white/5 py-24 sm:py-32">
        <div aria-hidden="true" className="mp-blueprint pointer-events-none absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-deep-gold/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-feature-green/30 blur-3xl" />
        <div className="container-mp relative">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The Musicphonetics Trust Centre</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] text-paper sm:text-6xl">
              Built on trust. <span className="text-gold">Documented by design.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/70">
              Every class is backed by systems, documentation and accountability.
              Great education isn&apos;t built on promises — it is built on
              standards.
            </p>
          </Reveal>
        </div>
      </section>

      <Credentials />
      <Operations />
      <Documentation />
      <Recognition />
      <CompanyTimeline />
      <TrustDashboard />
      <GlobalPresence />

      <FinalCTA
        headline="A company you can trust with your child's music."
        text="Start with one trial. Continue with a clear, documented path."
      />
    </div>
  );
}
