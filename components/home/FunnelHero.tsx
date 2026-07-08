"use client";

import { useEffect, useState } from "react";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG, HERO_SLIDES } from "@/lib/home-config";
import { cn } from "@/lib/utils";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function FunnelHero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((p) => (p + 1) % HERO_SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      {/* Slideshow */}
      <div aria-hidden="true" className="absolute inset-0">
        {HERO_SLIDES.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt=""
            loading={idx === 0 ? "eager" : "lazy"}
            // @ts-expect-error fetchpriority is a valid html attr
            fetchpriority={idx === 0 ? "high" : undefined}
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-out",
              idx === i ? "opacity-100 scale-105" : "opacity-0 scale-100",
              "motion-safe:transition-[opacity,transform] motion-safe:duration-[4200ms]"
            )}
          />
        ))}
        {/* Legibility overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-mp relative flex min-h-[92vh] flex-col justify-end pb-28 pt-24 sm:min-h-[86vh] sm:justify-center sm:pb-24">
        <div className="max-w-2xl">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-black/30 px-4 py-1.5 text-sm text-paper/90 backdrop-blur">
            <span aria-hidden="true">🙏</span>
            <span className="font-display font-semibold text-gold">नमस्ते</span>
            <span className="text-paper/85">Namaste, and welcome</span>
          </span>

          <h1 className="mt-5 font-display text-[2.7rem] font-semibold leading-[1.03] drop-shadow-sm sm:text-6xl lg:text-7xl">
            Music classes that don&apos;t feel <span className="text-gold">random.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">
            Real teachers, real students, real progress. Warm, structured guitar,
            piano/keyboard &amp; vocal classes for children, beginners &amp; serious
            learners, at home and online across Delhi NCR.
          </p>

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-paper/80">
            <span className="text-gold">★★★★★</span>
            <span>Loved by 1,100+ families</span><Dot /><span>Teacher matching</span><Dot /><span>Progress tracking</span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppCTA label="Enquire on WhatsApp" message={WA_MSG.hero} />
            <button type="button" onClick={() => scrollToId("programmes")}
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-4 text-base font-semibold text-paper transition-colors hover:border-white">
              See Programmes &amp; Fees
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div className="mt-9 flex gap-1.5">
          {HERO_SLIDES.map((_, idx) => (
            <button key={idx} type="button" aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)}
              className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-6 bg-gold" : "w-1.5 bg-white/40")} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-gold" />;
}
