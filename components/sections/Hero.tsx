import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { WorldMapShape } from "@/components/ui/WorldMap";
import { BRAND, whatsappLink, whatsappTrialLink } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-ink text-paper lg:min-h-[88vh]">
      {/* Ambient depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-deep-gold/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[460px] w-[460px] rounded-full bg-feature-green/40 blur-3xl" />
      </div>

      {/* Faint world-map watermark (clean, no scattered dots) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-[0.5] sm:w-[70%]">
        <WorldMapShape
          className="absolute right-[-6%] top-1/2 h-auto w-[120%] -translate-y-1/2 sm:w-full"
          fill="rgba(201,162,39,0.05)"
          stroke="rgba(201,162,39,0.14)"
        />
      </div>
      {/* Gradient for legibility */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />

      {/* Copy */}
      <div className="container-mp relative z-10 py-20 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Education-first music company</p>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] text-paper sm:text-5xl lg:text-6xl">
              Building the future of{" "}
              <span className="text-gold">music education.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-paper/75 sm:max-w-lg sm:text-lg">
              Founded in India. Teaching across cities. Expanding globally.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href={whatsappTrialLink()}
                external
                size="lg"
                variant="light"
                className="w-full sm:w-auto"
              >
                Book a Trial
              </Button>
              <Button
                href={whatsappLink()}
                external
                size="lg"
                variant="secondary"
                className="w-full border-white/25 text-paper hover:border-white sm:w-auto"
              >
                Enquire on WhatsApp
              </Button>
            </div>

            <p className="mt-8 text-sm text-paper/45">
              {BRAND.yearsExperience} years · {BRAND.studentsTaught} students
              taught · Home &amp; online
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
