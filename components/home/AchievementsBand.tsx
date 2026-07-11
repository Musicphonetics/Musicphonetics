import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ACHIEVEMENTS } from "@/lib/home-config";

// Short and crisp - what a student actually gets, as swipeable image cards with
// the text written over the photo. Replaces the long Foundation write-up.
export function AchievementsBand() {
  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="container-mp">
        <SectionHeader eyebrow="What you'll get" title="Real milestones, not just lessons." />
      </div>

      <div role="region" aria-label="What you'll get" tabIndex={0} className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:px-8 lg:justify-center">
        {ACHIEVEMENTS.map((a, i) => (
          <Reveal key={a.title} delay={(i % 4) * 70}>
            <figure className="relative h-[360px] w-[74vw] max-w-[260px] shrink-0 snap-center overflow-hidden rounded-3xl border border-hairline shadow-card sm:w-[240px]">
              <img src={a.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gold font-display text-sm font-bold text-ink">{i + 1}</span>
                <p className="mt-3 font-display text-xl font-semibold leading-tight text-white">{a.title}</p>
                <p className="mt-1 text-sm text-white/80">{a.sub}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
        <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
      </div>

      <div className="container-mp mt-4">
        <p className="flex items-center gap-2 text-xs text-ink/70 lg:justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 7l5 5-5 5M5 7l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Swipe · your live progress lives inside the parent portal
        </p>
      </div>
    </section>
  );
}
