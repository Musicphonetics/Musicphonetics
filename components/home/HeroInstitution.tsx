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

const AVATARS = ["05-group", "09-mentor", "02-openmic"];

// A single flowing gold quaver used as a decorative accent.
function Note({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9 17.5a3 3 0 11-3-3c.4 0 .8.08 1.2.23V4.5l9-2v9.8a3 3 0 11-2-2.83V6.06l-5 1.1v8.3c.13.32.2.68.2 1.04z" />
    </svg>
  );
}

// Warm, light hero. The piano portrait bleeds in from the right over a large
// gold disc; a bold headline with a gold script accent sits on the left, with
// a feature strip and a social-proof row anchored to the bottom.
export function HeroInstitution() {
  return (
    <section className="relative -mt-16 flex min-h-[100svh] flex-col overflow-hidden bg-cream" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Visual layer: gold disc + the portrait, bleeding off the right edge. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-20vw] top-[22%] aspect-square w-[82vw] max-w-[520px] rounded-full bg-gold lg:right-[2vw] lg:top-[12%] lg:w-[40vw]" />
        <div
          className="absolute bottom-[11%] right-0 top-[24%] w-[68%] max-w-[440px] lg:bottom-[8%] lg:top-[10%] lg:w-[46%]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to left, #000 66%, transparent), linear-gradient(to top, transparent, #000 16%)",
            maskImage:
              "linear-gradient(to left, #000 66%, transparent), linear-gradient(to top, transparent, #000 16%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        >
          <img
            src="/images/moments/03-stage-guitar.webp"
            alt="A Musicphonetics student performing guitar on a real stage"
            // @ts-expect-error fetchpriority is a valid html attribute
            fetchpriority="high"
            decoding="async"
            width={900}
            height={1200}
            className="h-full w-full object-cover object-[46%_16%]"
          />
        </div>
      </div>

      {/* Floating gold notes near the top right. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Note className="absolute right-[24%] top-[19%] h-8 w-8 text-gold lg:right-[38%] lg:top-[16%]" />
        <Note className="absolute right-[16%] top-[24%] h-5 w-5 text-gold-soft lg:right-[33%]" />
        <Note className="absolute right-[30%] top-[30%] h-4 w-4 text-gold/80 lg:right-[42%]" />
      </div>

      {/* Content. */}
      <div className="container-mp relative z-10 flex flex-1 flex-col pb-8 pt-28 lg:pt-32">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/60 bg-cream/60 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-deep-gold backdrop-blur-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gold" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
          Learn. Practise. Perform.
        </span>

        <h1 className="mt-6 max-w-[58%] font-body text-[clamp(2.5rem,9.5vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-charcoal sm:max-w-[52%] lg:max-w-[46%]">
          Structured Music Learning
          <span className="relative mt-1 block w-fit font-script text-[1.15em] font-bold leading-none text-gold">
            That Lasts.
            <svg viewBox="0 0 240 16" fill="none" aria-hidden="true" className="absolute -bottom-2 left-1 w-[86%] text-gold">
              <path d="M4 10c56-7 150-7 232 2" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="mt-8 max-w-[19rem] text-[1.05rem] font-medium leading-relaxed text-charcoal/70">
          Guitar, piano, vocals and more, for every age and level.
        </p>

        <div className="mt-8 flex flex-col items-start gap-5">
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

        {/* Feature strip + proof, anchored to the bottom of the screen. */}
        <div className="mt-auto pt-12">
          <div className="grid grid-cols-4 divide-x divide-line/70 rounded-2xl bg-white py-5 shadow-[0_20px_50px_-24px_rgba(22,27,38,0.35)] ring-1 ring-line/50">
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

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-3">
              {AVATARS.map((name) => (
                <span key={name} className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-cream">
                  <img src={`/images/moments/${name}.webp`} alt="" aria-hidden="true" decoding="async" className="h-full w-full object-cover" />
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
    </section>
  );
}
