import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { EXAM_PATHWAYS, EXAM_DISCLAIMER } from "@/lib/programs";

export function ExamPathway() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Recognised pathways"
        title="Structured around recognised music pathways."
        intro="For students who want graded milestones, our method maps to internationally recognised exam pathways."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {EXAM_PATHWAYS.map((e, i) => (
          <Reveal key={e.name} delay={i * 90}>
            <div className="flex h-full flex-col rounded-2xl border border-hairline bg-white p-7 text-center shadow-card">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-deep-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 18l.9-5.5-4-3.9 5.5-.8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {e.name}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{e.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-ink/50">
        {EXAM_DISCLAIMER}
      </p>
    </Section>
  );
}
