import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SoundWave } from "@/components/ui/SoundWave";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { InstrumentIcon } from "@/components/ui/InstrumentIcon";
import { INSTRUMENTS } from "@/lib/onboarding";

export function HeroConcierge() {
  return (
    <section id="overview" className="relative overflow-hidden bg-ink text-paper">
      {/* Calm ambient light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-[-20%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-deep-gold/10 blur-[130px]" />
      </div>

      <div className="container-mp relative grid items-center gap-12 py-16 sm:py-20 lg:min-h-[82vh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        {/* Left — the one question */}
        <div>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/80">
              Musicphonetics
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              What would you like to learn?
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-paper/65 sm:text-lg">
              Premium one-to-one music lessons. Choose an instrument to begin —
              we&apos;ll match you with the right teacher.
            </p>
          </Reveal>

          {/* Instrument selector = the primary CTA */}
          <Reveal delay={260}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
              {INSTRUMENTS.map((o) => (
                <Link
                  key={o.value}
                  href={`/start?instrument=${encodeURIComponent(o.value)}`}
                  className="group mp-glass flex min-h-[92px] flex-col items-center justify-center rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:border-gold/50 active:scale-95"
                >
                  <span className="text-gold transition-transform duration-200 group-hover:scale-110">
                    <InstrumentIcon name={o.icon} size={28} />
                  </span>
                  <span className="mt-2 text-sm font-semibold text-paper">{o.label}</span>
                </Link>
              ))}
            </div>
          </Reveal>

          {/* Small, quiet trust line — not buttons */}
          <Reveal delay={340}>
            <p className="mt-8 text-sm text-paper/45">
              1,200+ students · 10+ years · 4.9★ parent rating · Verified teachers
            </p>
          </Reveal>
        </div>

        {/* Right — calm imagery + subtle motion */}
        <Reveal delay={200}>
          <div className="relative hidden lg:block">
            <SoundWave className="absolute inset-x-0 top-1/2 h-32 -translate-y-1/2 opacity-50" />
            <div className="relative">
              <ImagePlaceholder label="Real lesson moment" aspect="portrait" tone="ink" className="shadow-card-hover" />
              <div aria-hidden="true" className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gold/5 blur-2xl" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
