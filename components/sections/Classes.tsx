import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProgramIcon } from "@/components/ui/ProgramIcon";
import { Button } from "@/components/ui/Button";
import { whatsappTrialLink } from "@/lib/data";
import type { IconKey } from "@/lib/programs";

const CARDS: { name: string; benefit: string; icon: IconKey }[] = [
  { name: "Guitar", benefit: "From first chords to full songs.", icon: "guitar" },
  { name: "Piano / Keyboard", benefit: "Melody, harmony, and reading.", icon: "piano" },
  { name: "Vocals", benefit: "Healthy, confident singing.", icon: "vocals" },
  { name: "Ukulele", benefit: "A joyful, easy place to start.", icon: "ukulele" },
  { name: "Home Classes", benefit: "A trained teacher comes to you.", icon: "kids" },
  { name: "Online Classes", benefit: "Same method, learn from anywhere.", icon: "theory" },
];

export function Classes() {
  return (
    <Section id="classes" background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Classes"
        title="Premium music classes, built around the student."
        intro="Choose your instrument and format. Every class follows the same structured, faculty-led method."
      />
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 [scrollbar-width:thin]">
        {CARDS.map((c, i) => (
          <Reveal key={c.name} delay={(i % 3) * 70}>
            <div className="flex h-full w-[78vw] shrink-0 snap-center flex-col rounded-3xl border border-hairline bg-white p-6 shadow-card sm:w-auto sm:shrink">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-deep-gold">
                <ProgramIcon icon={c.icon} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{c.name}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/60">{c.benefit}</p>
              <div className="mt-5">
                <Button href={whatsappTrialLink()} external variant="secondary" fullWidth>
                  Book Trial
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
