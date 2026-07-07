"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LADDER } from "@/lib/teach-config";

export function GrowthLadder() {
  const ref = useRef<HTMLOListElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Your growth path"
        title="A career, not a gig."
        intro="Every rung is real progression tied to delivery - from your first student to a partnership as we expand."
      />
      <ol ref={ref} className="relative mt-12 max-w-2xl space-y-10 pl-10">
        <div aria-hidden="true" className="absolute left-[14px] top-2 h-[calc(100%-1rem)] w-0.5 bg-hairline" />
        <motion.div
          aria-hidden="true"
          className="absolute left-[14px] top-2 w-0.5 origin-top bg-gold"
          style={reduced ? { height: "calc(100% - 1rem)" } : { height: "calc(100% - 1rem)", scaleY: fill }}
        />
        {LADDER.map((r) => (
          <li key={r.rung} className="relative">
            <span className="absolute -left-10 top-0 grid h-7 w-7 place-items-center rounded-full bg-gold text-xs font-bold text-ink shadow-[0_0_12px_rgba(201,162,39,0.5)]">{r.rung}</span>
            <h3 className="text-lg font-semibold text-ink">{r.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{r.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ink/65">
        The Regional Coordinator override is the single management layer - you earn on
        teachers you genuinely support and onboard. There is no chain beyond it, and no
        earning from recruits-of-recruits.
      </p>
    </Section>
  );
}
