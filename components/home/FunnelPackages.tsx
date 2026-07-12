"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

interface Plan {
  key: string;
  slug: string;
  flagship?: boolean;
  ribbon?: string;
  tag?: string;
  name: string;
  line: string;
  fee: string;
  feeNote: string;
  facts: string[];
  detailLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
}

// DOM order: Main first, so the flagship is the first card in view on mobile.
const PLANS: Plan[] = [
  {
    key: "main", slug: "main", flagship: true, ribbon: "Most chosen",
    name: "The Main Pathway",
    line: "The full Musicphonetics system, for real and lasting progress.",
    fee: "₹12,000", feeNote: "8 one hour classes each month.",
    facts: [
      "Matched teacher and a structured curriculum.",
      "Theory, ear training and stage work.",
      "Trinity or graded exam prep when the student wants it.",
    ],
    detailLabel: "See full details", secondaryLabel: "Terms and conditions", secondaryHref: "/programmes/main#terms",
  },
  {
    key: "foundation", slug: "foundation", tag: "The starting point",
    name: "Foundation",
    line: "A guided beginner pathway that builds a real foundation.",
    fee: "₹8,000", feeNote: "a 4 chapter beginner journey.",
    facts: [
      "Best for absolute beginners.",
      "Four chapters, first notes to ready for the Main Pathway.",
      "Most students move up after a few months.",
    ],
    detailLabel: "See full details", secondaryLabel: "Terms and conditions", secondaryHref: "/programmes/foundation#terms",
  },
  {
    key: "directors", slug: "directors-circle", tag: "By request only",
    name: "Director's Circle",
    line: "Direct, founder level mentoring for a select few.",
    fee: "By request", feeNote: "limited availability.",
    facts: [
      "Personally guided by Abhishek.",
      "Limited seats, about a one week waiting list.",
      "By application.",
    ],
    detailLabel: "See full details", secondaryLabel: "How it works", secondaryHref: "/programmes/directors-circle",
  },
];

export function FunnelPackages() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / (el.scrollWidth / PLANS.length));
    setActive(Math.max(0, Math.min(PLANS.length - 1, i)));
  }

  return (
    <section id="programmes" className="scroll-mt-16 bg-charcoal py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes"
          title="Choose the path that fits the student."
          sub="Clear plans and clear fees. Full details, what is included, and the terms live on each plan's page."
          invert
        />
      </div>

      {/* Mobile: snap carousel with a peek. Desktop: 3 column grid. */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:max-w-content md:grid md:grid-cols-3 md:items-center md:gap-5 md:overflow-visible md:px-8 md:pb-0"
      >
        {PLANS.map((p) => <Card key={p.key} p={p} />)}
      </div>

      {/* Dot indicators (mobile only) */}
      <div className="mt-5 flex justify-center gap-2 md:hidden">
        {PLANS.map((p, i) => (
          <span key={p.key} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-gold" : "w-1.5 bg-ivory/25")} />
        ))}
      </div>

      <div className="container-mp">
        <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-ivory/60">
          Every plan page explains what is included, how billing works, and the full terms.
        </p>
      </div>
    </section>
  );
}

function Card({ p }: { p: Plan }) {
  const order = p.key === "main" ? "order-1 md:order-2" : p.key === "foundation" ? "order-2 md:order-1" : "order-3";
  return (
    <div className={cn(
      "flex min-w-[86%] shrink-0 snap-center flex-col rounded-2xl border p-7 md:min-w-0 md:p-8",
      order,
      p.flagship
        ? "relative z-10 border-gold bg-charcoal-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] md:-my-2 md:scale-[1.05]"
        : "border-white/12 bg-charcoal-2/60",
    )}>
      {p.ribbon && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-charcoal px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ivory ring-1 ring-gold/40">{p.ribbon}</span>
      )}
      {p.tag && <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-gold">{p.tag}</span>}
      <h3 className={cn("font-display text-2xl font-medium text-ivory", p.tag && "mt-2")}>{p.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ivory/65">{p.line}</p>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="font-display text-[1.6rem] leading-none text-ivory">
          {p.fee}{p.fee.startsWith("₹") && <span className="ml-1 text-sm font-normal text-muted">/ month</span>}
        </p>
        <p className="mt-1.5 text-xs text-muted">{p.feeNote}</p>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {p.facts.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ivory/75">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-7 space-y-3">
        <Link href={`/programmes/${p.slug}`}
          className={cn("flex min-h-[48px] w-full items-center justify-center rounded-md px-6 text-sm font-medium transition",
            p.flagship ? "bg-gold text-charcoal hover:brightness-105" : "border border-ivory/25 text-ivory hover:border-gold hover:text-gold")}>
          {p.detailLabel}
        </Link>
        <Link href={p.secondaryHref} className="block text-center text-sm text-ivory/60 underline-offset-4 hover:text-gold hover:underline">
          {p.secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
