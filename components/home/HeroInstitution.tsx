import Link from "next/link";

// Gold outline icons for the feature strip.
function FeatureIcon({ d }: { d: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  { top: "Learn", bottom: "Your Way", d: "M4 19V5m0 14h16M8 15l3-4 2 2 3-5" },
  { top: "Track", bottom: "Progress", d: "M5 21V9m7 12V4m7 17v-8" },
  { top: "Expert", bottom: "Teachers", d: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" },
  { top: "Stage", bottom: "Opportunities", d: "M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z" },
];

// Instruments we teach, clean line icons, no faces, no cheap emoji.
const INSTRUMENTS: { name: string; d: string }[] = [
  { name: "Guitar", d: "M15.5 3.5l1.6 1.6M14 5l2 2m-2.6.6a3 3 0 00-4.2 0l-3.5 3.5a3.5 3.5 0 104.9 4.9l3.5-3.5a3 3 0 000-4.2zM8.5 12.5a1 1 0 100-2 1 1 0 000 2z" },
  { name: "Piano", d: "M4 5h16v14H4zM9 5v9M15 5v9M4 14h16" },
  { name: "Vocals", d: "M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v4" },
  { name: "Keyboard", d: "M3 8h18v8H3zM7 8v5M11 8v5M15 8v5" },
  { name: "Ukulele", d: "M14 4l1.5 1.5M8.5 8a2.5 2.5 0 013.5 0 2.5 2.5 0 010 3.5l-2.8 2.8a3 3 0 11-4.2-4.2z" },
  { name: "Drums", d: "M4 9c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9" },
];

// A single flowing gold quaver used as a decorative accent.
function Note({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9 17.5a3 3 0 11-3-3c.4 0 .8.08 1.2.23V4.5l9-2v9.8a3 3 0 11-2-2.83V6.06l-5 1.1v8.3c.13.32.2.68.2 1.04z" />
    </svg>
  );
}

// White, premium hero. No faces: a bold headline with a gold script accent and,
// beside it, an "at a glance" brand card, what we teach, exam pathway, and the
// Google rating, so a first-time visitor understands the school in seconds.
export function HeroInstitution() {
  return (
    <section className="relative -mt-16 flex min-h-[100svh] flex-col overflow-hidden bg-white" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Soft ambient wash. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-12vw] top-[-6vh] h-[42rem] w-[42rem] rounded-full bg-gold/[0.07] blur-[120px]" />
        <div className="absolute left-[-16vw] bottom-[-10vh] h-[34rem] w-[34rem] rounded-full bg-gold/[0.05] blur-[120px]" />
      </div>

      <div className="container-mp relative z-10 flex flex-1 flex-col pb-8 pt-28 lg:pt-28">
        <div className="flex flex-col gap-y-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-x-14">
          {/* TEXT */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/60 bg-gold/[0.06] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-deep-gold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gold" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
              Learn. Practise. Perform.
            </span>

            <h1 className="mt-6 max-w-[15ch] font-body text-[clamp(2.5rem,9vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-charcoal">
              Structured Music Learning
              <span className="relative mt-1 block w-fit font-script text-[1.15em] font-bold leading-none text-gold">
                That Lasts.
                <svg viewBox="0 0 240 16" fill="none" aria-hidden="true" className="absolute -bottom-2 left-1 w-[86%] text-gold">
                  <path d="M4 10c56-7 150-7 232 2" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-8 max-w-[26rem] text-[1.05rem] font-medium leading-relaxed text-charcoal/70">
              A one-to-one music school in Delhi NCR and online, a matched teacher, a real curriculum, tracked progress in a live parent portal, and a stage to perform on.
            </p>

            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link href="/studio"
                className="inline-flex items-center gap-3 rounded-full bg-charcoal px-8 py-4 text-base font-semibold text-cream shadow-[0_16px_40px_-12px_rgba(22,27,38,0.5)] transition hover:brightness-125">
                Book a Free Trial
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <a href="#programmes" className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-charcoal underline decoration-gold decoration-2 underline-offset-[6px] transition-colors hover:text-deep-gold">
                See Programmes
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>

            {/* Portal cue: the differentiator, leading into the reveal below. */}
            <a href="#how" className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/[0.06] py-2 pl-2 pr-4 transition hover:border-gold/70">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-charcoal text-cream">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="12" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M10.5 6.5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              </span>
              <span className="text-[0.8rem] font-semibold text-charcoal">Explore the Student Portal</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-deep-gold"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>

          {/* SHOWCASE: an "at a glance" brand card, no faces */}
          <div className="relative order-2 mx-auto w-full max-w-[24rem] lg:col-start-2 lg:row-span-2 lg:max-w-md">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2.5rem] bg-gold/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-line/60 bg-white p-6 shadow-[0_30px_70px_-30px_rgba(22,27,38,0.4)] sm:p-7">
              {/* gold corner motif */}
              <div aria-hidden="true" className="absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-gold/15" />
              <Note className="absolute right-4 top-4 h-5 w-5 text-gold/70" />

              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-deep-gold">What we teach</p>
              <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5">
                {INSTRUMENTS.map((ins) => (
                  <div key={ins.name} className="flex flex-col items-center gap-2 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line/70 bg-cream/60 text-charcoal">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d={ins.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="text-[0.72rem] font-semibold text-charcoal/80">{ins.name}</span>
                  </div>
                ))}
              </div>

              <div className="my-6 h-px bg-line/70" />

              <div className="flex items-stretch gap-3">
                <div className="flex-1 rounded-2xl bg-charcoal px-4 py-3 text-cream">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xl font-bold leading-none">4.8</span>
                    <span className="flex text-gold" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
                      ))}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.72rem] text-cream/70">Rated on Google</p>
                </div>
                <div className="flex-1 rounded-2xl border border-line/70 bg-cream/50 px-4 py-3">
                  <p className="font-display text-xl font-bold leading-none text-charcoal">Trinity</p>
                  <p className="mt-1 text-[0.72rem] text-charcoal/70">Exam pathway, London</p>
                </div>
              </div>
            </div>
          </div>

          {/* PROOF */}
          <div className="order-3 lg:col-start-1 lg:row-start-2">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-deep-gold ring-1 ring-gold/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </span>
              <p className="text-[0.9rem] leading-tight text-charcoal/75">
                <b className="font-bold text-charcoal">1,100+ students</b>
                <br className="sm:hidden" /> growing with Musicphonetics since 2015
              </p>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-12 grid grid-cols-4 divide-x divide-line/70 rounded-2xl bg-white py-5 shadow-[0_20px_50px_-24px_rgba(22,27,38,0.35)] ring-1 ring-line/50">
          {FEATURES.map((f) => (
            <div key={f.top} className="flex flex-col items-center gap-2 px-1.5 text-center">
              <FeatureIcon d={f.d} />
              <span className="text-[0.72rem] font-semibold leading-tight text-charcoal sm:text-sm">
                {f.top}
                <br />
                {f.bottom}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
