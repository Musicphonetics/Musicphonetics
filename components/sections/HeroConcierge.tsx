import { Reveal } from "@/components/ui/Reveal";
import { SoundWave } from "@/components/ui/SoundWave";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { HERO_IMAGE } from "@/lib/media";
import { InstrumentChips } from "@/components/sections/InstrumentChips";
import { whatsappTrialLink } from "@/lib/data";

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
              Music education, built like an institution.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-paper/70 sm:text-lg">
              Structured, faculty-led teaching — private and in groups, at home,
              online, and soon at our flagship South Delhi centre.
            </p>
          </Reveal>

          {/* The one action — pick an instrument, go straight to onboarding */}
          <Reveal delay={220}>
            <div className="mt-9">
              <p className="mb-3 text-sm font-medium text-paper/70">
                What would you like to learn?
              </p>
              <InstrumentChips />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href="/start" variant="light" size="lg">
                  Book a free trial
                </Button>
                <Button
                  href={whatsappTrialLink()}
                  external
                  variant="secondary"
                  size="lg"
                  className="border-white/25 text-paper hover:border-white"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Small, quiet trust + breadth */}
          <Reveal delay={300}>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-paper/45">
              Private &amp; group · Home · Online · Centre on the way ·
              Trinity-graded pathways · 1,100+ students
            </p>
          </Reveal>
        </div>

        {/* Right — calm imagery + subtle motion */}
        <Reveal delay={200}>
          <div className="relative hidden lg:block">
            <SoundWave className="absolute inset-x-0 top-1/2 h-32 -translate-y-1/2 opacity-50" />
            <div className="relative">
              <Photo
                image={HERO_IMAGE}
                aspect="portrait"
                priority
                sizes="(max-width: 1024px) 0px, 38vw"
                rounded="rounded-[1.5rem]"
                className="shadow-card-hover ring-1 ring-white/10"
              />
              {/* Soft gradient floor so the headline reads if it overlaps */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-[1.5rem] bg-gradient-to-t from-ink/70 to-transparent"
              />
              <figcaption className="absolute bottom-4 left-5 text-xs font-medium text-paper/85">
                {HERO_IMAGE.caption} · Musicphonetics
              </figcaption>
              <div aria-hidden="true" className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gold/5 blur-2xl" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
