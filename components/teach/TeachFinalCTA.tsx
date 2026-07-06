"use client";

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { MotionReveal } from "./MotionReveal";
import { phoneLink, whatsappLink } from "@/lib/data";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function TeachFinalCTA() {
  return (
    <Section background="ink" spacing="lg">
      <MotionReveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            Your students are already waiting. Come teach them.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-paper/75">
            Bring the music. We&apos;ll bring the students, the structure, and the
            pay — on time, every cycle.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={() => scrollToId("apply")} variant="light" size="lg">Apply to Teach</Button>
            <Button href={whatsappLink("Hi Musicphonetics, I have a question about teaching with you.")} external variant="secondary" size="lg" className="border-white/25 text-paper hover:border-white">Ask a question</Button>
          </div>
          <p className="mt-6 text-sm text-paper/50">
            We review every application personally — and we reply immediately. Prefer to talk?{" "}
            <a href={phoneLink} className="font-semibold text-gold underline underline-offset-2">Call us</a>.
          </p>
        </div>
      </MotionReveal>
    </Section>
  );
}
