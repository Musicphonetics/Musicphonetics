import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { FOUNDER_TIMELINE } from "@/lib/founder";
import { cn } from "@/lib/utils";

export function FounderTimeline() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="The timeline"
        title="From one student to a system."
        intro="A decade of teaching, distilled into a methodology — and a roadmap that's still being written."
      />

      <div className="mt-12">
        {/* Horizontal scroll-snap rail */}
        <ol className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] snap-x snap-mandatory">
          {FOUNDER_TIMELINE.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 80} as="li">
              <div className="flex w-[260px] shrink-0 snap-start flex-col sm:w-[300px]">
                {/* Marker + connector */}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-semibold",
                      item.roadmap
                        ? "border border-dashed border-gold/60 bg-gold/10 text-deep-gold"
                        : "bg-ink text-paper"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
                </div>

                <div className="mt-5 flex-1 rounded-2xl border border-hairline bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-deep-gold">
                      {item.period}
                    </span>
                    {item.roadmap && <Badge tone="sample">Roadmap</Badge>}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
