import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { FOUNDATION_ROADMAP } from "@/lib/home-config";

const ICONS: Record<number, React.ReactNode> = {
  1: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c3 1.5 5 4.5 5 8 0 1.8-.6 3-1.4 4H8.4C7.6 15 7 13.8 7 12c0-3.5 2-6.5 5-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="10" r="1.4" fill="currentColor" /><path d="M8.5 15c-1 1.2-1.2 3-1 4.5 1.4-.2 2.6-.8 3.3-1.7M15.5 15c1 1.2 1.2 3 1 4.5-1.4-.2-2.6-.8-3.3-1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  2: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V5l10-2v12" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7" /><circle cx="16.5" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>,
  3: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="16" r="4" stroke="currentColor" strokeWidth="1.7" /><path d="M13 14.5V5l7-2v9.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>,
  4: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 21l-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
};

// The Foundation curriculum, shown as a swipeable roadmap of what the student
// actually learns - no fake progress bars (real, live progress lives in the
// parent portal, where it's earned class by class).
export function NightFoundation() {
  return (
    <section className="bg-onyx py-14 sm:py-24">
      <div className="container-mp">
        <Reveal>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">The Foundation journey</span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-[0.7rem] font-semibold text-paper/70">32 classes · 4 chapters</span>
          </div>
          <h2 className="mt-3 font-display text-[clamp(1.6rem,6vw,2.2rem)] font-medium leading-tight text-paper">
            For beginners: a real path from first note to the stage.
          </h2>
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-paper/65 sm:text-base">
            Four chapters of eight classes each. Here&apos;s what your child actually learns along the way.
          </p>
        </Reveal>
      </div>

      <Reveal>
        <div
          role="region"
          aria-label="Foundation curriculum chapters"
          tabIndex={0}
          className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:px-8"
        >
          {FOUNDATION_ROADMAP.map((c) => (
            <div key={c.n}
              className="flex w-[78vw] max-w-[290px] shrink-0 snap-center flex-col rounded-3xl border border-white/10 bg-onyx-1 p-6 sm:w-[300px]">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold/12 text-gold">{ICONS[c.n]}</span>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-paper/60">Chapter {c.n}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-paper">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/70">{c.learn}</p>
            </div>
          ))}
          <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
        </div>
      </Reveal>

      <div className="container-mp">
        <Reveal>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-[0.82rem] text-paper/55">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold"><path d="M4 20V10M10 20V4M16 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              Live, class-by-class progress shows up inside your parent portal.
            </p>
            <Link href="/programmes/foundation" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline-offset-4 hover:underline">
              See the full Foundation journey
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
