"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { MotionReveal } from "./MotionReveal";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "70% per-class share", "Paid on time, every cycle", "Students brought to you",
  "Six-month & annual loyalty payments", "A structured method & curriculum",
  "Performance & concert opportunities", "Faculty certificate & seniority",
  "Referral bonuses", "Teach at home, online, or our centre",
];

const FAQS = [
  { q: "How much can I earn?", a: "You keep 70% of each class fee — ₹840 on a Foundation class, ₹1,050 on a Transformation class. Monthly income depends on your roster; the calculator above shows an illustrative projection." },
  { q: "When and how am I paid?", a: "On a fixed cycle, reconciled by us — no chasing parents, no late, unpredictable cash." },
  { q: "Do I have to find my own students?", a: "No. We bring matched, qualified students to you. Building and keeping your roster is our job." },
  { q: "Can I teach online and at home?", a: "Yes — at home across Delhi NCR, live online, and at our flagship centre as it opens." },
  { q: "What's the time commitment?", a: "Flexible. You set your availability; we schedule within it. Most faculty build toward a full roster over the first weeks." },
  { q: "What is the selection process?", a: "Seven stages — application, interview, skill assessment, teaching evaluation, background & document verification, reference checks, and founder approval." },
  { q: "Is this a one-to-one only role?", a: "No — you may teach private and group classes, and take part in concerts and performances we organise." },
];

export function BenefitsFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <Section background="white" spacing="lg">
        <SectionHeading eyebrow="The benefits" title="What you get as faculty." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <MotionReveal key={b} delay={(i % 3) * 70}>
              <div className="flex h-full items-center gap-3 rounded-2xl border border-hairline bg-paper p-5 transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-card-hover">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-ink">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="text-sm font-medium text-ink">{b}</span>
              </div>
            </MotionReveal>
          ))}
        </div>
      </Section>

      <Section background="paper" spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading eyebrow="Teacher FAQ" title="Questions, answered." />
          <div className="divide-y divide-hairline border-y border-hairline">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                    <span className="text-base font-semibold text-ink">{f.q}</span>
                    <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline text-ink transition-transform", isOpen && "rotate-45")} aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                  <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden"><p className="max-w-xl text-sm leading-relaxed text-ink/70">{f.a}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
