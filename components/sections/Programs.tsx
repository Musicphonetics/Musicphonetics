import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { PROGRAMS } from "@/lib/data";
import type { ProgramCard } from "@/lib/types";

function statusTone(status: ProgramCard["status"]) {
  switch (status) {
    case "Current":
      return "gold" as const;
    case "Exam pathway":
      return "green" as const;
    default:
      return "muted" as const;
  }
}

export function Programs() {
  return (
    <Section id="pathways" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Programs / Pathways"
        title="One pathway today, room to grow tomorrow."
        intro="One-to-one personal learning is our current primary route. The brand is built to expand into group, academy, and seasonal programs as demand grows."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {PROGRAMS.map((program, i) => (
          <Reveal key={program.title} delay={i * 90}>
            <Card hover className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold text-ink">
                  {program.title}
                </h3>
                <Badge tone={statusTone(program.status)}>{program.status}</Badge>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/65">
                {program.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-10">
          <Button href="/programs" variant="secondary" size="lg">
            Find your pathway
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
