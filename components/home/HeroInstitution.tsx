import { WA_MSG } from "@/lib/home-config";
import { whatsappLink } from "@/lib/data";

// The homepage hero: one confident argument. The promise is the H1 (not the
// brand name), one primary action (Book a free trial), a quiet secondary link,
// and a single-line stat strip. Real photo, charcoal gradient so text always reads.
export function HeroInstitution() {
  return (
    <section className="relative -mt-16 flex min-h-[85vh] items-center overflow-hidden bg-charcoal md:min-h-screen">
      {/* Background photo + overlays */}
      <div aria-hidden="true" className="absolute inset-0">
        <img
          src="/images/moments/03-stage-guitar.webp"
          alt=""
          // @ts-expect-error fetchpriority is a valid html attribute
          fetchpriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[62%_28%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,27,38,0.94),rgba(22,27,38,0.62)_60%,rgba(22,27,38,0.35))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(22,27,38,0.9),transparent_45%)]" />
      </div>

      <div className="container-mp relative w-full pb-16 pt-24 md:pb-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-[22px] bg-gold" />
            <span className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-gold">
              Delhi NCR · at home, online &amp; our South Delhi centre
            </span>
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[1.03] text-ivory">
            Music education, built like an institution.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[1.05rem] leading-relaxed text-ivory/80 sm:text-[1.15rem]">
            A teacher matched to your child, a real method, and a stage to perform on.
            Guitar, piano/keyboard and vocals — across Delhi NCR and online.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href={whatsappLink(WA_MSG.trial)} target="_blank" rel="noopener noreferrer"
              className="rounded-md bg-gold px-6 py-3 font-medium text-charcoal transition hover:brightness-105">
              Book a free trial
            </a>
            <a href="#how" className="group inline-flex items-center gap-1.5 text-[0.95rem] text-ivory/85 transition-colors hover:text-gold">
              See how it works
              <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
            </a>
          </div>

          <p className="mt-12 text-[0.8rem] tracking-wide text-ivory/60">
            10+ years · 1,100+ students · 4.8★ Google &amp; JustDial
          </p>
        </div>
      </div>
    </section>
  );
}
