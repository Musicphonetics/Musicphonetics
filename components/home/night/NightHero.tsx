import { WhatsAppCTA } from "../WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";
import { NightPortalCard } from "./NightPortalCard";

// Cinematic, fully-dark hero. A real student-on-stage photo bled to the right,
// warm gold ambiance, then the two primary actions and the portal card - so the
// whole first screen reads like a premium product, not a brochure.
export function NightHero() {
  return (
    <section className="relative -mt-16 overflow-hidden bg-onyx text-paper">
      {/* Photo - a real student on a real stage, warmed and darkened to mood */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img
          src="/images/moments/03-stage-guitar.webp"
          alt=""
          // @ts-expect-error fetchpriority is a valid html attr
          fetchpriority="high"
          decoding="async"
          className="absolute right-0 top-0 h-full w-[78%] object-cover object-[60%_35%] opacity-80 sm:w-[62%] lg:w-[55%]"
        />
        {/* Warm gold grade over the photo so it stops reading as a daytime snapshot */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_78%_28%,rgba(201,162,39,0.28),transparent_70%)] mix-blend-soft-light" />
        {/* Legibility: onyx from the left and bottom so headline always reads */}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/85 to-onyx/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
        {/* Floating gold notes for the cinematic ambiance */}
        <span className="mp-note" style={{ top: "16%", right: "10%" }}>♪</span>
        <span className="mp-note" style={{ top: "30%", right: "26%", animationDelay: "1.4s" }}>♫</span>
        <span className="mp-note" style={{ top: "9%", right: "34%", animationDelay: "2.6s" }}>♬</span>
      </div>

      <div className="container-mp relative flex min-h-[100svh] flex-col justify-end pb-8 pt-24 sm:min-h-[90vh] sm:justify-center sm:pb-14 sm:pt-28">
        <div className="max-w-xl">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] py-2 pl-2.5 pr-4 backdrop-blur-sm">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gold/15 text-gold">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l7 3v6c0 4.5-3 8-7 11-4-3-7-6.5-7-11V5l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="text-[0.78rem] font-medium leading-tight text-paper/85">
              Trusted by parents &amp; students across Delhi NCR
            </span>
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.8rem,11vw,4.75rem)] font-medium leading-[1.02]">
            Structured
            <br />
            <span className="text-gold">music learning.</span>
          </h1>
          <span aria-hidden="true" className="mt-5 block h-1 w-16 rounded-full bg-gold" />

          <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-paper/75 sm:text-lg">
            A proper music school - not random classes. One matched teacher, a real
            step-by-step method, and every class tracked. Guitar, piano/keyboard &amp;
            vocals, at home &amp; online across Delhi NCR.
          </p>

          {/* Two primary actions - Apply now leads to programmes → fees → payment */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href="#programmes"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-semibold text-ink shadow-[0_12px_34px_-8px_rgba(201,162,39,0.6)] transition-colors hover:bg-deep-gold"
            >
              Apply now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <WhatsAppCTA label="Enquire on WhatsApp" message={WA_MSG.trial} variant="outline" fullWidth />
          </div>

          {/* Parent / Student login */}
          <div className="mt-4">
            <NightPortalCard />
          </div>
        </div>
      </div>
    </section>
  );
}
