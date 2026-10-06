import { Reveal } from "@/components/ui/Reveal";

// ============================================================================
// LearningLoop — scroll 2. The core idea: a student's musical journey can be
// continuously understood. A connected loop of moments, each tagged honestly as
// live today or being built. Fully responsive (a vertical spine), no fake data.
// ============================================================================

type Node = {
  k: string;
  title: string;
  line: string;
  live: boolean;
  d: string; // icon path
};

const NODES: Node[] = [
  { k: "01", title: "Learn", line: "A matched teacher, a real curriculum, every class with a purpose.", live: true, d: "M12 4L3 8l9 4 9-4-9-4zM6 10v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4" },
  { k: "02", title: "Practise", line: "Guided home practice — and, in time, practice the system can hear.", live: false, d: "M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z" },
  { k: "03", title: "Perform", line: "Quarterly stages today; performance analysis is being built.", live: false, d: "M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v4" },
  { k: "04", title: "Observe", line: "The teacher records what was taught, accuracy and where it struggled.", live: true, d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z" },
  { k: "05", title: "Assess", line: "Structured notes today, becoming a full competency score.", live: false, d: "M4 4h16v16H4zM8 4v16M4 9h4M4 14h4" },
  { k: "06", title: "Personalise", line: "The next step is chosen for the student, not the other way around.", live: false, d: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a7.9 7.9 0 000-2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 00-1.7-1L14.9 3h-5.8l-.4 2.6a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.4L2.6 11a7.9 7.9 0 000 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 001.7 1l.4 2.4h5.8l.4-2.6a7.5 7.5 0 001.7-1l2.4 1 2-3.4-2-1.6z" },
  { k: "07", title: "Progress", line: "Parents see exactly where their child stands — and what's next.", live: true, d: "M5 21V9m7 12V4m7 17v-8" },
];

export function LearningLoop() {
  return (
    <section id="loop" className="scroll-mt-28 relative overflow-hidden bg-charcoal py-20 text-ivory sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute left-[-10vw] top-1/3 h-[32rem] w-[32rem] rounded-full bg-gold/[0.06] blur-[140px]" />
      <div className="container-mp relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The loop</p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.1rem)] font-medium leading-[1.08]">
              One continuous picture of how a student actually learns.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[1rem] leading-relaxed text-ivory/65">
              Not a lesson that ends and disappears — a loop that keeps understanding the learner and
              feeding that back to the student, the teacher and the parent.
            </p>
            <div className="mt-6 flex items-center justify-center gap-5 text-[0.72rem] font-medium text-ivory/55">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Live today</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-gold/70" /> Being built</span>
            </div>
          </div>
        </Reveal>

        {/* The spine */}
        <div className="relative mx-auto mt-14 max-w-xl">
          <span aria-hidden="true" className="absolute left-[21px] top-2 bottom-10 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-gold/10 sm:left-1/2 sm:-translate-x-1/2" />
          <ul className="space-y-5">
            {NODES.map((n, i) => (
              <Reveal as="li" key={n.k} delay={i * 60}>
                <div className="flex items-start gap-4 sm:gap-5">
                  <span className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border ${n.live ? "border-emerald-400/50 bg-emerald-400/10" : "border-gold/40 bg-gold/[0.07]"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={n.live ? "text-emerald-300" : "text-gold-soft"}><path d={n.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div className="flex-1 rounded-2xl border border-ivory/10 bg-ivory/[0.03] px-4 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-lg font-medium text-ivory">{n.title}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${n.live ? "bg-emerald-400/12 text-emerald-300" : "border border-gold/40 text-gold-soft"}`}>
                        {n.live ? "Live" : "Building"}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.9rem] leading-relaxed text-ivory/60">{n.line}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>

          {/* loop-back cap */}
          <Reveal delay={120}>
            <div className="relative mt-5 flex items-center gap-4 sm:justify-center">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/50 bg-charcoal-2 text-gold sm:hidden">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 019-9 9 9 0 018 5M21 12a9 9 0 01-9 9 9 9 0 01-8-5M17 8h4V4M7 16H3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className="text-[0.85rem] font-medium text-ivory/65">
                <span className="text-gold-soft">↺ And it repeats</span> — every loop makes the next lesson smarter.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
