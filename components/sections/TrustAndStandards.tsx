import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { RECOGNITION } from "@/lib/media";
import { STANDARDS_COUNT } from "@/lib/standards-data";

export function TrustAndStandards() {
  return (
    <Section id="standards" background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Recognition & features"
        title="Seen on stage, on panels, and in the room."
        intro="Beyond the classroom, our founder performs, judges, and is invited where music is taken seriously — the same standard your child learns under."
      />

      {/* Recognition — real photography */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {RECOGNITION.map((img, i) => (
          <Reveal key={img.src} delay={(i % 4) * 70}>
            <figure className="group relative overflow-hidden rounded-2xl shadow-card">
              <Photo
                image={img}
                aspect="portrait"
                sizes="(max-width: 640px) 50vw, 22vw"
                rounded="rounded-2xl"
                className="transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-xs font-medium leading-snug text-paper/95">
                {img.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      {/* Standards as a trust layer */}
      <Reveal>
        <div className="mt-8 overflow-hidden rounded-3xl border border-hairline bg-ink text-paper">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                The Standards Library
              </p>
              <h3 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
                Built on {STANDARDS_COUNT} institutional standards.
              </h3>
              <p className="mt-3 max-w-xl text-paper/70">
                Covering teaching, child safety, progress, quality, parent
                communication, teacher conduct, and student growth — written,
                reviewed, and improved. Proof, not promises.
              </p>
            </div>
            <div className="lg:text-right">
              <Button href="/standards" variant="light" size="lg">
                Explore Standards
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
