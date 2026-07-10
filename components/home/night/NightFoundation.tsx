import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

interface Step {
  n: number;
  title: string;
  pct: number;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { n: 1, title: "Getting Started", pct: 100, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c3 1.5 5 4.5 5 8 0 1.8-.6 3-1.4 4H8.4C7.6 14 7 12.8 7 11c0-3.5 2-6.5 5-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="10" r="1.4" fill="currentColor" /><path d="M8.5 15c-1 1.2-1.2 3-1 4.5 1.4-.2 2.6-.8 3.3-1.7M15.5 15c1 1.2 1.2 3 1 4.5-1.4-.2-2.6-.8-3.3-1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { n: 2, title: "Rhythm Basics", pct: 100, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V5l10-2v12" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7" /><circle cx="16.5" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg> },
  { n: 3, title: "Notes & Scales", pct: 60, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 11h16M4 15h16" stroke="currentColor" strokeWidth="1.5" opacity="0.5" /><path d="M8 5v14M14 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> },
  { n: 4, title: "Songs & Application", pct: 25, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="16" r="4" stroke="currentColor" strokeWidth="1.7" /><path d="M13 14.5V5l7-2v9.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg> },
];

function ProgressRing({ pct }: { pct: number }) {
  const done = pct >= 100;
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid h-6 w-6 shrink-0 place-items-center">
      <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.4" className="text-white/12" />
        <circle cx="12" cy="12" r={r} fill="none" strokeWidth="2.4" strokeLinecap="round"
          className={done ? "text-emerald-400" : "text-gold"}
          stroke="currentColor" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      {done && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="absolute text-emerald-400"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </span>
  );
}

// A live-feeling preview of the Foundation journey - four chapters with progress,
// framed as "Level 1" with a locked Level 2 beneath. This is the product, on the
// homepage, exactly as the reference sells it.
export function NightFoundation() {
  return (
    <section className="bg-onyx py-14 sm:py-20">
      <div className="container-mp">
        <Reveal>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Foundation Path</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3 py-1 text-[0.7rem] font-semibold text-emerald-300">
              Level 1 <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          </div>
          <h2 className="mt-3 font-display text-[clamp(1.6rem,6vw,2.2rem)] font-medium leading-tight text-paper">
            Build strong musical fundamentals.
          </h2>
        </Reveal>

        {/* Cards - horizontal snap on mobile, 4-up grid on larger screens */}
        <Reveal>
          <div
            role="region"
            aria-label="Foundation Level 1 chapters"
            tabIndex={0}
            className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4"
          >
            {STEPS.map((s) => {
              const done = s.pct >= 100;
              return (
                <div key={s.n} className="flex min-w-[9.5rem] snap-start flex-col rounded-2xl border border-white/10 bg-onyx-1 p-4 sm:min-w-0">
                  <div className="flex items-start justify-between">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/15 text-[0.8rem] font-bold text-gold">{s.n}</span>
                    <span className="text-gold/80">{s.icon}</span>
                  </div>
                  <h3 className="mt-4 min-h-[2.6rem] font-display text-[0.98rem] font-semibold leading-snug text-paper">{s.title}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressRing pct={s.pct} />
                    <span className={done ? "text-sm font-semibold text-emerald-400" : "text-sm font-semibold text-gold"}>{s.pct}%</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span className={`block h-full rounded-full ${done ? "bg-emerald-400" : "bg-gold"}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-[0.86rem] text-paper/60">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            Complete Level 1 to unlock <span className="font-semibold text-gold">Level 2 · Intermediate</span>
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-6 text-center">
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
