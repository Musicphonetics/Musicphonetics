import { Section, SectionHeading } from "@/components/ui/Section";
import { MotionReveal } from "./MotionReveal";

const PAINS = [
  { title: "Forever finding students", body: "Every month starts at zero - chasing leads, posting ads, replacing the ones who drift away." },
  { title: "Late, unpredictable pay", body: "Cash that arrives whenever, if it arrives. No structure, no certainty, no leverage." },
  { title: "You're the whole business", body: "Teacher, salesperson, accountant, scheduler, and support desk - all at once, all unpaid." },
];

export function PainCards() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="The reality of going it alone"
        title="Teaching is the easy part. Everything else isn't."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {PAINS.map((p, i) => (
          <MotionReveal key={p.title} delay={i * 110}>
            <div className="h-full rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink/40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
            </div>
          </MotionReveal>
        ))}
      </div>
    </Section>
  );
}
