"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

interface Plan {
  slug: string;
  image: string;
  objectPos: string;
  ribbon?: string;
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
    image: "/images/classes/duet.webp",
    objectPos: "50% 30%",
    ribbon: "Most chosen",
    tag: "The complete system",
    name: "The Main Pathway",
    line: "The full Musicphonetics system, for real and lasting progress.",
    fee: "₹12,000",
    feeNote: "8 one hour classes each month",
    facts: ["A matched teacher and a structured curriculum.", "Theory, ear training and real stage work.", "Trinity and graded exam prep when ready."],
    cta: "See the Main Pathway",
    featured: true,
  },
  {
    slug: "foundation",
    image: "/images/classes/keys-duet.webp",
    objectPos: "50% 45%",
    tag: "The starting point",
    name: "Foundation",
    line: "A calm, correct first start for absolute beginners.",
    fee: "₹8,000",
    feeNote: "a four chapter beginner journey",
    facts: ["Built for absolute beginners.", "First notes to Main Pathway ready.", "Most students move up in a few months."],
    cta: "Explore Foundation",
  },
  {
    slug: "directors-circle",
    image: "/images/classes/trio.webp",
    objectPos: "50% 18%",
    tag: "By request only",
    name: "Director's Circle",
    line: "Direct, founder level mentoring for a select few.",
    fee: "By request",
    feeNote: "limited availability",
    facts: ["Personally guided by the founder.", "Limited seats, about a week's wait.", "By application only."],
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
    const step = card ? card.offsetWidth + 20 : el.scrollWidth / PLANS.length;
    setActive(Math.max(0, Math.min(PLANS.length - 1, Math.round(el.scrollLeft / step))));
  }

  function scrollTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : 0;
    el.scrollTo({ left: i * step, behavior: "smooth" });
  }

  return (
    <section id="programmes" className="scroll-mt-16 bg-charcoal py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes"
          title="The heart of everything we do."
          sub="Three ways to learn with us, each built around real, lasting progress. Most students grow through the Main Pathway."
          invert
        />
      </div>

      {/* Swipeable carousel */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        role="region"
        aria-label="Programmes"
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:max-w-content md:px-8"
      >
        {PLANS.map((p) => (
          <Card key={p.slug} p={p} />
        ))}
        <span aria-hidden className="w-1 shrink-0 md:hidden" />
      </div>

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-2.5">
        {PLANS.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            aria-label={`Show ${p.name}`}
            onClick={() => scrollTo(i)}
            className={cn("h-2 rounded-full transition-all", i === active ? "w-6 bg-gold" : "w-2 bg-ivory/25 hover:bg-ivory/40")}
          />
        ))}
      </div>

      <div className="container-mp">
        <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-ivory/55">
          Every plan page explains what is included, how billing works, and the full terms before you pay.
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
        "flex min-w-[84%] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border bg-charcoal-2 sm:min-w-[60%] lg:min-w-[calc((100%-40px)/3)]",
        p.featured ? "border-gold/50 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]" : "border-white/12",
      )}
    >
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden sm:h-56">
        <img src={p.image} alt="" loading="lazy" decoding="async" style={{ objectPosition: p.objectPos }} className="h-full w-full object-cover" />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(27,32,42,0.95),rgba(27,32,42,0.15)_60%)]" />
        <span className="absolute left-4 top-4 rounded-full bg-charcoal/70 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ivory/85 backdrop-blur-sm">
          {p.tag}
        </span>
        {p.ribbon && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-charcoal">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
            {p.ribbon}
          </span>
        )}
        <h3 className="absolute inset-x-5 bottom-4 font-display text-2xl font-medium text-ivory">{p.name}</h3>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-sm leading-relaxed text-ivory/65">{p.line}</p>

        <div className="mt-5 flex items-baseline gap-2 border-t border-white/10 pt-5">
          <span className="font-display text-[1.75rem] font-medium leading-none text-ivory">{p.fee}</span>
          {p.fee.startsWith("₹") && <span className="text-sm text-ivory/55">/ month</span>}
          <span className="ml-auto text-right text-xs text-ivory/50">{p.feeNote}</span>
        </div>

        <ul className="mt-5 flex-1 space-y-2.5">
          {p.facts.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-ivory/80">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {f}
            </li>
          ))}
        </ul>

        <Link
          href={`/programmes/${p.slug}`}
          className={cn(
            "group mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-semibold transition-all",
            p.featured
              ? "bg-gold text-charcoal shadow-[0_14px_30px_-10px_rgba(201,162,39,0.6)] hover:brightness-105"
              : "border border-gold/50 text-gold hover:bg-gold hover:text-charcoal",
          )}
        >
          {p.cta}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </article>
  );
}
