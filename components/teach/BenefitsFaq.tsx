"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { TEACH_FAQ } from "@/lib/teach-config";

export function BenefitsFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section background="paper" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading eyebrow="Teacher FAQ" title="Questions, answered." intro="Straight answers, no small print hidden in the margins." />
        <div className="divide-y divide-hairline border-y border-hairline">
          {TEACH_FAQ.map((f, i) => {
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
  );
}
