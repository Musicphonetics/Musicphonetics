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
              <p className="mt-3 text-xs text-paper/70">
                Free trial, no commitment — we reply on WhatsApp within the hour.
              </p>
            </div>
          </Reveal>

          {/* Small, quiet trust + breadth */}
          <Reveal delay={300}>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-paper/70">
              Private &amp; group · Home · Online · Centre on the way · 1,100+ students
            </p>
          </Reveal>

          {/* Exam-board + defence trust strip */}
          <Reveal delay={360}>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/45">
                Prepares students for
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-sm font-semibold text-paper/85">
                <span>Trinity College London</span>
                <span aria-hidden="true" className="text-gold">·</span>
                <span>ABRSM</span>
                <span aria-hidden="true" className="text-gold">·</span>
                <span>Rockschool</span>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-paper/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                Trusted by Defence families · Delhi Cantonment
              </p>
            </div>
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
              {/* Watch us perform live → scrolls to the performances section */}
              <a
                href="#performances"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[1.5rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                aria-label="Watch us perform live"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/90 text-ink shadow-lg transition-transform duration-300 hover:scale-110">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                </span>
                <span className="rounded-full bg-ink/60 px-3 py-1 text-xs font-medium text-paper backdrop-blur-sm">
                  Watch us perform live
                </span>
              </a>
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
