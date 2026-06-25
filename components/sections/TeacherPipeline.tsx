import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const STAGES = [
  { title: "Application", note: "Teachers apply to join the network." },
  { title: "Interview", note: "A conversation about values and approach." },
  { title: "Skill assessment", note: "Demonstrated musicianship and ability." },
  { title: "Teaching evaluation", note: "Can they actually teach it well?" },
  { title: "Background verification", note: "Safety checks for families." },
  { title: "Founder approval", note: "Final sign-off by Director Abhishek.", highlight: true },
  { title: "Live classes", note: "Only then do they teach students." },
];

export function TeacherPipeline() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Teacher quality pipeline"
        title="Trust you can see, not just a word."
        intro="“Verified” isn't a label we print. It's a seven-stage system every teacher passes before a single class."
      />

      <ol className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {STAGES.map((stage, i) => (
          <Reveal key={stage.title} delay={i * 90} as="li">
            <div
              className={cn(
                "relative flex h-full flex-col rounded-2xl border p-5",
                stage.highlight
                  ? "border-gold bg-gold/5 ring-1 ring-gold/40"
                  : "border-hairline bg-paper"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full font-display text-sm font-semibold",
                    stage.highlight ? "bg-gold text-ink" : "bg-ink text-paper"
                  )}
                >
                  {i + 1}
                </span>
                {i < STAGES.length - 1 && (
                  <span className="hidden text-gold lg:inline" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink">{stage.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink/60">{stage.note}</p>
              {stage.highlight && (
                <Badge tone="gold" className="mt-3 w-fit">
                  Director checkpoint
                </Badge>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
