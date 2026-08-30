import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { PortalCarousel } from "./PortalCarousel";

// THE MUSICPHONETICS STUDENT PORTAL — the system behind the teaching, revealed as
// a premium product. Sits right after the hero as the primary differentiator, then
// leads naturally into the existing packages / fees / reviews / trial flow. Built
// entirely from the existing brand tokens (charcoal, cream, gold, serif + sans).
export function PortalShowcase() {
  return (
    <section id="portal" className="relative overflow-hidden bg-charcoal py-20 md:py-28">
      {/* soft gold wash, matching the site's dark sections */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gold/[0.08] blur-[130px]" />
      </div>

      <div className="container-mp relative z-10">
        {/* Intro: education → the system behind it */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gold">
              <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
              The Musicphonetics Student Portal
              <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
            </div>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,5.5vw,3rem)] font-medium leading-[1.05] text-ivory">
              Your child&apos;s music journey.
              <span className="mt-1 block font-script text-[1.1em] text-gold">Finally, visible.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[1rem] leading-relaxed text-ivory/65">
              We don&apos;t just teach music. Every learner gets a structured journey, and their own portal to see it, updated by their teacher after every class.
            </p>
          </div>
        </Reveal>

        {/* The 7-screen reveal */}
        <div className="mt-12 md:mt-16">
          <PortalCarousel />
        </div>

        {/* Bridge into the existing offer */}
        <Reveal>
          <div className="mx-auto mt-14 max-w-xl text-center">
            <p className="text-[1rem] leading-relaxed text-ivory/70">
              This is the system behind every month with Musicphonetics. Not eight classes and a bill, a structured path you can actually follow.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#programmes" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-[#f0d783]">
                See the packages
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <Link href="/studio" className="inline-flex items-center gap-2 text-sm font-semibold text-ivory/80 underline decoration-gold decoration-2 underline-offset-[6px] transition hover:text-ivory">
                Book a free trial
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
