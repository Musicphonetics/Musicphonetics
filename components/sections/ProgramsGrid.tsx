import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ProgramIcon } from "@/components/ui/ProgramIcon";
import { PROGRAM_ITEMS } from "@/lib/programs";
import { whatsappLink } from "@/lib/data";

export function ProgramsGrid() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Programs"
        title="One method, every instrument and stage."
        intro="Choose where to begin. Every program follows the same structured, faculty-led standard."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROGRAM_ITEMS.map((p, i) => (
          <Reveal key={p.title} delay={(i % 3) * 80}>
            <div className="group flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-deep-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                <ProgramIcon icon={p.icon} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/60">
                {p.outcome}
              </p>
              <div className="mt-5">
                <Button
                  href={whatsappLink(
                    `Hi Musicphonetics, I'd like to enquire about ${p.title} classes.`
                  )}
                  external
                  variant="secondary"
                >
                  Enquire
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
