import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { TEACHERS } from "@/lib/teachers";

const FEATURED = TEACHERS.slice(0, 3);

export function TeacherShowcase() {
  return (
    <Section id="teachers" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Teachers"
        title="Who will teach you?"
        intro="Not a marketplace of strangers - a verified network of teachers, matched to your instrument, level, and goal."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {FEATURED.map((t, i) => (
          <Reveal key={t.id} delay={i * 90}>
            <Link
              href={`/teachers/profile/${t.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6 shadow-card transition-all hover:-translate-y-1.5 hover:shadow-card-hover"
            >
              <ImagePlaceholder label="Teacher portrait" aspect="square" className="mb-5" />
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-deep-gold">{t.name}</h3>
                {t.verified && (
                  <Badge tone="green">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Verified
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.instruments.map((inst) => <Badge key={inst} tone="gold">{inst}</Badge>)}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/60">{t.bio}</p>
              <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 text-xs text-ink/55">
                <span>{t.cities.join(" / ")}</span>
                <span>{t.experience}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-10">
          <Button href="/teachers" variant="secondary" size="lg">
            Meet all teachers
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
