import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Mission() {
  return (
    <Section background="paper" spacing="lg">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow">Our mission</p>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 font-display text-2xl font-medium leading-[1.4] text-ink sm:text-[2rem] sm:leading-[1.4]">
            To give every learner a teacher, a structure, and a path - so that
            music never feels random, and progress never depends on luck.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Musicphonetics is an education-first music company founded in India,
            built for structured music learning across cities, countries, and
            online classrooms - designed to last for decades, not seasons.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
