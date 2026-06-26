import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const QA = [
  {
    q: "Will my child practise?",
    a: "Structure makes practice a habit, not a fight. Most parents notice their child practising without being pushed within weeks.",
  },
  {
    q: "Will the teacher be reliable?",
    a: "Every teacher is verified and punctual, with feedback after each class. Reliability is part of the standard, not a hope.",
  },
  {
    q: "Will I know progress?",
    a: "Learning follows a clear, staged path, so you always know what your child is working on and what comes next.",
  },
  {
    q: "Can my child prepare for grades?",
    a: "Yes — we align to recognised graded pathways (Trinity, ABRSM, Rockschool) where applicable, without making it stressful.",
  },
  {
    q: "Can classes happen online or at home?",
    a: "Both. Home classes across Delhi NCR and live online classes anywhere — same method, same standard.",
  },
  {
    q: "Is there a structure after the trial?",
    a: "Always. The trial leads into a clear learning cycle with a recommended path — never random, never open-ended.",
  },
];

export function ParentConfidence() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="For parents"
        title="What parents want to know before paying."
        intro="Honest answers to the questions every parent asks — because trust should come before payment."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {QA.map((item, i) => (
          <Reveal key={item.q} delay={(i % 3) * 80}>
            <div className="flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 text-sm font-bold text-deep-gold">
                  ?
                </span>
                <h3 className="text-base font-semibold text-ink">{item.q}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{item.a}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
