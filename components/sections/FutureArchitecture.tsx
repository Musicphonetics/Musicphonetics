import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { FUTURE_DIVISIONS } from "@/lib/founder";

export function FutureArchitecture() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Future brand architecture"
        title="Built so new divisions can grow naturally."
        intro="Education stays at the heart. These are examples of where Musicphonetics could grow over time — illustrative future divisions, not current products."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FUTURE_DIVISIONS.map((d, i) => {
          const isHeart = d.name === "Musicphonetics Learn";
          return (
            <Reveal key={d.name} delay={(i % 4) * 80}>
              <div className="flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6 lift hover:shadow-card-hover">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold text-ink">
                    {d.name}
                  </span>
                  <Badge tone={isHeart ? "gold" : "sample"}>
                    {isHeart ? "The heart" : "Vision"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {d.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
