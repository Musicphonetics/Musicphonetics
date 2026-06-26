import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const ITEMS = [
  { title: "Clear learning path", body: "A defined, staged journey from the very first class — never random." },
  { title: "Verified teachers", body: "Every teacher passes a seven-stage quality process before teaching." },
  { title: "Trial before commitment", body: "Begin with a single trial. Continue only when it feels right." },
  { title: "Online and home formats", body: "Learn at home across Delhi NCR, or live online from anywhere." },
  { title: "Progress updates", body: "Feedback after classes, so you always know what comes next." },
  { title: "Grade pathway support", body: "Trinity, ABRSM, and Rockschool pathways for those who want them." },
];

function Check() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-deep-gold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function ParentConfidence() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Clarity, from day one"
        title="Before you begin, everything is clear."
        intro="No guesswork, no pressure. You know exactly what to expect before your first class."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={(i % 3) * 80}>
            <div className="flex h-full gap-4 rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <Check />
              <div>
                <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{item.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
