import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { METHOD_STAGES } from "@/lib/data";

export function MethodPreview() {
  return (
    <Section background="green" spacing="lg">
      <div className="max-w-2xl">
        <Reveal>
          <p className="eyebrow text-gold">Not just classes. A method.</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            Most academies offer lessons. Musicphonetics builds a pathway.
          </h2>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {METHOD_STAGES.map((stage, i) => (
          <Reveal key={stage.name} delay={i * 100}>
            <div className="h-full rounded-2xl border border-white/12 bg-white/5 p-7">
              <p className="font-display text-sm font-semibold text-gold">
                Stage {i + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-paper">
                {stage.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/70">
                {stage.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="mt-10">
          <Button href="/method" variant="light" size="lg">
            Explore the Method
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
