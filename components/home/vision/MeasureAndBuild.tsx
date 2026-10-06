import { Reveal } from "@/components/ui/Reveal";

// ============================================================================
// MeasureAndBuild — grounds the vision in reality. The left column is literally
// the data captured on every class today (real fields in the platform). The
// right column is the intelligence being built on top. Honest, concrete, no
// invented capabilities.
// ============================================================================

const CAPTURED = [
  "What was taught, every class",
  "Accuracy on the day",
  "Where the student struggled",
  "Practice level set",
  "Subject & attendance",
  "Progress against paid cycles",
  "A written report every month",
  "Fees, clearly accounted",
];

const BUILDING = [
  "A competency score — technique, rhythm, ear, theory, expression, performance",
  "A skill graph per instrument",
  "Adaptive practice plans",
  "Practice intelligence from home recordings",
  "Performance analysis",
  "A teacher intelligence roll-up",
  "Benchmarks across the network",
];

export function MeasureAndBuild() {
  return (
    <section className="relative overflow-hidden bg-charcoal-2 py-20 text-ivory sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(to right, #F5F1E8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at 70% 20%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 70% 20%, black, transparent 75%)",
        }}
      />
      <div className="container-mp relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The data foundation</p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.1rem)] font-medium leading-[1.08]">
              We already record how music is learned — class by class.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[1rem] leading-relaxed text-ivory/65">
              The intelligence isn&apos;t a promise built on nothing. It&apos;s built on structured data the
              platform captures on real students today.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* Live */}
          <Reveal>
            <div className="h-full rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.05] p-6 sm:p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <p className="font-display text-lg font-semibold">Captured today</p>
                <span className="ml-auto rounded-full bg-emerald-400/12 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-emerald-300">Live</span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {CAPTURED.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-[0.92rem] text-ivory/80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-emerald-400"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Building */}
          <Reveal delay={90}>
            <div className="h-full rounded-3xl border border-dashed border-gold/35 bg-gold/[0.04] p-6 sm:p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/15 text-gold-soft">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5l-2 2m-9 9l-2 2m0-13l2 2m9 9l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </span>
                <p className="font-display text-lg font-semibold">Being built on top</p>
                <span className="ml-auto rounded-full border border-gold/40 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-gold-soft">In development</span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {BUILDING.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[0.92rem] text-ivory/70">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-gold/70" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-ivory/55">
            AI isn&apos;t bolted on as a gimmick. It&apos;s the layer that turns this record into something a
            student, a teacher and a parent can act on — with the teacher always in the loop.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
