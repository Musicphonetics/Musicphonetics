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
        {/* Legibility overlays - charcoal so the H1 always reads */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/20" />
      </div>

      {/* Content */}
      <div className="container-mp relative flex min-h-[92vh] flex-col justify-end pb-28 pt-24 sm:min-h-[86vh] sm:justify-center sm:pb-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 bg-gold" />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Delhi NCR · At home, online &amp; our South Delhi centre
            </span>
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.05] drop-shadow-sm">
            Music education, built like an <span className="text-gold">institution.</span>
          </h1>

          <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-paper/85 sm:mt-6 sm:max-w-lg sm:text-lg">
            One teacher matched to the student. One clear method. Every class tracked -
            from first notes to the stage. Across Delhi NCR and online.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <WhatsAppCTA label="Book a free trial" message={WA_MSG.trial} />
            <button type="button" onClick={() => scrollToId("how")}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-paper/90 underline-offset-4 hover:text-paper hover:underline">
              See how it works ↓
            </button>
          </div>

          <p className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-paper/70">
            <span><b className="font-semibold text-paper">10+</b> years</span><Dot />
            <span><b className="font-semibold text-paper">1,100+</b> students</span><Dot />
            <span><b className="font-semibold text-paper">200+</b> Trinity passes</span><Dot />
            <span><b className="font-semibold text-paper">5.0★</b> Google</span>
          </p>
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
