"use client";

import { useMemo, useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type Cat = "Retailers" | "Brands" | "Studios" | "Collaborators";

const PARTNERS: { name: string; cat: Cat }[] = [
  { name: "Raj Musicals", cat: "Retailers" },
  { name: "Bhatia Musicals", cat: "Retailers" },
  { name: "New Bharat Musicals", cat: "Retailers" },
  { name: "Furtados", cat: "Retailers" },
  { name: "Yamaha", cat: "Brands" },
  { name: "Roland", cat: "Brands" },
  { name: "Casio", cat: "Brands" },
  { name: "Kadence", cat: "Brands" },
  { name: "Vault", cat: "Studios" },
  { name: "Future collaborators", cat: "Collaborators" },
];

const CATS: Cat[] = ["Retailers", "Brands", "Studios", "Collaborators"];

export function Partners() {
  const [cat, setCat] = useState<Cat | "">("");
  const items = useMemo(
    () => (cat ? PARTNERS.filter((p) => p.cat === cat) : PARTNERS),
    [cat]
  );

  return (
    <Section id="partners" background="ink" spacing="lg">
      <SectionHeading
        eyebrow="Musicphonetics Partner Network"
        title="A wider music ecosystem."
        intro="Our learning journey connects with instrument retailers, music brands, studios, and collaborators around the student."
        invert
      />

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Chip active={cat === ""} onClick={() => setCat("")}>All</Chip>
        {CATS.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
        ))}
      </div>

      {/* Carousel / grid */}
      <div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5 [scrollbar-width:thin]">
        {items.map((p) => (
          <div
            key={p.name}
            className="mp-glass flex h-24 w-40 shrink-0 snap-start flex-col items-center justify-center rounded-2xl px-3 text-center sm:w-auto"
          >
            <span className="text-sm font-semibold text-paper/85">{p.name}</span>
            <span className="mt-1 text-[10px] uppercase tracking-wide text-gold/70">{p.cat}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-paper/50">
        Listed as part of our wider music ecosystem and relationship network.
        Formal collaborations may vary by program and location.
      </p>
    </Section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-gold bg-gold/15 text-gold" : "border-white/15 bg-white/5 text-paper/65 hover:text-paper"
      )}
    >
      {children}
    </button>
  );
}
