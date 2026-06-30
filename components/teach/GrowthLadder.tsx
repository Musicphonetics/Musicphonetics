"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";

const RUNGS = [
  { when: "Day 1", title: "Your first student", body: "We match you with a student and you teach your first paid class — no chasing required." },
  { when: "Month 1", title: "Your roster fills", body: "A steady set of students and a predictable monthly income begin to build." },
  { when: "Month 6", title: "Loyalty + advancement", body: "A six-month loyalty payment, eligibility for advances, a faculty certificate, and referral bonuses." },
  { when: "Year 1", title: "Senior faculty", body: "Recognised seniority, priority student matching, and a higher standing within the institution." },
  { when: "Next", title: "Regional Coordinator & Partner track", body: "Lead a real team of teachers and earn a management override on real teaching revenue — a leadership role, not recruitment income." },
];

export function GrowthLadder() {
  const ref = useRef<HTMLOListElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="The ladder"
        title="A path that keeps climbing."
        intro="Every rung is real progression — from your first student to leading a team."
      />
      <ol ref={ref} className="relative mt-12 max-w-2xl space-y-10 pl-10">
        {/* Connector track + gold fill */}
        <div aria-hidden="true" className="absolute left-[14px] top-2 h-[calc(100%-1rem)] w-0.5 bg-hairline" />
        <motion.div
          aria-hidden="true"
          className="absolute left-[14px] top-2 w-0.5 origin-top bg-gold"
          style={reduced ? { height: "calc(100% - 1rem)" } : { height: "calc(100% - 1rem)", scaleY: fill }}
        />
        {RUNGS.map((r, i) => (
          <li key={r.when} className="relative">
            <span className="absolute -left-10 top-0 grid h-7 w-7 place-items-center rounded-full bg-gold text-xs font-bold text-ink shadow-[0_0_12px_rgba(201,162,39,0.5)]">{i + 1}</span>
            <p className="font-display text-sm font-semibold text-[#7A5E0F]">{r.when}</p>
            <h3 className="mt-1 text-lg font-semibold text-ink">{r.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{r.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
