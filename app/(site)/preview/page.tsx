import type { Metadata } from "next";
import Link from "next/link";
import { SlideDeck } from "@/components/deck/SlideDeck";
import { DeckSlide } from "@/components/deck/DeckSlide";
import { DeckCarousel } from "@/components/deck/DeckCarousel";
import { TIERS } from "@/lib/programTiers";
import { REVIEWS } from "@/lib/home-config";

export const metadata: Metadata = { title: "Preview — Musicphonetics", robots: { index: false } };

const glow = (pos: string) => (
  <>
    <div className="absolute inset-0 bg-[#0a0d14]" />
    <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at ${pos}, rgba(231,203,110,0.18), transparent 70%)` }} />
  </>
);

const PILLARS = [
  { n: "01", t: "Match", d: "Your teacher, chosen for you." },
  { n: "02", t: "Method", d: "A real, structured curriculum." },
  { n: "03", t: "Track", d: "Every class logged in your portal." },
  { n: "04", t: "Perform", d: "A real stage — open mics & exams." },
];

const TIER_LIST = [TIERS.foundation, TIERS.main, TIERS.signature, TIERS.abhishek];

// A cinematic, bespoke slide-deck homepage (preview only — noindex). Each slide
// is exactly one screen; one flick per section; bold layered reveals.
export default function PreviewPage() {
  return (
    <SlideDeck>
      {/* 1 — HERO (full-bleed stage image, content anchored low) */}
      <DeckSlide
        align="end"
        maxW="max-w-xl"
        bg={
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gallery/03-stage-guitar.jpg" alt="A Musicphonetics student performing on stage" className="h-full w-full object-cover object-[50%_30%]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/70 via-[#0a0d14]/30 to-[#0a0d14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent" />
          </>
        }
      >
        <div data-reveal data-delay="1" className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-paper backdrop-blur">★ 4.8 on Google</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-paper backdrop-blur">1,100+ students</span>
        </div>
        <h1 data-reveal data-delay="2" className="mt-4 font-display text-[2.6rem] font-black leading-[1.03] text-paper">
          Music education,<br />built like an <span className="text-gold">institution.</span>
        </h1>
        <p data-reveal data-delay="3" className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/80">
          One matched teacher. A real curriculum. Every class tracked — and a stage to perform on.
        </p>
        <div data-reveal data-delay="4" className="mt-6 flex items-center gap-3">
          <Link href="/studio" className="rounded-full bg-gold px-7 py-3.5 text-base font-bold text-ink transition hover:bg-[#f0d783]">Book a free trial →</Link>
          <span className="text-sm font-semibold text-paper/70">Free first class</span>
        </div>
      </DeckSlide>

      {/* 2 — THE METHOD */}
      <DeckSlide bg={glow("80% 25%")}>
        <p data-reveal data-delay="1" className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">The Musicphonetics way</p>
        <h2 data-reveal data-delay="2" className="mt-3 font-display text-[2rem] font-black leading-[1.08] text-paper sm:text-4xl">
          One teacher. One method.<br />Every class tracked.
        </h2>
        <div className="mt-7 grid grid-cols-2 gap-3">
          {PILLARS.map((p, i) => (
            <div key={p.n} data-reveal data-delay={i + 2} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
              <span className="font-display text-base font-black text-gold">{p.n}</span>
              <p className="mt-1.5 font-display text-lg font-bold leading-tight text-paper">{p.t}</p>
              <p className="mt-1 text-[13px] leading-snug text-paper/60">{p.d}</p>
            </div>
          ))}
        </div>
        <p data-reveal data-delay="5" className="mt-6 text-sm text-paper/55">Guitar · Piano · Keyboard · Vocals &amp; more — for every age and level.</p>
      </DeckSlide>

      {/* 3 — PROGRAMMES (carousel) */}
      <DeckSlide bg={glow("50% 20%")}>
        <p data-reveal data-delay="1" className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Programmes</p>
        <h2 data-reveal data-delay="2" className="mt-3 font-display text-[2.3rem] font-black leading-[1.05] text-paper sm:text-4xl">A path for every stage.</h2>
        <div data-reveal data-delay="3" className="mt-6">
          <DeckCarousel count={TIER_LIST.length}>
            {TIER_LIST.map((t) => (
              <div key={t.key} data-card className="w-full shrink-0 snap-center">
                <div className="rounded-[26px] border border-gold/45 bg-gradient-to-b from-gold/[0.14] to-transparent p-6 shadow-[0_0_60px_-20px_rgba(231,203,110,0.5)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-2xl font-black text-paper">{t.name}</h3>
                      <p className="text-sm text-gold">{t.tagline}</p>
                    </div>
                    {t.badge && <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold uppercase text-ink">{t.badge}</span>}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    {t.strike && <span className="text-lg text-paper/40 line-through">{t.strike}</span>}
                    <span className="font-display text-3xl font-black text-paper">{t.price}</span>
                    <span className="text-sm text-paper/55">{t.unit || ""}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {t.points.slice(0, 3).map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-paper/85">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gold text-[10px] text-ink">✓</span>{pt}
                      </li>
                    ))}
                  </ul>
                  <Link href="/studio" className="mt-5 block rounded-full bg-gold px-6 py-3.5 text-center text-sm font-bold text-ink transition hover:bg-[#f0d783]">Book a free trial →</Link>
                </div>
              </div>
            ))}
          </DeckCarousel>
        </div>
      </DeckSlide>

      {/* 4 — PROOF */}
      <DeckSlide bg={glow("50% 80%")} contentClassName="text-center">
        <p data-reveal data-delay="1" className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Proof</p>
        <div data-reveal data-delay="2" className="mt-4 flex items-center justify-center gap-3">
          <span className="font-display text-6xl font-black text-paper">4.8</span>
          <span className="text-2xl text-gold">★★★★★</span>
        </div>
        <p data-reveal data-delay="2" className="mt-1 text-sm text-paper/60">on Google</p>
        <p data-reveal data-delay="3" className="mt-5 font-display text-lg font-bold text-paper">1,100+ students · 200+ Trinity passes · 10+ years</p>
        <div data-reveal data-delay="4" className="mt-6">
          <DeckCarousel count={Math.min(REVIEWS.length, 6)}>
            {REVIEWS.slice(0, 6).map((f) => (
              <div key={f} data-card className="w-full shrink-0 snap-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/reviews/${f}`} alt="Google review from a Musicphonetics family" loading="lazy" className="mx-auto max-h-[38vh] w-full rounded-2xl border border-gold/25 object-contain" />
              </div>
            ))}
          </DeckCarousel>
        </div>
        <Link href="/studio" data-reveal data-delay="5" className="mx-auto mt-7 block w-full max-w-xs rounded-full bg-gold px-8 py-4 text-base font-bold text-ink transition hover:bg-[#f0d783]">Book a free trial →</Link>
      </DeckSlide>
    </SlideDeck>
  );
}
