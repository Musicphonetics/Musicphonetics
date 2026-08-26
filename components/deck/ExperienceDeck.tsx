import Link from "next/link";
import { ChapterDeck } from "@/components/deck/ChapterDeck";
import { DeckCarousel } from "@/components/deck/DeckCarousel";
import { InstrumentCarousel } from "@/components/deck/InstrumentCarousel";
import { TIERS } from "@/lib/programTiers";
import { REVIEWS } from "@/lib/home-config";

const LABELS = ["Discover", "Philosophy", "Why us", "Instruments", "Journey", "Portal", "Stories", "Packages", "Begin"];
const THEMES: ("light" | "dark")[] = ["light", "dark", "dark", "dark", "dark", "dark", "dark", "dark", "dark"];
const TIER_LIST = [TIERS.foundation, TIERS.main, TIERS.signature, TIERS.abhishek];
const eyebrow = "text-[11px] font-bold uppercase tracking-[0.24em] text-gold";

// A full-height dark chapter frame with an optional full-bleed image + depth.
function Frame({ children, image, className = "", justify = "center" }: {
  children: React.ReactNode; image?: string; className?: string; justify?: "center" | "end";
}) {
  return (
    <div className={"relative h-full w-full overflow-hidden bg-[#0a0d14] " + className}>
      {image ? (
        <div data-depth="bg" className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/75 via-[#0a0d14]/40 to-[#0a0d14]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ background: "radial-gradient(65% 55% at 50% 30%, rgba(231,203,110,0.14), transparent 70%)" }} />
      )}
      <div className={"relative z-10 flex h-full flex-col px-6 pb-24 pt-24 sm:px-12 " + (justify === "end" ? "justify-end" : "justify-center")}>
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}

export function ExperienceDeck() {
  return (
    <ChapterDeck labels={LABELS} themes={THEMES}>
      {/* 01 — DISCOVER: the previous light hero style, no face */}
      <div className="relative h-full w-full overflow-hidden bg-paper">
        <div className="absolute inset-0" style={{ background: "radial-gradient(55% 45% at 78% 18%, rgba(201,162,39,0.16), transparent 70%)" }} />
        <div className="pointer-events-none absolute -right-10 bottom-8 select-none font-display text-[13rem] leading-none text-charcoal/[0.04]">♪</div>
        <div className="relative z-10 flex h-full flex-col justify-center px-6 pb-24 pt-24 sm:px-12">
          <div className="mx-auto w-full max-w-xl">
            <span data-reveal className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white/60 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-deep-gold backdrop-blur">
              ★ Learn · Practise · Perform
            </span>
            <h1 data-reveal className="mt-6 font-body text-[clamp(2.6rem,12vw,4.2rem)] font-extrabold leading-[0.98] tracking-tight text-charcoal">
              Structured Music Learning
              <span className="mt-1 block font-script text-[1.18em] font-bold leading-none text-gold">That Lasts.</span>
            </h1>
            <p data-reveal className="mt-7 max-w-sm text-[1.05rem] font-medium leading-relaxed text-charcoal/70">
              Guitar, piano, vocals and more — for every age and level. Taught the right way, by the founder and our faculty.
            </p>
            <div data-reveal className="mt-8 flex items-center gap-4">
              <Link href="/studio" className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-4 text-base font-semibold text-cream shadow-[0_16px_40px_-12px_rgba(22,27,38,0.5)] transition hover:brightness-125">Book a free trial →</Link>
            </div>
          </div>
        </div>
      </div>

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

      {/* 03 — WHY US (why pay) */}
      <Frame>
        <p data-reveal className={eyebrow}>Why families choose us</p>
        <h2 data-reveal className="mt-3 font-display text-[2.1rem] font-black leading-[1.08] text-paper sm:text-5xl">Not a class. A whole system.</h2>
        <div className="mt-7 grid grid-cols-2 gap-3">
          {[
            { i: "🎯", t: "One matched mentor", d: "Chosen for you — never a rotating queue." },
            { i: "📚", t: "A real curriculum", d: "Structured, graded, deliberate." },
            { i: "📲", t: "Tracked every week", d: "Every class logged in your portal." },
            { i: "🏆", t: "Exams & stage", d: "Trinity prep, open mics, showcases." },
          ].map((v, k) => (
            <div key={v.t} data-reveal style={{ transitionDelay: `${0.12 + k * 0.08}s` }} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
              <span className="text-xl">{v.i}</span>
              <p className="mt-1.5 font-display text-base font-bold text-paper">{v.t}</p>
              <p className="mt-1 text-[12px] leading-snug text-paper/60">{v.d}</p>
            </div>
          ))}
        </div>
        <p data-reveal className="mt-6 text-sm text-paper/70">An institution&rsquo;s system — with the care of a personal mentor.</p>
      </Frame>

      {/* 04 — INSTRUMENTS */}
      <Frame>
        <p data-reveal className={eyebrow + " text-center"}>Choose your instrument</p>
        <h2 data-reveal className="mt-2 text-center font-display text-3xl font-black text-paper sm:text-4xl">What will you play?</h2>
        <div data-reveal className="mt-8"><InstrumentCarousel /></div>
      </Frame>

      {/* 05 — JOURNEY */}
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

      {/* 06 — PORTAL (the system, shown) */}
      <Frame>
        <p data-reveal className={eyebrow + " text-center"}>Your private portal</p>
        <h2 data-reveal className="mt-2 text-center font-display text-[1.9rem] font-black leading-tight text-paper sm:text-4xl">You&rsquo;ll always know exactly where you stand.</h2>
        <div data-reveal className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/portal-preview.webp" alt="The Musicphonetics parent portal" className="max-h-[38vh] w-auto rounded-2xl border border-white/12 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.6)]" />
        </div>
        <div data-reveal className="mt-6 flex flex-wrap justify-center gap-2">
          {["After every class: what was taught", "Live progress & attendance", "Fees & renewals, crystal clear", "Monthly report cards"].map((c) => (
            <span key={c} className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[12px] text-paper/80">✓ {c}</span>
          ))}
        </div>
      </Frame>

      {/* 07 — STORIES / PROOF */}
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

      {/* 08 — PACKAGES */}
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

      {/* 09 — BEGIN */}
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
