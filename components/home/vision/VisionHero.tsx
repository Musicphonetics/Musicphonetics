import Link from "next/link";

// ============================================================================
// VisionHero — the first screen. An editorial, asymmetric two-column hero:
// a refined type-led statement on the left, and on the right a layered
// composition of real performance photography with a live preview of the
// actual parent platform floating over it (music + the technology behind it).
// Brand identity unchanged: charcoal, gold, Fraunces + Hanken Grotesk. Nothing
// below the hero is touched; all styling is local to this component.
// ============================================================================

function Chip({ children, live }: { children: React.ReactNode; live?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/15 bg-ivory/[0.04] px-3 py-1.5 text-[0.72rem] font-medium text-ivory/75">
      <span className={live ? "h-1.5 w-1.5 rounded-full bg-emerald-400" : "h-1.5 w-1.5 rounded-full border border-gold/70"} />
      {children}
    </span>
  );
}

export function VisionHero() {
  return (
    <section
      className="relative -mt-16 overflow-hidden bg-charcoal-2 text-ivory"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 5.5rem)" }}
    >
      {/* Ambient depth — a soft gold glow behind the image, a faint system grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-6vw] top-[8%] h-[42rem] w-[42rem] rounded-full bg-gold/[0.09] blur-[150px]" />
        <div className="absolute left-[-12vw] bottom-[-16vh] h-[32rem] w-[32rem] rounded-full bg-forest/15 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #F5F1E8 1px, transparent 1px), linear-gradient(to bottom, #F5F1E8 1px, transparent 1px)",
            backgroundSize: "68px 68px",
            maskImage: "radial-gradient(circle at 72% 32%, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at 72% 32%, black, transparent 70%)",
          }}
        />
      </div>

      <div className="container-mp relative z-10 flex min-h-[100svh] flex-col justify-center py-12 lg:py-16">
        <div className="grid items-center gap-x-12 gap-y-14 lg:grid-cols-[1.03fr_0.97fr] lg:gap-x-16">
          {/* ───────────────────────── Left: the statement ───────────────────────── */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.07] px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-gold-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              Music · Data · Intelligence
            </span>

            <h1 className="mt-6 font-display text-[clamp(2rem,4.3vw,3.1rem)] font-medium leading-[1.07] tracking-[-0.01em]">
              We started by teaching music.
              <span className="mt-2.5 block bg-gradient-to-r from-gold-soft via-gold to-deep-gold bg-clip-text text-transparent">
                Now we&apos;re building the technology to understand how it&apos;s learned.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-ivory/70">
              A real music school with a working platform underneath — and an intelligence layer
              being built around every lesson, practice session and performance.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gold px-7 py-3.5 text-base font-semibold text-charcoal shadow-[0_18px_44px_-14px_rgba(201,162,39,0.6)] transition hover:brightness-105"
              >
                Book a free trial
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <a
                href="#platform"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/20 px-6 py-3.5 text-base font-semibold text-ivory/90 transition hover:border-ivory/50 hover:text-ivory"
              >
                See the platform
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>

            {/* Honest system strip: what's live vs being built */}
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Chip live>Teacher OS</Chip>
              <Chip live>Parent OS</Chip>
              <Chip live>Student records &amp; assessment data</Chip>
              <Chip>Practice &amp; performance intelligence</Chip>
            </div>
          </div>

          {/* ─────────────────── Right: the layered composition ─────────────────── */}
          <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[23rem] lg:ml-auto lg:mr-0 lg:max-w-[27rem]">
            {/* glow seated behind the frame */}
            <div aria-hidden="true" className="absolute -inset-5 -z-10 rounded-[2.4rem] bg-gold/[0.06] blur-2xl" />

            {/* main performance photograph */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-white/10 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]">
              <img
                src="/images/hero/slide-3.webp"
                alt="A Musicphonetics student performing live on stage with a full band"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "50% 28%" }}
                loading="eager"
                width={1050}
                height={1400}
              />
              {/* tonal blend into the hero + gentle vignette for depth */}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-charcoal-2 via-charcoal-2/10 to-transparent" />
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(130%_90%_at_70%_15%,transparent_55%,rgba(22,27,38,0.55))]" />
              {/* thin gold frame accent */}
              <div aria-hidden="true" className="absolute inset-0 rounded-[1.6rem] ring-1 ring-inset ring-gold/15" />

              {/* small on-image caption */}
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-charcoal-2/55 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-ivory/85 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                On our stages
              </div>
            </div>

            {/* floating live-platform preview, overlapping the photo */}
            <figure className="absolute -bottom-6 -left-6 w-[42%] max-w-[11rem] overflow-hidden rounded-2xl border border-white/12 bg-charcoal shadow-[0_28px_60px_-18px_rgba(0,0,0,0.8)] sm:-left-8">
              <div className="relative aspect-[9/13] overflow-hidden">
                <img
                  src="/images/portal-preview.webp"
                  alt="The Musicphonetics parent portal showing a child's learning journey and progress"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  loading="eager"
                  width={800}
                  height={1600}
                />
              </div>
              <figcaption className="flex items-center gap-1.5 border-t border-white/10 bg-charcoal px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-ivory/70">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live platform
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* scroll cue → the living system section */}
      <a
        href="#loop"
        className="absolute inset-x-0 bottom-5 z-10 mx-auto hidden w-fit flex-col items-center gap-1 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-ivory/40 transition hover:text-ivory/80 sm:flex"
      >
        Scroll
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-bounce"><path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </section>
  );
}
