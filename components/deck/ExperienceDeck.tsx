import Link from "next/link";
import { ChapterDeck } from "@/components/deck/ChapterDeck";
import { DeckCarousel } from "@/components/deck/DeckCarousel";
import { InstrumentCarousel } from "@/components/deck/InstrumentCarousel";
import { TIERS } from "@/lib/programTiers";
import { REVIEWS } from "@/lib/home-config";


const LABELS = ["Discover", "Philosophy", "Instruments", "Journey", "Stories", "Packages", "Begin"];
const TIER_LIST = [TIERS.foundation, TIERS.main, TIERS.signature, TIERS.abhishek];

// A full-height chapter frame. `image` is a full-bleed background (with parallax
// depth); content sits over it. Everything fits inside the viewport by design.
function Frame({ children, image, overlay = true, className = "", justify = "center" }: {
  children: React.ReactNode; image?: string; overlay?: boolean; className?: string; justify?: "center" | "end";
}) {
  return (
    <div className={"relative h-full w-full overflow-hidden " + className}>
      {image && (
        <div data-depth="bg" className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
          {overlay && <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/75 via-[#0a0d14]/40 to-[#0a0d14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent" />
          </>}
        </div>
      )}
      {!image && <div className="absolute inset-0" style={{ background: "radial-gradient(65% 55% at 50% 30%, rgba(231,203,110,0.14), transparent 70%)" }} />}
      <div className={"relative z-10 flex h-full flex-col px-6 pb-24 pt-24 sm:px-12 " + (justify === "end" ? "justify-end" : "justify-center")}>
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}

const eyebrow = "text-[11px] font-bold uppercase tracking-[0.24em] text-gold";

export function ExperienceDeck() {
  return (
    <ChapterDeck labels={LABELS}>
      {/* 01 — DISCOVER (cover) */}
      <Frame image="/gallery/03-stage-guitar.jpg" justify="end">
        <div data-reveal className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-paper backdrop-blur">★ 4.8 on Google</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-paper backdrop-blur">Est. 2015 · Delhi NCR</span>
        </div>
        <h1 data-reveal className="mt-4 font-display text-[2.7rem] font-black leading-[1.02] text-paper sm:text-6xl">
          Music education,<br />built like an <span className="text-gold">institution.</span>
        </h1>
        <p data-reveal className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/80">
          One matched mentor. A real curriculum. Every class tracked — and a stage to perform on.
        </p>
        <div data-reveal className="mt-6">
          <Link href="/studio" className="rounded-full bg-gold px-8 py-4 text-base font-bold text-ink transition hover:bg-[#f0d783]">Book a free trial →</Link>
        </div>
      </Frame>

      {/* 02 — PHILOSOPHY */}
      <Frame>
        <p data-reveal className={eyebrow}>Our philosophy</p>
        <h2 data-reveal className="mt-4 font-display text-[2.6rem] font-black leading-[1.05] text-paper sm:text-6xl">
          We don&rsquo;t teach songs.<br /><span className="text-gold">We build musicians.</span>
        </h2>
        <p data-reveal className="mt-6 max-w-md text-[16px] leading-relaxed text-paper/70">
          Anyone can copy a tune. We build real musicianship — technique, ear, theory and stage-craft — so the music stays with you for life.
        </p>
      </Frame>

      {/* 03 — INSTRUMENTS */}
      <Frame>
        <p data-reveal className={eyebrow + " text-center"}>Choose your instrument</p>
        <h2 data-reveal className="mt-2 text-center font-display text-3xl font-black text-paper sm:text-4xl">What will you play?</h2>
        <div data-reveal className="mt-8"><InstrumentCarousel /></div>
      </Frame>

      {/* 04 — JOURNEY */}
      <Frame>
        <p data-reveal className={eyebrow}>How the journey works</p>
        <h2 data-reveal className="mt-3 font-display text-[2.1rem] font-black leading-[1.08] text-paper sm:text-5xl">Four steps. One musician.</h2>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { n: "01", t: "Discover", d: "A free trial + your personalised plan." },
            { n: "02", t: "Match", d: "Your mentor, chosen and confirmed." },
            { n: "03", t: "Grow", d: "Structured classes, tracked every week." },
            { n: "04", t: "Perform", d: "Open mics, showcases, exams." },
          ].map((s, i) => (
            <div key={s.n} data-reveal style={{ transitionDelay: `${0.12 + i * 0.08}s` }} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
              <span className="font-display text-base font-black text-gold">{s.n}</span>
              <p className="mt-1.5 font-display text-lg font-bold text-paper">{s.t}</p>
              <p className="mt-1 text-[13px] leading-snug text-paper/60">{s.d}</p>
            </div>
          ))}
        </div>
      </Frame>

      {/* 05 — STORIES / PROOF */}
      <Frame>
        <p data-reveal className={eyebrow + " text-center"}>Proof</p>
        <div data-reveal className="mt-3 flex items-center justify-center gap-3">
          <span className="font-display text-6xl font-black text-paper">4.8</span>
          <span className="text-xl text-gold">★★★★★</span>
        </div>
        <p data-reveal className="mt-1 text-center font-display text-base font-bold text-paper">1,100+ students · 200+ Trinity passes</p>
        <div data-reveal className="mt-6">
          <DeckCarousel count={Math.min(REVIEWS.length, 6)}>
            {REVIEWS.slice(0, 6).map((f) => (
              <div key={f} data-card className="w-full shrink-0 snap-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/reviews/${f}`} alt="Google review" loading="lazy" className="mx-auto max-h-[40vh] w-full rounded-2xl border border-gold/25 object-contain" />
              </div>
            ))}
          </DeckCarousel>
        </div>
      </Frame>

      {/* 06 — PACKAGES */}
      <Frame>
        <p data-reveal className={eyebrow}>Packages</p>
        <h2 data-reveal className="mt-2 font-display text-3xl font-black text-paper sm:text-4xl">A path for every stage.</h2>
        <div data-reveal className="mt-6">
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
      </Frame>

      {/* 07 — BEGIN */}
      <Frame image="/gallery/02-openmic.jpg" justify="center" className="text-center">
        <p data-reveal className={eyebrow}>Your first note is waiting</p>
        <h2 data-reveal className="mt-4 font-display text-[2.7rem] font-black leading-[1.03] text-paper sm:text-6xl">Begin your<br /><span className="text-gold">music story.</span></h2>
        <p data-reveal className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-paper/80">Your first class is free. No card, no obligation — just you and your instrument.</p>
        <div data-reveal className="mt-7">
          <Link href="/studio" className="rounded-full bg-gold px-9 py-4 text-base font-bold text-ink transition hover:bg-[#f0d783]">Book my free trial →</Link>
        </div>
      </Frame>
    </ChapterDeck>
  );
}
