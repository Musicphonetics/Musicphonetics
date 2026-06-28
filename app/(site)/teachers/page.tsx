import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FacultySelection } from "@/components/sections/FacultySelection";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Faculty",
  description:
    "How Musicphonetics selects faculty — a seven-stage process every teacher passes before they teach a single student. Verified teacher profiles are being published.",
};

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="Every teacher is chosen, not listed."
        intro="We don't run a marketplace of strangers. Each teacher passes a seven-stage selection before they reach a student."
      />

      {/* The seven-stage selection — the real, finished content */}
      <FacultySelection eyebrow="Selection" />

      {/* Honest slot for real profiles, styled as a finished note (no fake cards) */}
      <Section background="white" spacing="md">
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-2xl border border-hairline bg-paper p-8 text-center">
            <p className="text-ink/70">
              Individual faculty profiles — with names, instruments, and verified
              credentials — are being published. Until then, every teacher you
              meet has already passed the process above.
            </p>
          </div>
        </Reveal>
      </Section>

      <FinalCTA
        headline="Start your music journey with Musicphonetics."
        text="Tell us what you're looking for and we'll match you with the right teacher."
      />
    </>
  );
}
