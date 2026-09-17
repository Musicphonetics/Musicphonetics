import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ACHIEVEMENTS, type AchievementIcon } from "@/lib/home-config";

// What a student actually gets, as swipeable milestone cards. Icon-led rather
// than photo-led, so we never publish images of children (child privacy /
// POCSO) while keeping the section premium on the dark background.
const ICON: Record<AchievementIcon, React.ReactNode> = {
  song: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V5l10-2v13" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.7" /><circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.7" /></svg>
  ),
  ensemble: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8.5" cy="9" r="3" stroke="currentColor" strokeWidth="1.7" /><circle cx="16.5" cy="10.5" r="2.4" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 19a5 5 0 0 1 10 0M14 18.5a4 4 0 0 1 6.5-3.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  ),
  recognition: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.7" /><path d="M12 6.6l.9 1.8 2 .3-1.45 1.4.34 2L12 11.15 10.2 12.1l.34-2L9.1 8.7l2-.3L12 6.6ZM8.5 14l-1.6 6L12 17.6 17.1 20l-1.6-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  ),
  stage: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8.5 21h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  ),
};

export function AchievementsBand() {
  return (
    <section className="bg-charcoal-2 py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader eyebrow="What you'll get" title="Real milestones, not just lessons." invert />
      </div>

      <div role="region" aria-label="What you'll get" tabIndex={0} className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:px-8 lg:justify-center">
        {ACHIEVEMENTS.map((a, i) => (
          <Reveal key={a.title} delay={(i % 4) * 70}>
            <figure className="group relative flex h-[320px] w-[74vw] max-w-[260px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.015] p-6 sm:w-[240px]">
              {/* Big watermark number */}
              <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-8 font-display text-[8rem] font-bold leading-none text-white/[0.04]">{i + 1}</span>
              {/* Soft gold glow */}
              <span aria-hidden="true" className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />

              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold ring-1 ring-inset ring-gold/25">
                {ICON[a.icon]}
              </span>

              <figcaption className="relative">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold/90">Milestone {i + 1}</span>
                <p className="mt-2 font-display text-xl font-semibold leading-tight text-white">{a.title}</p>
                <p className="mt-1.5 text-sm leading-snug text-white/70">{a.sub}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
        <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
      </div>

      <div className="container-mp mt-4">
        <p className="flex items-center gap-2 text-xs text-ivory/60 lg:justify-center">
          <span className="flex items-center gap-2 lg:hidden">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 7l5 5-5 5M5 7l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Swipe ·
          </span>
          Your live progress lives inside the student portal
        </p>
      </div>
    </section>
  );
}
