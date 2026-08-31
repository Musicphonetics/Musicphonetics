import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { PortalCarousel } from "./PortalCarousel";

// THE MUSICPHONETICS PORTAL. A calm, self-contained section: a quiet intro, a
// swipe carousel of the real portal screens, and a quiet close, then the site
// continues. It is a component the visitor chooses to explore, not a takeover.
export function PortalShowcase() {
  return (
    <section id="portal" className="overflow-hidden bg-paper py-16 sm:py-24">
      {/* Intro */}
      <Reveal>
        <div className="container-mp text-center">
          <p className="font-display text-[0.95rem] italic text-ink/45">What if you could actually see your child learn?</p>
          <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-deep-gold">The Musicphonetics Portal</p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,5.5vw,3rem)] font-semibold leading-[1.05] text-ink">
            Your child&apos;s music journey.
            <span className="mt-1 block font-script text-[1.15em] font-bold text-gold">Finally visible.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1rem] leading-relaxed text-ink/60">
            Everything, from lessons and goals to progress, reports and fees, in one place.
          </p>
          <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink/40">Swipe to explore →</p>
        </div>
      </Reveal>

      {/* Carousel */}
      <div className="mt-12">
        <PortalCarousel />
      </div>

      {/* Close */}
      <Reveal>
        <div className="container-mp mt-16 text-center">
          <h3 className="font-display text-[clamp(1.5rem,4.5vw,2.2rem)] font-semibold text-ink">That&apos;s the difference.</h3>
          <p className="mx-auto mt-3 max-w-md text-[1rem] leading-relaxed text-ink/60">Not just music lessons. A complete learning journey you can actually see.</p>
          <Link href="/studio" className="mt-7 inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-4 text-sm font-semibold text-cream shadow-[0_16px_40px_-12px_rgba(22,27,38,0.5)] transition hover:brightness-125">
            Start their journey
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
