import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TeacherDirectory } from "@/components/teachers/TeacherDirectory";
import { RegionMap } from "@/components/teachers/RegionMap";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { TEACHERS } from "@/lib/teachers";

export const metadata: Metadata = {
  title: "Find a Teacher",
  description:
    "Discover carefully selected, verified music teachers across Delhi NCR and online — filter by instrument, level, language, age group, and teaching mode.",
};

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="Find a teacher"
        title="Discover the right teacher for you."
        intro="Carefully selected and verified. Filter by instrument, level, language, age group, and teaching mode — or let us match you personally."
      />

      {/* Discovery */}
      <Section background="white" spacing="lg">
        <Reveal>
          <div className="mb-8 rounded-2xl border border-hairline bg-mist p-5 text-sm text-ink/70">
            Note: Profiles below use placeholder data. Replace with verified real
            teacher data before launch — the discovery system scales to thousands
            of teachers without any UX change.
          </div>
        </Reveal>
        <TeacherDirectory teachers={TEACHERS} />
      </Section>

      {/* Regions */}
      <Section background="paper" spacing="lg">
        <SectionHeading
          eyebrow="By region"
          title="Built to scale, region by region."
          intro="India is live today. Other regions are launching soon — explore the map, or tell us where you are."
        />
        <Reveal>
          <div className="mt-10">
            <RegionMap />
          </div>
        </Reveal>
      </Section>

      <FinalCTA
        headline="Want us to match you with the right teacher?"
        text="Tell us your instrument and level. We'll handle the matching personally."
      />
    </>
  );
}
