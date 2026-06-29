"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { MotionReveal } from "./MotionReveal";
import { TEACH_WHATSAPP } from "@/lib/teach-econ";
import { phoneLink } from "@/lib/data";
import { cn } from "@/lib/utils";

export function TeachFinalCTA() {
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Section background="ink" spacing="lg">
        <MotionReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold leading-tight text-paper sm:text-4xl">Ready to just teach?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-paper/75">
              Bring the music. We&apos;ll bring the students, the structure, and
              the pay — on time, every cycle.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href={TEACH_WHATSAPP} external variant="light" size="lg">Apply on WhatsApp</Button>
              <Button href={phoneLink} variant="secondary" size="lg" className="border-white/25 text-paper hover:border-white">Call us</Button>
            </div>
            <p className="mt-6 text-sm text-paper/50">Limited intake — we&apos;re onboarding 2 faculty this cycle, with care.</p>
          </div>
        </MotionReveal>
      </Section>

      {/* Sticky mobile CTA after hero */}
      <div className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur-md transition-transform duration-300 lg:hidden", showBar ? "translate-y-0" : "translate-y-full")}>
        <a href={TEACH_WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-ink">
          Apply to teach →
        </a>
      </div>
    </>
  );
}
