import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { BRAND } from "@/lib/data";
import { FOUNDER } from "@/lib/founder";

export function FounderSection() {
  return (
    <Section background="paper" spacing="lg">
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <div className="relative mx-auto max-w-sm">
            {/* Gold frame accent */}
            <div
              aria-hidden="true"
              className="absolute -right-4 -top-4 h-full w-full rounded-2xl border border-gold/40"
            />
            <div className="relative overflow-hidden rounded-2xl border border-hairline shadow-card-hover">
              <Image
                src={FOUNDER.photo}
                alt={FOUNDER.photoAlt}
                width={1024}
                height={1536}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-4 left-4 rounded-xl border border-hairline bg-white px-4 py-3 shadow-card">
              <p className="font-display text-base font-semibold text-ink">
                {FOUNDER.name}
              </p>
              <p className="text-xs text-ink/55">{FOUNDER.role}</p>
            </div>
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
                After teaching more than {BRAND.studentsTaught} one-on-one
                students across {BRAND.region} over a decade - children,
                teenagers, and adults - one pattern became impossible to ignore.
                Great music education wasn&apos;t limited by talented teachers.
                It was limited by inconsistent systems. Musicphonetics was built
                to change that.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/founder" variant="primary" size="lg">
                Read the founder&apos;s story
              </Button>
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
