"use client";

import { Button } from "@/components/ui/Button";
import { Stave } from "@/components/ui/Stave";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function TeachHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ink via-ink to-feature-green/60 text-paper">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
      <Stave className="pointer-events-none absolute bottom-8 left-1/2 w-[280px] -translate-x-1/2 opacity-20" />

      <div className="container-mp relative py-20 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-gold" /></span>
          Now recruiting faculty · Delhi NCR &amp; online
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
          Teach music. Earn what your craft is <span className="italic text-gold">actually worth.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/80">
          Students, schedule, payments and the whole system are handled for you.
          You walk into a ready ecosystem and teach. You keep 70% of every fee.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => scrollToId("apply")} size="lg" variant="light">
            Apply to Teach
          </Button>
          <Button type="button" onClick={() => scrollToId("calculator")} size="lg" variant="secondary" className="border-white/25 text-paper hover:border-white">
            See what you&apos;ll earn
          </Button>
        </div>
      </div>
    </section>
  );
}
