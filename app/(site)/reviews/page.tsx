import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reviews } from "@/components/sections/Reviews";
import { whatsappLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Parent reviews, student outcomes, and exam results from Musicphonetics learners across Delhi NCR.",
};

const OUTCOMES = [
  { stat: "Foundation → Fluency", label: "Typical first-year progression" },
  { stat: "Trinity-ready", label: "Exam pathway for those who want it" },
  { stat: "Stage-confident", label: "Recital and performance preparation" },
];

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Reviews & outcomes"
        title="Trust, earned one student at a time."
        intro="We only publish verified testimonials. The reviews below are sample placeholders, clearly marked, until real parent reviews replace them."
      />

      {/* Parent reviews (full set) */}
      <Reviews />

      {/* Student outcomes */}
      <Section background="white" spacing="lg">
        <SectionHeading
          eyebrow="Student outcomes"
          title="What progress tends to look like."
          intro="Indicative outcomes from the method. Replace with real, documented student journeys before launch."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {OUTCOMES.map((outcome, i) => (
            <Reveal key={outcome.label} delay={i * 90}>
              <Card className="h-full text-center">
                <p className="font-display text-2xl font-semibold text-ink">
                  {outcome.stat}
                </p>
                <p className="mt-2 text-sm text-ink/60">{outcome.label}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Exam / recital placeholders */}
      <Section background="paper" spacing="lg">
        <SectionHeading
          eyebrow="Exams & recitals"
          title="Moments worth framing."
          intro="Placeholders below. Replace with real exam certificates and recital photos before launch."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal>
            <ImagePlaceholder label="Trinity certificate photo" aspect="portrait" />
          </Reveal>
          <Reveal delay={80}>
            <ImagePlaceholder label="Student recital photo" aspect="portrait" />
          </Reveal>
          <Reveal delay={160}>
            <ImagePlaceholder label="Exam result photo" aspect="portrait" />
          </Reveal>
          <Reveal delay={240}>
            <ImagePlaceholder label="Performance photo" aspect="portrait" />
          </Reveal>
        </div>
        <div className="mt-6">
          <Badge tone="sample">Placeholders — replace before launch</Badge>
        </div>
      </Section>

      {/* Review collection + Google reviews */}
      <Section background="ink" spacing="lg">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow text-gold">Are you a current parent?</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-paper sm:text-4xl">
                Share your experience.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-paper/75">
                Your words help other families decide with confidence. It takes
                a minute.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button
                href={whatsappLink("Hi Musicphonetics, I'd like to leave a review.")}
                external
                variant="light"
                size="lg"
              >
                Leave a review
              </Button>
              {/* TODO(integration): replace with your Google Business reviews URL */}
              <Button href="#" variant="secondary" size="lg" className="border-white/25 text-paper hover:border-white">
                View on Google (placeholder)
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
