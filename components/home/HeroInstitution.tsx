import { WA_MSG } from "@/lib/home-config";
import { whatsappLink } from "@/lib/data";

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

const AVATARS = ["/images/classes/jam.webp", "/images/classes/trio.webp", "/images/classes/keys-duet.webp"];

// A single flowing gold quaver used as a decorative accent.
function Note({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9 17.5a3 3 0 11-3-3c.4 0 .8.08 1.2.23V4.5l9-2v9.8a3 3 0 11-2-2.83V6.06l-5 1.1v8.3c.13.32.2.68.2 1.04z" />
    </svg>
  );
}

// Warm, light hero. Real teaching moments from our classes are showcased on one
// side; a bold headline with a gold script accent sits on the other, with a
// feature strip and a social-proof row.
export function HeroInstitution() {
  return (
    <section className="relative -mt-16 flex min-h-[100svh] flex-col overflow-hidden bg-cream" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Soft ambient wash. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10vw] top-0 h-[40rem] w-[40rem] rounded-full bg-gold/12 blur-[120px]" />
      </div>

      <div className="container-mp relative z-10 flex flex-1 flex-col pb-8 pt-28 lg:pt-28">
        <div className="flex flex-col gap-y-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-x-14">
          {/* TEXT */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/60 bg-white/50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-deep-gold backdrop-blur-sm">
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

            <p className="mt-8 max-w-[24rem] text-[1.05rem] font-medium leading-relaxed text-charcoal/70">
              Guitar, piano, vocals and more, for every age and level. Taught the right way, by the founder and our faculty.
            </p>

            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <a href={whatsappLink(WA_MSG.trial)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-charcoal px-8 py-4 text-base font-semibold text-cream shadow-[0_16px_40px_-12px_rgba(22,27,38,0.5)] transition hover:brightness-125">
                Book a Trial Class
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a href="#programmes" className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-charcoal underline decoration-gold decoration-2 underline-offset-[6px] transition-colors hover:text-deep-gold">
                See Programmes
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </div>

          {/* SHOWCASE: real class photos */}
          <div className="relative order-2 mx-auto w-full max-w-[22rem] lg:col-start-2 lg:row-span-2 lg:max-w-md">
            <div className="relative pb-10 pl-10">
              {/* gold circle motif behind the main photo */}
              <div aria-hidden="true" className="absolute right-2 top-[-6%] aspect-square w-[72%] rounded-full bg-gold/90" />
              <div aria-hidden="true" className="absolute -inset-2 rounded-[3rem] bg-gold/10 blur-2xl" />

              {/* main teaching photo */}
              <div className="relative overflow-hidden rounded-[2rem] shadow-[0_30px_70px_-25px_rgba(22,27,38,0.55)] ring-1 ring-white/60">
                <img
                  src="/images/classes/ukulele.webp"
                  alt="The founder of Musicphonetics teaching a young student the ukulele"
                  // @ts-expect-error fetchpriority is a valid html attribute
                  fetchpriority="high"
                  decoding="async"
                  width={1290}
                  height={2450}
                  className="aspect-[4/5] w-full object-cover object-[50%_18%]"
                />
              </div>

              {/* overlapping second photo, for a collage feel */}
              <div className="absolute bottom-0 left-0 w-[46%] overflow-hidden rounded-2xl shadow-[0_18px_40px_-16px_rgba(22,27,38,0.6)] ring-4 ring-cream">
                <img src="/images/classes/jam.webp" alt="A Musicphonetics student and the founder playing music together in class"
                  loading="lazy" decoding="async" className="aspect-[5/4] w-full object-cover object-center" />
              </div>

              {/* rating chip */}
              <div className="absolute right-1 top-1 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md ring-1 ring-line/50">
                <span className="font-display text-sm font-semibold leading-none text-charcoal">4.8</span>
                <span className="flex text-gold" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
                  ))}
                </span>
              </div>

              {/* floating notes */}
              <Note className="absolute right-[-4%] top-1/3 h-6 w-6 text-gold" />
              <Note className="absolute left-1 top-2 h-4 w-4 text-gold-soft" />
            </div>
          </div>

          {/* PROOF */}
          <div className="order-3 lg:col-start-1 lg:row-start-2">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {AVATARS.map((src) => (
                  <span key={src} className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-cream">
                    <img src={src} alt="" aria-hidden="true" decoding="async" className="h-full w-full object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-[0.9rem] leading-tight text-charcoal/75">
                <b className="font-bold text-charcoal">1,100+ students</b>
                <br className="sm:hidden" /> growing with Musicphonetics
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
