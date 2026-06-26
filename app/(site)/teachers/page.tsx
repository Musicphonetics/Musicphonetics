import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { TeacherDirectory } from "@/components/teachers/TeacherDirectory";
import { GlobalNetwork } from "@/components/sections/GlobalNetwork";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { TEACHERS } from "@/lib/teachers";

export const metadata: Metadata = {
  title: "Find a Teacher",
  description:
    "Discover verified Musicphonetics music teachers across India and online — filter by city, country, instrument, format, age group, and exam pathway.",
};

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="Find a teacher"
        title="Discover the right teacher for you."
        intro="Verified teachers across India and online. Filter by city, instrument, format, age group, and exam pathway — or let us match you personally."
      />

      <Section background="white" spacing="lg">
        <TeacherDirectory teachers={TEACHERS} />
      </Section>

      {/* By region — real stylised world map */}
      <GlobalNetwork />

      <FinalCTA
        headline="Start with one trial. Continue with a clear path."
        text="Tell us your instrument and city. We'll match you with the right teacher."
      />
    </>
  );
}
