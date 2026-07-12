import { WA_MSG } from "@/lib/home-config";
import { whatsappLink } from "@/lib/data";

// Small gold icons for the feature strip.
function IconPath({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold">
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  { label: "Learn your way", d: "M4 19V5m0 14h16M8 15l3-4 2 2 3-5" },
  { label: "Track progress", d: "M12 3v18M5 21V9m14 12V6" },
  { label: "Expert teachers", d: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" },
  { label: "Stage opportunities", d: "M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z" },
];

// Small clean group photos for the social-proof avatar cluster.
const AVATARS = ["05-group", "09-mentor", "02-openmic", "08-stage"];

// A single floating gold quaver used as a decorative accent.
function Note({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9 17.5a3 3 0 11-3-3c.4 0 .8.08 1.2.23V4.5l9-2v9.8a3 3 0 11-2-2.83V6.06l-5 1.1v8.3c.13.32.2.68.2 1.04z" />
    </svg>
  );
}

// Split institution hero. Warm piano portrait framed in a gold accent shape on
// one side, the promise headline with a script accent on the other. Charcoal
// system, single primary action, static markup for a fast LCP.
export function HeroInstitution() {
  return (
    <section
      className="relative -mt-16 overflow-hidden bg-charcoal"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Ambient warm glow, echoing the photo's golden light. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-10 h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-forest/25 blur-[120px]" />
      </div>

      <div className="container-mp relative pb-16 pt-28 md:pt-32 lg:pb-24">
        <div className="flex flex-col gap-y-10 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-x-16">
          {/* TEXT: top half of the left column on desktop, first on mobile. */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
              Learn. Practise. Perform.
            </span>

            <h1 className="mt-5 font-display text-[clamp(2.35rem,7.5vw,3.9rem)] font-medium leading-[1.04] text-ivory">
              Music education,
              <br />
              built like an{" "}
              <span className="relative inline-block whitespace-nowrap italic text-gold">
                institution.
                <svg viewBox="0 0 200 14" fill="none" aria-hidden="true" className="absolute -bottom-1.5 left-0 w-full text-gold/70">
                  <path d="M3 8c40-6 120-6 194 1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-[42ch] text-[1.0625rem] leading-relaxed text-ivory/80">
              A matched teacher, a real method, and a real stage. Guitar, piano and
              vocals for every age and level, across Delhi NCR and online.
            </p>
          </div>

          {/* VISUAL: right column on desktop, between text and actions on mobile. */}
          <div className="relative order-2 mx-auto w-full max-w-sm lg:col-start-2 lg:row-span-2 lg:max-w-md">
            <div className="relative">
              {/* Offset gold accent frame behind the photo. */}
              <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-gold/40" />
              <div aria-hidden="true" className="absolute -inset-6 rounded-[2.5rem] bg-gold/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-gold/30">
                <img
                  src="/images/hero/piano-girl.webp"
                  alt="A young Musicphonetics student playing piano in warm evening light"
                  // @ts-expect-error fetchpriority is a valid html attribute
                  fetchpriority="high"
                  decoding="async"
                  width={1024}
                  height={1536}
                  className="aspect-[4/5] w-full object-cover object-[62%_28%] lg:aspect-[3/4]"
                />
                <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(to_top,rgba(16,20,29,0.35),transparent_45%)]" />
              </div>

              {/* Floating gold notes. */}
              <Note className="absolute -left-3 top-10 h-6 w-6 text-gold/70 drop-shadow" />
              <Note className="absolute -right-2 top-1/3 h-4 w-4 text-gold-soft/70" />
              <Note className="absolute -left-1 bottom-16 h-3 w-3 text-gold/60" />

              {/* Rating chip. */}
              <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-charcoal-2/90 px-3.5 py-2 backdrop-blur-sm">
                <span className="font-display text-lg font-medium leading-none text-ivory">4.8</span>
                <span className="flex text-gold" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
                  ))}
                </span>
                <span className="text-[0.66rem] leading-tight text-ivory/60">Google<br />&amp; JustDial</span>
              </div>
            </div>
          </div>

          {/* ACTIONS + PROOF: bottom of the left column on desktop, last on mobile. */}
          <div className="order-3 lg:col-start-1 lg:row-start-2">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a href="#programmes"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-8 py-4 font-medium text-charcoal transition hover:brightness-105 sm:w-auto">
                Explore programmes
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a href={whatsappLink(WA_MSG.trial)} target="_blank" rel="noopener noreferrer"
                className="text-[0.95rem] text-ivory/80 underline-offset-4 transition-colors hover:text-gold hover:underline">
                Or book a free trial on WhatsApp
              </a>
            </div>

            {/* Avatars proof row. */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-3">
                {AVATARS.map((name) => (
                  <span key={name} className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-charcoal">
                    <img src={`/images/moments/${name}.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-[0.85rem] leading-tight text-ivory/70">
                <b className="font-medium text-ivory">1,100+ students</b> growing with Musicphonetics
              </p>
            </div>
          </div>
        </div>

        {/* Feature strip. */}
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-3 bg-charcoal-2 px-4 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10">
                <IconPath d={f.d} />
              </span>
              <span className="text-sm font-medium leading-tight text-ivory/85">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
