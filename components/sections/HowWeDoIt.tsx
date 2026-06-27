import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  { title: "Personal assessment", body: "We understand the learner's level, goals, and pace before anything else." },
  { title: "Right teacher matching", body: "You're matched to a verified teacher who fits the student — never random." },
  { title: "Structured monthly classes", body: "A steady cycle of classes that builds real momentum, month after month." },
  { title: "Progress tracking", body: "Clear milestones and feedback, so growth is visible — not guessed at." },
  { title: "Home concerts & performances", body: "Regular performance opportunities that build genuine confidence." },
  { title: "Parent updates", body: "Honest, consistent communication after classes — you're always in the loop." },
];

export function HowWeDoIt() {
  return (
    <Section id="how-we-do-it" background="white" spacing="lg">
      <SectionHeading
        eyebrow="How we do it"
        title="A simple method, run with real discipline."
        intro="Six steps that turn weekly lessons into lasting musical growth."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={(i % 3) * 80}>
            <div className="flex h-full gap-4 rounded-2xl border border-hairline bg-paper p-6">
              <span className="font-display text-3xl font-semibold text-gold/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
