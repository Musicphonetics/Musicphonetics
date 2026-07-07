"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { SystemStep } from "@/lib/curriculum";
import { SYSTEM_STEPS } from "@/lib/curriculum";

/**
 * M1 - the 6-step method rendered as a visible system.
 * Horizontal on desktop, vertical on mobile; the gold connector draws in on
 * scroll (disabled under prefers-reduced-motion).
 */
export function SystemFlow({ steps = SYSTEM_STEPS }: { steps?: SystemStep[] }) {
  const reduced = useReducedMotion();

  return (
    <Section id="system" background="paper" spacing="lg">
      <SectionHeading
        eyebrow="How the institution works"
        title="One method, run as a system."
        intro="The same structure for every student, in every home - assessment through to monthly parent reports, then round again."
      />

      <div className="mt-14">
        {/* Desktop: horizontal */}
        <ol className="relative hidden lg:grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
          {/* Connector track + gold draw-in */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-6 h-px bg-hairline" />
          <motion.div
            aria-hidden="true"
            className="absolute left-0 top-6 h-px origin-left bg-gold"
            style={{ right: 0 }}
            initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center px-3 text-center">
              <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-gold bg-paper font-display text-sm font-semibold text-[#7A5E0F]">
                {i + 1}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">{s.line}</p>
            </li>
          ))}
        </ol>

        {/* Mobile: vertical */}
        <ol className="relative space-y-8 pl-10 lg:hidden">
          <div aria-hidden="true" className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-hairline" />
          <motion.div
            aria-hidden="true"
            className="absolute left-[19px] top-2 w-px origin-top bg-gold"
            style={{ height: "calc(100% - 1rem)" }}
            initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-10 top-0 grid h-10 w-10 place-items-center rounded-full border border-gold bg-paper font-display text-sm font-semibold text-[#7A5E0F]">
                {i + 1}
              </span>
              <h3 className="text-sm font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">{s.line}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-12 text-center text-sm text-ink/70">
        One method, run as a system - the same for every student, in every home.
      </p>
    </Section>
  );
}
