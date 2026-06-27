import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { SoundWave } from "@/components/ui/SoundWave";

export function Hero() {
  return (
    <section className="relative hidden min-h-[92vh] items-center overflow-hidden bg-ink text-paper lg:flex">
      {/* Calm premium lighting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-deep-gold/12 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[10%] h-[420px] w-[420px] rounded-full bg-feature-green/25 blur-[120px]" />
      </div>

      {/* Subtle flowing frequencies (no particles, no maps) */}
      <SoundWave className="absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 opacity-70" />

      {/* Soft top/bottom depth */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="container-mp relative z-10 py-24 text-center">
        <Reveal>
          {/* Scripture — tasteful, restrained */}
          <figure className="mx-auto max-w-xl">
            <blockquote className="font-display text-base italic leading-relaxed text-paper/65 sm:text-lg">
              “Train up a child in the way he should go; even when he is old he
              will not depart from it.”
            </blockquote>
            <figcaption className="mt-2 text-xs uppercase tracking-[0.2em] text-gold/80">
              Proverbs 22:6
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mx-auto mt-10 max-w-4xl text-[2.4rem] font-semibold leading-[1.05] text-paper sm:text-6xl lg:text-7xl">
            Building the future of{" "}
            <span className="text-gold">music education.</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-paper/75 sm:text-lg">
            Premium one-to-one music classes — guitar, piano, keyboard, and
            vocals. Home &amp; online, with trained teachers and real student
            growth.
          </p>
          <p className="mx-auto mt-3 text-sm text-paper/55">
            Founded in India. Teaching across cities. Expanding globally.
          </p>
        </Reveal>

        <Reveal delay={280}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic className="w-full sm:w-auto">
              <Button href="/start" size="lg" variant="light" className="w-full">
                Book a Trial
              </Button>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <Button
                href="/#stories"
                size="lg"
                variant="secondary"
                className="w-full border-white/25 text-paper hover:border-white"
              >
                Watch Stories
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
