import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { METHOD_STAGES_FULL, METHOD_PRINCIPLES } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Method",
  description:
    "The Musicphonetics Method: a structured, faculty-led pathway from Foundation to Mastery. Music should never feel random.",
};

export default function MethodPage() {
  return (
    <>
      <PageHero
        eyebrow="The Musicphonetics Method"
        title="A pathway, not a playlist of songs."
        intro="A structured, faculty-led approach that takes a learner from first sound to confident musician — at a pace that respects them."
      >
        <Button href="/#plans" variant="primary" size="lg">
          See learning paths
        </Button>
      </PageHero>

      {/* Manifesto */}
      <Section background="white" spacing="lg">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <div>
              <p className="eyebrow">The manifesto</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Music should never feel random.
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink/70">
                <p>
                  Too many learners drift from one song to the next without ever
                  building real understanding. Progress feels accidental, and
                  motivation fades.
                </p>
                <p>
                  The Musicphonetics Method replaces that randomness with
                  structure: clear stages, a consistent standard, and a teacher
                  who knows exactly what comes next.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ImagePlaceholder label="Lesson photo · method in action" aspect="landscape" />
          </Reveal>
        </div>
      </Section>

      {/* Stages */}
      <Section background="paper" spacing="lg">
        <SectionHeading
          eyebrow="The stages"
          title="Four stages, one continuous path."
          intro="Each stage builds on the last. No skipping foundations, no rushing performance."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD_STAGES_FULL.map((stage, i) => (
            <Reveal key={stage.name} delay={i * 90}>
              <Card hover className="h-full">
                <span className="font-display text-sm font-semibold text-deep-gold">
                  Stage {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-ink">
                  {stage.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {stage.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Principles */}
      <Section background="green" spacing="lg">
        <SectionHeading
          eyebrow="The principles"
          title="What every Musicphonetics lesson holds to."
          invert
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METHOD_PRINCIPLES.map((principle, i) => (
            <Reveal key={principle} delay={i * 80} as="li">
              <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-5 py-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold text-ink">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="font-medium text-paper">{principle}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Proof placeholders */}
      <Section background="white" spacing="lg">
        <SectionHeading
          eyebrow="Proof"
          title="Evidence of progress, added over time."
          intro="Placeholders below. Replace with real student outcomes, exam results, and recital footage before launch."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Reveal>
            <ImagePlaceholder label="Trinity certificate photo" aspect="portrait" />
          </Reveal>
          <Reveal delay={90}>
            <ImagePlaceholder label="Student recital photo" aspect="portrait" />
          </Reveal>
          <Reveal delay={180}>
            <ImagePlaceholder label="Progress milestone photo" aspect="portrait" />
          </Reveal>
        </div>
        <div className="mt-8">
          <Badge tone="sample">Placeholders — replace before launch</Badge>
        </div>
      </Section>

      <FinalCTA
        headline="Ready to learn with structure?"
        text="Tell us your instrument and goal. We'll map you to the right stage and teacher."
      />
    </>
  );
}
