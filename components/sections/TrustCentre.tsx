import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { TrustIcon } from "@/components/trust/TrustIcon";
import { TRUST_PILLARS } from "@/lib/trust";

/**
 * Homepage gateway into the full Trust Centre (/trust).
 * Sits between Founder and the rest of the story.
 */
export function TrustCentre() {
  return (
    <section className="relative overflow-hidden bg-midnight py-24 text-paper sm:py-32">
      <div aria-hidden="true" className="mp-blueprint pointer-events-none absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-deep-gold/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full bg-feature-green/30 blur-3xl" />
      </div>

      <div className="container-mp relative">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The Trust Centre</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-paper sm:text-5xl">
              Built on trust. <span className="text-gold">Documented by design.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/70 sm:text-lg">
              Every class is backed by systems, documentation and
              accountability. Great education isn&apos;t built on promises - it
              is built on standards.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={(i % 4) * 70}>
              <div className="group mp-glass flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                  <TrustIcon icon={pillar.icon} />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-paper">{pillar.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-paper/55">{pillar.line}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10">
            <Magnetic>
              <Button href="/trust" size="lg" variant="light">
                Enter the Trust Centre
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
