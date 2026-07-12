import { WA_MSG } from "@/lib/home-config";
import { whatsappLink } from "@/lib/data";

// App-onboarding hero: full screen, content in the lower third for thumb reach,
// a big rounded primary, and a quiet secondary. Safe-area aware.
export function HeroInstitution() {
  return (
    <section
      className="relative -mt-16 flex min-h-[100svh] flex-col justify-end overflow-hidden bg-charcoal"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* LCP background image + bottom-weighted overlay */}
      <div aria-hidden="true" className="absolute inset-0">
        <img
          src="/images/moments/03-stage-guitar.webp"
          alt=""
          // @ts-expect-error fetchpriority is a valid html attribute
          fetchpriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[60%_22%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(22,27,38,0.96),rgba(22,27,38,0.55)_42%,rgba(22,27,38,0.25))]" />
      </div>

      <div
        className="container-mp relative w-full"
        style={{ paddingBottom: "calc(104px + env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-[640px]">
          <span className="inline-flex items-center rounded-full border border-gold/40 px-3 py-1 text-[0.7rem] uppercase tracking-[0.14em] text-gold">
            Delhi NCR, at home, online, and our South Delhi centre
          </span>

          <h1 className="mt-5 font-display text-[clamp(2.25rem,8vw,3.75rem)] font-medium leading-[1.05] text-ivory">
            Music education, built like an institution.
          </h1>

          <p className="mt-4 max-w-[40ch] text-[1.0625rem] leading-relaxed text-ivory/85">
            A matched teacher, a real method, and a real stage. Guitar, piano and vocals,
            across Delhi NCR and online.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4">
            <a href="#programmes"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-charcoal transition hover:brightness-105 md:w-auto md:px-8">
              Explore programmes
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href={whatsappLink(WA_MSG.trial)} target="_blank" rel="noopener noreferrer"
              className="text-[0.95rem] text-ivory/80 underline-offset-4 transition-colors hover:text-gold hover:underline">
              Or book a free trial on WhatsApp
            </a>
          </div>

          <p className="mt-9 text-[0.8rem] tracking-wide text-ivory/60">
            10+ years&nbsp;&nbsp;·&nbsp;&nbsp;1,100+ students&nbsp;&nbsp;·&nbsp;&nbsp;4.8 on Google and JustDial
          </p>
        </div>
      </div>
    </section>
  );
}
