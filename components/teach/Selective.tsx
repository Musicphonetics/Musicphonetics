import { Section, SectionHeading } from "@/components/ui/Section";
import { MotionReveal } from "./MotionReveal";

const LOOK_FOR = [
  "Genuine command of your instrument",
  "You teach as well as you play",
  "Reliability and real professionalism",
  "Respect for structure and child safety",
];

const STAGES = [
  "Application",
  "Interview",
  "Skill assessment",
  "Teaching evaluation",
  "Background & document verification",
  "Reference checks",
  "Founder approval",
];

export function Selective() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="We're selective — on purpose"
        title="A faculty worth being part of."
        intro="The bar is high because it protects you. The students you teach already trust the name on the door."
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
        <MotionReveal>
          <div>
            <h3 className="text-lg font-semibold text-ink">Who we look for</h3>
            <ul className="mt-5 space-y-3">
              {LOOK_FOR.map((l) => (
                <li key={l} className="flex items-center gap-3 text-ink/75">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[#7A5E0F]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </MotionReveal>
        <MotionReveal delay={120}>
          <div>
            <h3 className="text-lg font-semibold text-ink">The seven-stage selection</h3>
            <ol className="mt-5 space-y-2.5">
              {STAGES.map((s, i) => (
                <li key={s} className="flex items-center gap-3 rounded-xl border border-hairline bg-white px-4 py-3">
                  <span className="font-display text-sm font-semibold text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-medium text-ink">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </MotionReveal>
      </div>
    </Section>
  );
}
