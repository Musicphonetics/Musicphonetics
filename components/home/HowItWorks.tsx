import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { HOW_STEPS } from "@/lib/home-config";

// A swipeable, app-like "how it works". Each step is a card with a real photo,
// a warm familiar line and a clear explanation - swipe, don't scroll.
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-onyx py-14 sm:py-24">
      <div className="container-mp">
        <SectionHeader eyebrow="How it works" title="A clear path, not random classes." invert />
      </div>

      <Reveal>
        <div
          role="region"
          aria-label="How Musicphonetics works"
          tabIndex={0}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:px-8"
        >
          {HOW_STEPS.map((s, i) => (
            <article key={s.title}
              className="relative w-[80vw] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-onyx-1 sm:w-[340px]">
              {/* Photo */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img src={s.img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-onyx-1 via-onyx-1/20 to-transparent" />
                <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-gold font-display text-sm font-bold text-ink">{i + 1}</span>
              </div>
              {/* Copy */}
              <div className="p-5">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold">{s.kicker}</span>
                <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-paper">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{s.body}</p>
              </div>
            </article>
          ))}
          {/* trailing spacer so the last card can center */}
          <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
        </div>
      </Reveal>

      <div className="container-mp">
        <p className="mt-4 flex items-center gap-2 text-xs text-paper/60">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 7l5 5-5 5M5 7l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Swipe to see the full journey
        </p>
      </div>
    </section>
  );
}
