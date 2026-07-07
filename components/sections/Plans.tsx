import { Section, SectionHeading } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { PACKAGES, whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Plans() {
  return (
    <Section id="plans" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Plans & fees"
        title="Premium, one-to-one - priced for it."
        intro="Musicphonetics is premium, one-to-one music education. Every plan is personalised on your free trial."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PACKAGES.map((pkg, i) => {
          const dark = pkg.featured || pkg.premium;
          return (
            <Reveal key={pkg.key} delay={i * 100}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-7 sm:p-8",
                  pkg.featured && "border-gold bg-ink text-paper shadow-card-hover ring-1 ring-gold",
                  pkg.premium && "border-hairline bg-feature-green text-paper",
                  !dark && "border-hairline bg-paper text-ink"
                )}
              >
                {pkg.badge && (
                  <span className="absolute -top-3 left-7">
                    <Badge tone="gold">{pkg.badge}</Badge>
                  </span>
                )}

                <h3 className="font-display text-xl font-semibold">{pkg.name}</h3>

                <div className="mt-4">
                  <p className="font-display text-3xl font-semibold">
                    {pkg.priceFrom}
                  </p>
                  <p className={cn("mt-1 text-sm", dark ? "text-paper/70" : "text-ink/60")}>
                    {pkg.unit}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {pkg.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("mt-0.5 shrink-0", pkg.featured ? "text-gold" : pkg.premium ? "text-gold" : "text-feature-green")}>
                        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className={dark ? "text-paper/85" : "text-ink/75"}>{b}</span>
                    </li>
                  ))}
                </ul>

                <p className={cn("mt-5 text-xs", dark ? "text-paper/55" : "text-ink/55")}>
                  Your exact plan is confirmed on your free trial.
                </p>

                <div className="mt-4">
                  {pkg.application ? (
                    <Button
                      href={whatsappLink("Hi Musicphonetics, I'd like to apply for the Director's Circle.")}
                      external
                      fullWidth
                      size="lg"
                      variant="light"
                    >
                      Apply for Director&apos;s Circle
                    </Button>
                  ) : (
                    <Button href="/start" fullWidth size="lg" variant={dark ? "light" : "primary"}>
                      Book a free trial
                    </Button>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Discount cue - no numbers, by design */}
      <Reveal>
        <p className="mt-8 text-center text-sm text-ink/70">
          You may be eligible for a special rate -{" "}
          <a
            href={whatsappLink("Hi Musicphonetics, I'd like to book a free trial and ask about my rate.")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#7A5E0F] underline underline-offset-2"
          >
            ask us on your free trial
          </a>
          .
        </p>
      </Reveal>
    </Section>
  );
}
