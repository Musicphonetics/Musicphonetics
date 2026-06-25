import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { HOW_STEPS } from "@/lib/data";

export function HowItWorks() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="How it works"
        title="A calm, guided start — no pressure."
        intro="You begin with a short guided conversation. Then the Musicphonetics team helps you move toward the right teacher, format, and plan."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {HOW_STEPS.map((step, i) => (
          <Reveal key={step.step} delay={i * 100}>
            <div className="relative h-full">
              <span className="font-display text-5xl font-semibold text-gold/40">
                {step.step}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
