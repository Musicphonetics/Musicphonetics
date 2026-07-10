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
            Guitar, piano/keyboard &amp; vocal classes for children, beginners &amp;
            serious learners in Delhi NCR and online.
          </p>

          {/* Portal card - the reference gives the parent/student login real weight */}
          <div className="mt-8">
            <NightPortalCard />
          </div>

          {/* Two primary actions */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <WhatsAppCTA label="Enquire on WhatsApp" message={WA_MSG.trial} fullWidth className="shadow-[0_10px_30px_-8px_rgba(201,162,39,0.5)]" />
            <a
              href="#programmes"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/[0.06] px-6 py-4 text-base font-semibold text-gold transition-colors hover:border-gold/70 hover:bg-gold/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              See Programmes &amp; Fees
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
