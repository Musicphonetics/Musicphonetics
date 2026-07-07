import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const MILESTONES = [
  { time: "Week 1", text: "Your child becomes comfortable with the instrument." },
  { time: "Week 3", text: "Practice starts to feel less forced." },
  { time: "Month 2", text: "Their first complete song." },
  { time: "Month 4", text: "Rhythm, timing, and confidence improve." },
  { time: "Month 6", text: "Family performance or graded-pathway readiness." },
  { time: "Year 1", text: "A real musical identity begins to form." },
];

export function TransformationPath() {
  return (
    <Section background="ink" spacing="lg">
      <SectionHeading
        eyebrow="The Musicphonetics way"
        title="You don't see lessons. You see a child changing."
        intro="This is what structured learning actually looks like, month by month - a pathway, not a school chart."
        invert
      />

      <div className="relative mx-auto mt-14 max-w-3xl">
        {/* Central glowing trail */}
        <div
          aria-hidden="true"
          className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-gold via-gold/50 to-transparent sm:left-1/2"
        />

        <ol className="space-y-8">
          {MILESTONES.map((m, i) => {
            const left = i % 2 === 0;
            return (
              <Reveal key={m.time} delay={(i % 3) * 80} as="li">
                <div
                  className={cn(
                    "relative pl-12 sm:w-1/2 sm:pl-0",
                    left ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12"
                  )}
                >
                  {/* Node */}
                  <span
                    className={cn(
                      "absolute top-1.5 grid h-8 w-8 place-items-center rounded-full bg-gold text-xs font-bold text-ink shadow-[0_0_16px_rgba(201,162,39,0.6)]",
                      "left-0 sm:left-auto",
                      left ? "sm:-right-4" : "sm:-left-4"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="rounded-2xl border border-white/12 bg-white/5 p-5 sm:p-6">
                    <p className="font-display text-lg font-semibold text-gold">
                      {m.time}
                    </p>
                    <p className="mt-1.5 text-paper/80">{m.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
