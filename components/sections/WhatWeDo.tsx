import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ProgramIcon } from "@/components/ui/ProgramIcon";
import { whatsappTrialLink } from "@/lib/data";
import type { IconKey } from "@/lib/programs";

const INSTRUMENTS: { name: string; icon: IconKey }[] = [
  { name: "Guitar", icon: "guitar" },
  { name: "Piano / Keyboard", icon: "piano" },
  { name: "Vocals", icon: "vocals" },
  { name: "Ukulele", icon: "ukulele" },
  { name: "Music Theory", icon: "theory" },
];

const AUDIENCES = ["Children", "Beginners", "Adult learners", "Serious learners"];

export function WhatWeDo() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Music classes & what we do"
        title="Premium one-to-one music classes, built around your child."
        intro="Learn guitar, piano, keyboard, or vocals - at home across Delhi NCR or live online - with trained, verified teachers and a clear path to real progress."
      />

      {/* Instruments */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {INSTRUMENTS.map((inst, i) => (
          <Reveal key={inst.name} delay={(i % 5) * 60}>
            <div className="flex h-full flex-col items-center rounded-2xl border border-hairline bg-white p-6 text-center shadow-card transition-transform hover:-translate-y-1">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-deep-gold">
                <ProgramIcon icon={inst.icon} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink">{inst.name}</h3>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Formats + audiences */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="grid h-full gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <h3 className="text-base font-semibold text-ink">Home classes</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                A trained teacher comes to you, across Delhi NCR - personal, focused, and convenient.
              </p>
            </div>
            <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <h3 className="text-base font-semibold text-ink">Online classes</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                The same structured method, live online - learn from any city or country.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex h-full flex-col justify-center rounded-2xl border border-hairline bg-feature-green p-6 text-paper sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Who it&apos;s for</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {AUDIENCES.map((a) => (
                <span key={a} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-paper">
                  {a}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Button href={whatsappTrialLink()} external variant="light">
                Book a Trial
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
