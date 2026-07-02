import { Section, SectionHeading } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { PACKAGES, PACKAGES_NOTE, whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Plans() {
  return (
    <Section id="plans" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Learning paths"
        title="Three simple ways to begin."
        intro="Every student follows a personalised pathway. These are starting points, not rigid tiers."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PACKAGES.map((pkg, i) => (
          <Reveal key={pkg.key} delay={i * 100}>
            <div
              className={cn(
                "relative flex h-full flex-col rounded-2xl border p-7 sm:p-8",
                pkg.featured &&
                  "border-gold bg-ink text-paper shadow-card-hover ring-1 ring-gold",
                pkg.premium && "border-hairline bg-feature-green text-paper",
                !pkg.featured &&
                  !pkg.premium &&
                  "border-hairline bg-paper text-ink"
              )}
            >
              {pkg.featured && (
                <span className="absolute -top-3 left-7">
                  <Badge tone="gold">Most chosen</Badge>
                </span>
              )}

              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-display text-3xl font-semibold",
                    pkg.featured || pkg.premium ? "text-gold" : "text-deep-gold"
                  )}
                >
                  {pkg.key}
                </span>
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
              </div>

              <p
                className={cn(
                  "mt-3 text-sm leading-relaxed",
                  pkg.featured || pkg.premium ? "text-paper/75" : "text-ink/65"
                )}
              >
                {pkg.tagline}
              </p>

              <div className="mt-6">
                <p className="font-display text-2xl font-semibold">
                  {pkg.perClass}
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    pkg.featured || pkg.premium ? "text-paper/70" : "text-ink/60"
                  )}
                >
                  {pkg.monthly}
                </p>
                {pkg.note && (
                  <p
                    className={cn(
                      "mt-2 text-sm font-medium",
                      pkg.featured ? "text-gold" : "text-deep-gold"
                    )}
                  >
                    {pkg.note}
                  </p>
                )}
              </div>

              <div className="mt-7 pt-2">
                <Button
                  href={whatsappLink(
                    `Hi Musicphonetics, I'm interested in ${pkg.key} · ${pkg.name}. Please guide me.`
                  )}
                  external
                  fullWidth
                  size="lg"
                  variant={pkg.featured || pkg.premium ? "light" : "primary"}
                >
                  Enquire on WhatsApp
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* What every plan includes + payment reassurance */}
      <Reveal>
        <div className="mt-8 rounded-3xl border border-hairline bg-paper p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
            <div>
              <p className="eyebrow">In every plan</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "8 classes a month",
                  "Personalised attention",
                  "Progress tracking",
                  "Monthly parent reports",
                  "Flexible rescheduling",
                  "Home · Online · Centre",
                  "Free trial available",
                ].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-xs font-medium text-ink/75">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-feature-green"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:border-l lg:border-hairline lg:pl-10">
              <p className="eyebrow">Payments</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">
                Secure payments — UPI, cards &amp; netbanking, over an encrypted
                connection. Not the right fit after your trial? Our refund standard
                is published in the Standards Library.
              </p>
              <a href="/standards/refund-payment" className="mt-3 inline-block text-sm font-semibold text-[#7A5E0F] underline underline-offset-2">
                Read the refund &amp; payment standard
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink/60">
        {PACKAGES_NOTE}
      </p>
    </Section>
  );
}
