import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { CurriculumLevels } from "@/components/sections/CurriculumLevels";
import { ProgressionPath } from "@/components/sections/ProgressionPath";
import { SampleReport } from "@/components/sections/SampleReport";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { curriculumJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Curriculum - a clear path from first note to graded exams",
  description:
    "The Musicphonetics learning roadmap: Foundation, Developing, Intermediate, and Advanced levels aligned to Trinity, ABRSM, and Rockschool grades - home and online across Delhi NCR.",
  openGraph: {
    title: "Curriculum - from first note to graded exams",
    description:
      "Four structured levels aligned to Trinity, ABRSM, and Rockschool grades. See exactly what students work on and when.",
  },
};

export default function CurriculumPage() {
  return (
    <>
      <JsonLd data={curriculumJsonLd()} />

      <PageHero
        eyebrow="The learning roadmap"
        title="A clear path from first note to graded exams."
        intro="Four structured levels, one method - the same for every student, aligned to Trinity, ABRSM, and Rockschool where wanted."
      >
        <Button href="/start" variant="primary" size="lg">
          Book a free trial
        </Button>
      </PageHero>

      {/* Levels + typical-journey strip */}
      <CurriculumLevels />

      {/* Progression exhibit */}
      <Section background="white" spacing="lg">
        <SectionHeading
          eyebrow="Progression"
          title="How students move through the method."
        />
        <div className="mt-12 rounded-3xl border border-hairline bg-paper p-8 sm:p-12">
          <ProgressionPath />
        </div>
      </Section>

      {/* Sample monthly report */}
      <Section background="paper" spacing="lg">
        <SectionHeading
          eyebrow="Progress tracking"
          title="You see the growth, every month."
          intro="Every student's progress is tracked and shared. Here's the monthly report parents receive."
        />
        <div className="mt-12">
          <SampleReport />
        </div>
      </Section>

      <FinalCTA
        headline="Start the path with one free trial."
        text="Tell us the instrument and goal - we'll place your child at the right level."
      />
    </>
  );
}
