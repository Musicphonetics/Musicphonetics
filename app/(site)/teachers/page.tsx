import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { PUBLIC_TEACHERS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Teachers",
  description:
    "Carefully selected, verified music teachers across Delhi NCR — matched to each student's instrument, level, and goal.",
};

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="Our teachers"
        title="Carefully selected. Verified. Matched to you."
        intro="Teachers are never randomly assigned. Each student is matched to a teacher around their instrument, level, and goal."
      />

      <Section background="white" spacing="lg">
        <Reveal>
          <div className="mb-8 rounded-2xl border border-hairline bg-mist p-5 text-sm text-ink/70">
            Note: Profiles below use placeholder data. Replace with verified real
            teacher data before launch.
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_TEACHERS.map((teacher, i) => (
            <Reveal key={teacher.id} delay={(i % 3) * 90}>
              <Card hover className="flex h-full flex-col">
                <ImagePlaceholder
                  label="Teacher headshot"
                  aspect="square"
                  className="mb-5"
                />
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-ink">
                    {teacher.name}
                  </h2>
                  {teacher.verificationStatus === "Verified" && (
                    <Badge tone="green">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap gap-1.5">
                  {teacher.instruments.map((inst) => (
                    <Badge key={inst} tone="gold">
                      {inst}
                    </Badge>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink/65">
                  {teacher.bio}
                </p>

                <dl className="mt-5 space-y-2 border-t border-hairline pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink/50">Experience</dt>
                    <dd className="text-right font-medium text-ink">
                      {teacher.experience}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink/50">Areas</dt>
                    <dd className="text-right font-medium text-ink">
                      {teacher.areas.join(", ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink/50">Qualification</dt>
                    <dd className="text-right font-medium text-ink">
                      {teacher.qualification}
                    </dd>
                  </div>
                </dl>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <FinalCTA
        headline="Want to be matched with the right teacher?"
        text="Tell us your instrument and level. We'll handle the matching personally."
      />
    </>
  );
}
