import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ProgressionPath } from "@/components/sections/ProgressionPath";

/** Homepage teaser → /curriculum. */
export function CurriculumTeaser() {
  return (
    <Section background="white" spacing="lg">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
        <Reveal>
          <div>
            <p className="eyebrow">The learning roadmap</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              A clear path from first note to graded exams.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              Four structured levels — Foundation to Advanced — aligned to Trinity,
              ABRSM, and Rockschool grades. See exactly what your child works on and
              when.
            </p>
            <div className="mt-7">
              <Button href="/curriculum" variant="primary" size="lg">
                See the curriculum
              </Button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-3xl border border-hairline bg-paper p-6 sm:p-8">
            <ProgressionPath />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
