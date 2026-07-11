import { WhatsAppCTA } from "../WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";
import { LoginChooser } from "./LoginChooser";
import { activeDoodle } from "@/lib/doodle";

// Positions for the floating festival/music accents - kept up around the
// wordmark so they never crowd the buttons below.
const SPOTS = [
  { top: "11%", left: "7%", size: "1.6rem", delay: "0s" },
  { top: "13%", right: "8%", size: "1.7rem", delay: "1.1s" },
  { top: "22%", left: "3%", size: "1.4rem", delay: "2.2s" },
  { top: "24%", right: "3%", size: "1.4rem", delay: "0.6s" },
  { top: "17%", left: "24%", size: "1.05rem", delay: "1.7s" },
];

// Deterministic rain streaks (no Math.random - keeps SSR and client identical).
const RAIN = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 37 + 5) % 100}%`,
  h: `${14 + ((i * 13) % 22)}px`,
  dur: `${(1.0 + ((i % 6) * 0.18)).toFixed(2)}s`,
  delay: `${(((i * 29) % 24) / 10).toFixed(2)}s`,
}));

// The hero is a "doodle": the Musicphonetics name centre stage, on a soft glow,
// with music (and, on festivals, festive) decorations floating around it. Change
// the theme in lib/doodle.ts to celebrate an occasion.
export function NightDoodleHero() {
  const d = activeDoodle();
  return (
    <section className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden bg-onyx text-paper">
      {/* soft themed glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[70vw] max-h-[560px] w-[70vw] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]" style={{ background: `radial-gradient(circle, ${d.glow}, transparent 70%)` }} />
        {/* faint hairline grid for depth */}
        <div className="absolute inset-0 opacity-[0.04] mp-blueprint" />
      </div>

      {/* monsoon: falling rain (hidden for reduced-motion users) */}
      {d.rain && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
          {RAIN.map((r, i) => (
            <span key={i}
              className="absolute top-0 block w-px bg-gradient-to-b from-transparent via-sky-200/50 to-sky-200/10 motion-safe:[animation:mp-rain_linear_infinite]"
              style={{ left: r.left, height: r.h, animationDuration: r.dur, animationDelay: r.delay }} />
          ))}
        </div>
      )}

      {/* floating accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {d.accents.slice(0, SPOTS.length).map((a, i) => {
          const s = SPOTS[i];
          return (
            <span key={i} className="mp-note absolute select-none opacity-50"
              style={{ top: s.top, left: s.left, right: s.right, fontSize: s.size, animationDelay: s.delay, color: "inherit" }}>
              {a}
            </span>
          );
        })}
      </div>

      <div className="container-mp relative w-full py-24 text-center">
        {/* eyebrow */}
        <div className="flex flex-col items-center gap-2">
          <span aria-hidden="true" className="h-px w-10 bg-gold" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold sm:text-[0.72rem] sm:tracking-[0.18em]">Delhi NCR · at home, online &amp; our South Delhi centre</span>
        </div>

        {/* festival greeting */}
        {d.greeting && (
          <div className="mt-6 inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold">
            {d.greeting}
          </div>
        )}

        {/* The brand logo - the real wordmark, never re-typeset or broken */}
        <div className="relative mx-auto mt-7">
          <h1 className="mx-auto w-full max-w-[min(86vw,560px)]">
            <img
              src="/logo-wordmark-light.webp"
              alt="Musicphonetics"
              // @ts-expect-error fetchpriority is a valid html attr
              fetchpriority="high"
              decoding="async"
              className="mx-auto w-full drop-shadow-[0_8px_34px_rgba(201,162,39,0.28)]"
            />
          </h1>

          {/* equalizer signature - a clean, animated music motif under the name */}
          <div aria-hidden="true" className="mt-6 flex items-end justify-center gap-[5px]" style={{ height: 34 }}>
            {[14, 26, 10, 34, 20, 30, 12, 24, 16].map((h, i) => (
              <span key={i}
                className="w-[5px] origin-bottom rounded-full bg-gradient-to-t from-gold/40 to-gold motion-safe:[animation:mp-wave_1.4s_ease-in-out_infinite]"
                style={{ height: h, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>

        {/* tagline */}
        <p className="mx-auto mt-7 max-w-xl text-[1.02rem] leading-relaxed text-paper/75 sm:text-lg">
          Structured music learning - a teacher matched to your child, a real method,
          and a stage to perform on. Guitar, piano/keyboard &amp; vocals.
        </p>

        {/* actions */}
        <div className="mx-auto mt-8 flex max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
          <a href="#programmes"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-ink shadow-[0_14px_38px_-10px_rgba(201,162,39,0.6)] transition-colors hover:bg-deep-gold">
            Apply now
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <WhatsAppCTA label="Enquire on WhatsApp" message={WA_MSG.trial} variant="outline" />
        </div>

        {/* one login button for everyone */}
        <div className="mt-4 flex justify-center">
          <LoginChooser />
        </div>

        {/* quiet proof */}
        <p className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-paper/60">
          <span><b className="font-semibold text-paper">10+</b> years</span><Dot />
          <span><b className="font-semibold text-paper">1,100+</b> students</span><Dot />
          <span><b className="font-semibold text-paper">4.8★</b> on Google &amp; JustDial</span>
        </p>
      </div>
    </section>
  );
}

function Dot() {
  return <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-gold" />;
}
