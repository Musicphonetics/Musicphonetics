import Link from "next/link";

// ============================================================================
// VisionHero — the new first impression. Reframes Musicphonetics from "music
// school" to "music-education technology". Dark, cinematic, type-led. No faces,
// no stock SaaS. A single statement, a sound→data motif, and two honest CTAs.
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
      className="relative -mt-16 flex min-h-[100svh] flex-col justify-center overflow-hidden bg-charcoal-2 text-ivory"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 5.5rem)" }}
    >
      {/* Ambient depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[18%] h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-gold/[0.08] blur-[150px]" />
        <div className="absolute right-[-14vw] bottom-[-12vh] h-[34rem] w-[34rem] rounded-full bg-forest/20 blur-[150px]" />
        {/* faint grid, the "system" underneath */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(to right, #F5F1E8 1px, transparent 1px), linear-gradient(to bottom, #F5F1E8 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(circle at 50% 40%, black, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 40%, black, transparent 72%)",
          }}
        />
      </div>

      <div className="container-mp relative z-10 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.07] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Music · Data · Intelligence
          </span>

          <h1 className="mt-8 font-display text-[clamp(2.4rem,7.4vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.01em]">
            We started by<br className="hidden sm:block" /> teaching music.
            <span className="mt-3 block bg-gradient-to-r from-gold-soft via-gold to-deep-gold bg-clip-text text-transparent">
              Now we&apos;re building the technology<br className="hidden sm:block" /> to understand how it&apos;s learned.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[1.02rem] leading-relaxed text-ivory/70">
            A real music school with a working platform underneath — and an intelligence layer
            being built around every lesson, practice session and performance.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-base font-semibold text-charcoal shadow-[0_18px_44px_-14px_rgba(201,162,39,0.6)] transition hover:brightness-105"
            >
              Book a free trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <a
              href="#platform"
              className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-7 py-4 text-base font-semibold text-ivory/90 transition hover:border-ivory/50"
            >
              See the platform
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>

          {/* Honest system strip: what's live vs being built */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            <Chip live>Teacher OS</Chip>
            <Chip live>Parent OS</Chip>
            <Chip live>Student records &amp; assessment data</Chip>
            <Chip>Practice &amp; performance intelligence</Chip>
          </div>
        </div>
      </div>

      {/* sound → data motif: a waveform that resolves into data points */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 opacity-70">
        <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="vh-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#E7C86A" stopOpacity="0" />
              <stop offset="0.5" stopColor="#C9A227" stopOpacity="0.9" />
              <stop offset="1" stopColor="#E7C86A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 110 Q 75 60 150 110 T 300 110 T 450 110 T 600 110 L 1200 110"
            stroke="url(#vh-line)"
            strokeWidth="2"
            fill="none"
          >
            <animate attributeName="opacity" values="0.6;1;0.6" dur="5s" repeatCount="indefinite" />
          </path>
          {[600, 690, 780, 870, 960, 1050, 1140].map((x, i) => (
            <circle key={x} cx={x} cy="110" r="3" fill="#E7C86A">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      <a href="#loop" className="absolute inset-x-0 bottom-5 z-10 mx-auto flex w-fit flex-col items-center gap-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ivory/45 transition hover:text-ivory/80">
        Scroll
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-bounce"><path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </section>
  );
}
