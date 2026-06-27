import { Reveal } from "@/components/ui/Reveal";
import { SoundWave } from "@/components/ui/SoundWave";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { InstrumentSearch } from "@/components/sections/InstrumentSearch";

export function HeroConcierge() {
  return (
    <section id="overview" className="relative overflow-hidden bg-ink text-paper">
      {/* Calm ambient light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-[-20%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-deep-gold/10 blur-[130px]" />
      </div>

      <div className="container-mp relative grid items-center gap-12 py-16 sm:py-20 lg:min-h-[86vh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        {/* Left — brand identity, then begin */}
        <div>
          <Reveal>
            <h1 className="font-display text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
              Building the future of music education in India.
            </h1>
          </Reveal>

          {/* Bible verse — part of the identity, elegant and subtle */}
          <Reveal delay={120}>
            <figure className="mt-6 border-l-2 border-gold/40 pl-4">
              <blockquote className="font-display text-base italic leading-relaxed text-paper/70 sm:text-lg">
                “Train up a child in the way he should go; even when he is old he
                will not depart from it.”
              </blockquote>
              <figcaption className="mt-1 text-xs uppercase tracking-[0.18em] text-gold/70">
                Proverbs 22:6
              </figcaption>
            </figure>
          </Reveal>

          {/* The one action — search */}
          <Reveal delay={250}>
            <div className="mt-9">
              <p className="mb-3 text-sm font-medium text-paper/70">
                What would you like to learn?
              </p>
              <InstrumentSearch />
            </div>
          </Reveal>

          {/* Small, quiet trust + breadth */}
          <Reveal delay={330}>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-paper/45">
              Home &amp; online · Group &amp; workshops · Trinity &amp; Rockschool
              preparation · Verified teacher network · 1,200+ students
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
