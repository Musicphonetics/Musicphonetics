import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { FAQ } from "@/components/sections/FAQ";
import { AREAS_SERVED, whatsappLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Musicphonetics. Enquire on WhatsApp for home and online music classes across Delhi NCR.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's find the right path for you."
        intro="The fastest way to begin is a short WhatsApp conversation. Tell us who the classes are for and your goal - we'll guide you from there."
      >
        <Button href={whatsappLink()} external variant="primary" size="lg">
          Message us on WhatsApp
        </Button>
      </PageHero>

      <Section background="white" spacing="lg">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* What to expect */}
          <Reveal>
            <Card className="h-full">
              <h2 className="text-xl font-semibold text-ink">
                What to expect when you enquire
              </h2>
              <ol className="mt-5 space-y-4">
                {[
                  "A short, guided conversation - about a minute.",
                  "A recommendation for the right teacher, format, and plan.",
                  "Personal confirmation of fee, slot, and teacher by our team.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm font-semibold text-deep-gold">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-ink/70">{step}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-6">
                <Button href={whatsappLink()} external variant="primary">
                  Start on WhatsApp
                </Button>
              </div>
            </Card>
          </Reveal>

          {/* Areas served */}
          <Reveal delay={120}>
            <Card className="h-full">
              <h2 className="text-xl font-semibold text-ink">Areas served</h2>
              <p className="mt-2 text-sm text-ink/60">
                Home classes across Delhi NCR, plus online classes anywhere.
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {AREAS_SERVED.map((area) => (
                  <li
                    key={area}
                    className="flex items-center gap-2 text-sm text-ink/75"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                    {area}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {/* TODO(content): replace with an embedded Google Map of the service area */}
                <ImagePlaceholder label="Map placeholder · service area" aspect="wide" />
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* FAQ reuse */}
      <FAQ />
    </>
  );
}
