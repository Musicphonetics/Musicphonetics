import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// M6 - real faculty only. This array is intentionally EMPTY: the section renders
// nothing until real teachers are added (never a placeholder / "coming soon").
// Add entries here (with a real photo in /public/images/faculty/) and the grid
// appears automatically below the 7-stage selection section.
export type FacultyMember = {
  name: string;
  instruments: string[];
  area: string;
  bio: string;
  photo?: string; // /images/faculty/<name>.webp
  photoAlt?: string;
};

export const FACULTY: FacultyMember[] = [];

export function FacultyProfiles({ teachers = FACULTY }: { teachers?: FacultyMember[] }) {
  if (!teachers.length) return null;

  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Meet the faculty"
        title="The teachers behind the standard."
        intro="Every one has passed the seven-stage selection below."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t, i) => (
          <Reveal key={t.name} delay={(i % 3) * 70}>
            <figure className="h-full overflow-hidden rounded-2xl border border-hairline bg-white shadow-card">
              {t.photo && (
                <div className="relative aspect-[4/3] bg-mist">
                  <Image src={t.photo} alt={t.photoAlt ?? t.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                </div>
              )}
              <figcaption className="p-6">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-ink">{t.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-feature-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-feature-green">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Verified · 7-stage
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/60">{t.instruments.join(" · ")} · {t.area}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">{t.bio}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
