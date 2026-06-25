import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  { title: "Student enters", note: "A short guided conversation to understand you." },
  { title: "First lesson", note: "Comfort, posture, and a real instrument in hand." },
  { title: "Rhythm", note: "Timing and groove — the heartbeat of music." },
  { title: "Technique", note: "Clean, confident control of the instrument." },
  { title: "Songs", note: "Complete pieces, start to finish." },
  { title: "Musical confidence", note: "Playing freely, expressively, without fear." },
  { title: "Performance", note: "Stage presence and exam readiness." },
  { title: "Long-term musician", note: "A foundation that lasts a lifetime." },
];

export function MusicJourney() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="The learning journey"
        title="From first lesson to lifelong musician."
        intro="Every student follows the same intentional arc — each stage building naturally on the last."
      />
      <div className="mt-12">
        <ol className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] snap-x snap-mandatory">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={(i % 4) * 70} as="li">
              <div className="flex w-[220px] shrink-0 snap-start flex-col sm:w-[240px]">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-semibold text-paper">
                    {i + 1}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="h-px flex-1 bg-gradient-to-r from-gold to-transparent" aria-hidden="true" />
                  )}
                </div>
                <div className="mt-4 flex-1 rounded-2xl border border-hairline bg-white p-5 shadow-card">
                  <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{step.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
