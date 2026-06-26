import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroCanvas } from "@/components/ui/HeroCanvas";
import { BRAND, whatsappLink, whatsappTrialLink } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-ink text-paper">
      {/* Cinematic map canvas — music data travelling across the world */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 sm:opacity-100"
      >
        <HeroCanvas className="h-full w-full" />
      </div>

      {/* Ambient depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-deep-gold/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[460px] w-[460px] rounded-full bg-feature-green/30 blur-3xl" />
      </div>

      {/* Legibility gradient (stronger on the left where text sits) */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />

      {/* Copy — clean hierarchy, mobile-first */}
      <div className="container-mp relative z-10 py-24 sm:py-28">
        <Reveal>
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold sm:text-sm">
              Education-first music company
            </p>
            <h1 className="mt-4 text-[1.95rem] font-semibold leading-[1.12] text-paper sm:text-5xl lg:text-6xl">
              Building the future of{" "}
              <span className="text-gold">music education.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-paper/70 sm:text-lg">
              Founded in India. Teaching across cities. Expanding globally.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnetic className="w-full sm:w-auto">
                <Button href={whatsappTrialLink()} external size="lg" variant="light" className="w-full">
                  Book a Trial
                </Button>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <Button
                  href={whatsappLink()}
                  external
                  size="lg"
                  variant="secondary"
                  className="w-full border-white/25 text-paper hover:border-white"
                >
                  Enquire on WhatsApp
                </Button>
              </Magnetic>
            </div>

            <p className="mt-8 text-sm text-paper/45">
              {BRAND.yearsExperience} years · {BRAND.studentsTaught} students taught · Home &amp; online
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
