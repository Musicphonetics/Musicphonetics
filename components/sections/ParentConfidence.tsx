"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

const ITEMS = [
  { title: "A clear learning path", body: "A defined, staged journey from the very first class - your child always knows what they're working toward, and so do you." },
  { title: "Verified teachers", body: "Every teacher passes a seven-stage quality process - interview, skill assessment, teaching evaluation, background verification, and founder approval - before teaching." },
  { title: "A trial before any commitment", body: "Begin with a single trial class. Continue only when it feels right for your family. No pressure, no lock-in to start." },
  { title: "Online and home formats", body: "Learn at home across Delhi NCR, or live online from anywhere in the world - the same method and the same standard either way." },
  { title: "Honest progress updates", body: "Feedback after classes and a structured progress system, so you always know how your child is growing." },
  { title: "A real exam pathway", body: "Trinity, ABRSM, and Rockschool graded pathways are available for families who want recognised milestones." },
];

export function ParentConfidence() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="For families"
        title="What every family deserves before choosing a music school."
        intro="Clarity before commitment. Here's what you can expect from us - every time."
      />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.title}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white transition-all",
                isOpen ? "border-gold/50 shadow-card-hover" : "border-hairline shadow-card"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 text-deep-gold">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-base font-semibold text-ink">{item.title}</span>
                </span>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline text-ink transition-transform", isOpen && "rotate-45")} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 pl-[3.75rem] text-sm leading-relaxed text-ink/70 sm:px-6 sm:pl-[3.75rem]">
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
