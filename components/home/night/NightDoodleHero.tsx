import { WhatsAppCTA } from "../WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";
import { LoginChooser } from "./LoginChooser";
import { activeDoodle } from "@/lib/doodle";

// Floating festival/music accents, kept up around the wordmark.
const SPOTS = [
  { top: "13%", left: "9%", size: "1.7rem", delay: "0s" },
  { top: "16%", right: "10%", size: "1.8rem", delay: "1.1s" },
  { top: "30%", left: "5%", size: "1.5rem", delay: "2.2s" },
  { top: "33%", right: "5%", size: "1.5rem", delay: "0.6s" },
  { top: "22%", left: "24%", size: "1.1rem", delay: "1.7s" },
];

// Deterministic rain streaks (monsoon), soft on the light background.
const RAIN = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37 + 5) % 100}%`,
  h: `${16 + ((i * 13) % 22)}px`,
  dur: `${(1.1 + ((i % 6) * 0.18)).toFixed(2)}s`,
  delay: `${(((i * 29) % 24) / 10).toFixed(2)}s`,
}));

// A bright, airy "doodle" hero: the real Musicphonetics logo centre stage on a
// warm cream canvas, with gentle music (and, on festivals, festive) touches.
export function NightDoodleHero() {
  const d = activeDoodle();
  return (
    <section className="relative -mt-16 flex min-h-[92vh] items-center overflow-hidden bg-gradient-to-b from-mist/70 via-paper to-paper text-ink">
      {/* soft themed glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[42%] h-[62vw] max-h-[520px] w-[62vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]" style={{ background: `radial-gradient(circle, ${d.glow}, transparent 70%)` }} />
      </div>

      {/* monsoon rain (hidden for reduced motion) */}
      {d.rain && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
          {RAIN.map((r, i) => (
            <span key={i}
              className="absolute top-0 block w-px bg-gradient-to-b from-transparent via-sky-500/25 to-sky-500/5 motion-safe:[animation:mp-rain_linear_infinite]"
              style={{ left: r.left, height: r.h, animationDuration: r.dur, animationDelay: r.delay }} />
          ))}
        </div>
      )}

      {/* floating accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {d.accents.slice(0, SPOTS.length).map((a, i) => {
          const s = SPOTS[i];
          return (
            <span key={i} className="mp-note absolute select-none opacity-80"
              style={{ top: s.top, left: s.left, right: s.right, fontSize: s.size, animationDelay: s.delay }}>
              {a}
            </span>
          );
        })}
      </div>

      <div className="container-mp relative w-full py-20 text-center">
        {/* eyebrow */}
        <div className="flex flex-col items-center gap-2">
          <span aria-hidden="true" className="h-px w-10 bg-gold" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F] sm:text-[0.72rem] sm:tracking-[0.18em]">Delhi NCR · at home, online &amp; our South Delhi centre</span>
        </div>

        {d.greeting && (
          <div className="mt-6 inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-[#7A5E0F]">
            {d.greeting}
          </div>
        )}

        {/* The brand logo - real wordmark, never re-typeset */}
        <div className="relative mx-auto mt-7">
          <h1 className="mx-auto w-full max-w-[min(88vw,600px)]">
            <img src="/logo-wordmark-dark.webp" alt="Musicphonetics"
              // @ts-expect-error fetchpriority is valid
              fetchpriority="high" decoding="async"
              className="mx-auto w-full drop-shadow-[0_10px_30px_rgba(22,27,38,0.10)]" />
          </h1>
          <div aria-hidden="true" className="mt-6 flex items-end justify-center gap-[5px]" style={{ height: 32 }}>
            {[14, 26, 10, 34, 20, 30, 12, 24, 16].map((h, i) => (
              <span key={i} className="w-[5px] origin-bottom rounded-full bg-gold motion-safe:[animation:mp-wave_1.4s_ease-in-out_infinite]"
                style={{ height: h, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>

        <p className="mx-auto mt-7 max-w-xl text-[1.02rem] leading-relaxed text-ink/70 sm:text-lg">
          Structured music learning - a teacher matched to your child, a real method,
          and a stage to perform on. Guitar, piano/keyboard &amp; vocals.
        </p>

        <div className="mx-auto mt-8 flex max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
          <a href="#programmes"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-ink shadow-[0_14px_38px_-12px_rgba(201,162,39,0.7)] transition-colors hover:bg-deep-gold">
            Apply now
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <WhatsAppCTA label="Enquire on WhatsApp" message={WA_MSG.trial} variant="outline" className="!border-ink/20 !text-ink hover:!border-ink" />
        </div>

        <div className="mt-4 flex justify-center">
          <LoginChooser tone="light" />
        </div>

        <p className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-ink/60">
          <span><b className="font-semibold text-ink">10+</b> years</span><Dot />
          <span><b className="font-semibold text-ink">1,100+</b> students</span><Dot />
          <span><b className="font-semibold text-ink">4.8★</b> on Google &amp; JustDial</span>
        </p>
      </div>
    </section>
  );
}

function Dot() {
  return <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-gold" />;
}
