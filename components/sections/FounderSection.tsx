import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { BRAND } from "@/lib/data";

export function FounderSection() {
  return (
    <Section background="paper" spacing="lg">
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <div className="relative max-w-sm">
            <ImagePlaceholder label="Founder portrait" aspect="portrait" />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div>
            <p className="eyebrow">The founder</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Built by {BRAND.founder}.
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink/70">
              <p>
                Musicphonetics began from a simple belief: music education
                should not feel random. Every student deserves a teacher, a
                structure, and a path that respects their pace and potential.
              </p>
              <p>
                {BRAND.founder} has spent over a decade teaching one-to-one
                students across {BRAND.region}, helping beginners, children, and
                serious learners find clarity in music. Musicphonetics brings
                that same personal standard into a larger system.
              </p>
            </div>
            <div className="mt-8">
              <Button href="/method" variant="secondary" size="lg">
                Learn the Method
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
