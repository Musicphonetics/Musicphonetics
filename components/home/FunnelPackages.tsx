"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

interface Plan {
  slug: string;
  tag: string;
  name: string;
  line: string;
  fee: string;
  feeNote: string;
  facts: string[];
  cta: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    slug: "main",
    tag: "Most chosen",
    name: "The Main Pathway",
    line: "The full Musicphonetics system, for real and lasting progress.",
    fee: "₹12,000",
    feeNote: "8 one hour classes each month",
    facts: [
      "A matched teacher and a structured curriculum.",
      "Theory, ear training and real stage work.",
      "Trinity and graded exam prep when ready.",
    ],
    cta: "See the Main Pathway",
    featured: true,
  },
  {
    slug: "foundation",
    tag: "The starting point",
    name: "Foundation",
    line: "A calm, correct first start for absolute beginners.",
    fee: "₹8,000",
    feeNote: "a four chapter beginner journey",
    facts: [
      "Built for absolute beginners.",
      "First notes to Main Pathway ready.",
      "Most students move up in a few months.",
    ],
    cta: "Explore Foundation",
  },
  {
    slug: "directors-circle",
    tag: "By request only",
    name: "Director's Circle",
    line: "Direct, founder level mentoring for a select few.",
    fee: "By request",
    feeNote: "limited availability",
    facts: [
      "Personally guided by the founder.",
      "Limited seats, about a week's wait.",
      "By application only.",
    ],
    cta: "Request access",
  },
];

export function FunnelPackages() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.scrollWidth / PLANS.length;
    setActive(Math.max(0, Math.min(PLANS.length - 1, Math.round(el.scrollLeft / step))));
  }

  function scrollTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 0;
    el.scrollTo({ left: i * step, behavior: "smooth" });
  }

  return (
    <section id="programmes" className="scroll-mt-16 bg-charcoal pb-10 pt-20 md:pb-14 md:pt-28">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes"
          title="The heart of everything we do."
          sub="Three ways to learn with us, each built around real, lasting progress. Most students grow through the Main Pathway."
          invert
        />
      </div>

      {/* Mobile: swipeable carousel. Desktop: three equal columns. */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        role="region"
        aria-label="Programmes"
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:max-w-content md:grid md:grid-cols-3 md:items-stretch md:gap-5 md:overflow-visible md:px-8"
      >
        {PLANS.map((p) => (
          <Card key={p.slug} p={p} />
        ))}
        <span aria-hidden className="w-px shrink-0 md:hidden" />
      </div>

      {/* Dots (mobile only) */}
      <div className="mt-5 flex justify-center gap-2 md:hidden">
        {PLANS.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            aria-label={`Show ${p.name}`}
            onClick={() => scrollTo(i)}
            className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-gold" : "w-1.5 bg-ivory/25 hover:bg-ivory/40")}
          />
        ))}
      </div>

      <div className="container-mp">
        <p className="mx-auto mt-8 max-w-md text-center text-sm leading-relaxed text-ivory/55">
          Every plan page explains what is included and the full terms before you pay.
        </p>
      </div>
    </section>
  );
}

function Card({ p }: { p: Plan }) {
  return (
    <article
      data-card
      className={cn(
        "flex w-[80%] shrink-0 snap-center flex-col rounded-2xl border p-6 sm:w-[62%] md:w-auto md:p-7",
        p.featured
          ? "border-gold/50 bg-charcoal-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]"
          : "border-white/12 bg-charcoal-2/50",
      )}
    >
      {/* Tag / ribbon */}
      {p.featured ? (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-charcoal">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
          {p.tag}
        </span>
      ) : (
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-gold">{p.tag}</span>
      )}

      <h3 className="mt-3 font-display text-[1.6rem] font-medium leading-tight text-ivory">{p.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ivory/65">{p.line}</p>

      {/* Price */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-[2rem] font-medium leading-none text-ivory">{p.fee}</span>
          {p.fee.startsWith("₹") && <span className="text-sm text-ivory/55">/ month</span>}
        </p>
        <p className="mt-1.5 text-xs text-ivory/50">{p.feeNote}</p>
      </div>

      {/* Facts */}
      <ul className="mt-5 flex-1 space-y-2.5">
        {p.facts.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed text-ivory/80">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/programmes/${p.slug}`}
        className={cn(
          "group mt-6 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full px-5 text-[0.92rem] font-semibold transition-all",
          p.featured
            ? "bg-gold text-charcoal shadow-[0_14px_30px_-12px_rgba(201,162,39,0.7)] hover:brightness-105"
            : "border border-gold/45 text-gold hover:bg-gold hover:text-charcoal",
        )}
      >
        {p.cta}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </article>
  );
}
