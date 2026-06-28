"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ProgramIcon } from "@/components/ui/ProgramIcon";
import { cn } from "@/lib/utils";
import type { IconKey } from "@/lib/programs";

interface Prog {
  name: string;
  icon: IconKey;
  duration: string;
  who: string;
  availability: string;
  outcome: string;
}

const PROGRAMS: Prog[] = [
  { name: "Guitar", icon: "guitar", duration: "45–60 min · 2×/week", who: "Kids & adults, all levels", availability: "High · home & online", outcome: "Play full songs within months" },
  { name: "Piano", icon: "piano", duration: "45–60 min · 2×/week", who: "Children & serious learners", availability: "High · home & online", outcome: "Read music & build technique" },
  { name: "Vocals", icon: "vocals", duration: "45–60 min · 2×/week", who: "Teens & adults", availability: "Medium · online-friendly", outcome: "Confident, healthy singing" },
  { name: "Keyboard", icon: "piano", duration: "45–60 min · 2×/week", who: "Beginners & kids", availability: "High · home & online", outcome: "Melody, chords & coordination" },
  { name: "Ukulele", icon: "ukulele", duration: "45–60 min · 2×/week", who: "Young beginners", availability: "High · home & online", outcome: "A joyful first instrument" },
  { name: "Others", icon: "theory", duration: "45–60 min · 2×/week", who: "Drums, Violin, Bass, Production, Theory & more", availability: "By request · home & online", outcome: "Tell us — we'll match a specialist teacher" },
];

export function ProgramsInteractive() {
  const [open, setOpen] = useState(0);

  return (
    <Section id="programs" background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Programs"
        title="What can you learn?"
        intro="Every program follows the same structured, director-led method — with real outcomes, not vague promises. Tap any program to see exactly what to expect."
      />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {PROGRAMS.map((p, i) => {
          const isOpen = open === i;
          return (
            <div
              key={p.name}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white transition-all",
                isOpen ? "border-gold/50 shadow-card-hover" : "border-hairline shadow-card"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
              >
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors", isOpen ? "bg-gold text-ink" : "bg-gold/15 text-deep-gold")}>
                  <ProgramIcon icon={p.icon} size={22} />
                </span>
                <span className="flex-1 text-lg font-semibold text-ink">{p.name}</span>
                <span className={cn("grid h-7 w-7 place-items-center rounded-full border border-hairline text-ink transition-transform", isOpen && "rotate-45")} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </span>
              </button>
              <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 sm:px-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {(p.name === "Others"
                        ? ["By request", "Home & online"]
                        : ["Private", "Group", "Home & online"]
                      ).map((tag) => (
                        <span key={tag} className="rounded-full border border-hairline bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <Detail label="Duration" value={p.duration} />
                      <Detail label="Who it's for" value={p.who} />
                      <Detail label="Teacher availability" value={p.availability} />
                      <Detail label="Typical outcome" value={p.outcome} />
                    </dl>
                    <a
                      href={p.name === "Others" ? "/start" : `/start?instrument=${encodeURIComponent(p.name)}`}
                      className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-[#0f131c]"
                    >
                      {p.name === "Others" ? "Explore other instruments" : `Start with ${p.name}`}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-paper p-3.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink/45">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
