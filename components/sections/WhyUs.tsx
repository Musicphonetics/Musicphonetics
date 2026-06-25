import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { WHY_CARDS } from "@/lib/data";

export function WhyUs() {
  return (
    <Section id="why-us" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Why Musicphonetics"
        title="A serious standard, built around the student."
        intro="Not a marketplace of random teachers. A guided system parents can trust."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {WHY_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 90}>
            <Card hover className="h-full">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 font-display text-lg font-semibold text-deep-gold">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {card.body}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
