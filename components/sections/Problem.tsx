import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const BROKEN = [
  "Parents find teachers randomly.",
  "Students lose rhythm.",
  "Teachers each teach differently.",
  "Progress is unclear.",
];

const FIXED = [
  "Structure",
  "Systems",
  "Teacher standards",
  "Progress tracking",
  "Guided learning",
];

export function Problem() {
  return (
    <Section background="paper" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div>
            <p className="eyebrow">The problem</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Music education has been too random for too long.
            </h2>
            <ul className="mt-8 space-y-3">
              {BROKEN.map((b) => (
                <li key={b} className="flex items-center gap-3 text-ink/70">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink/5 text-ink/40">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="rounded-3xl border border-hairline bg-feature-green p-8 text-paper sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              How Musicphonetics fixes it
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-snug">
              We replace randomness with a system.
            </h3>
            <ul className="mt-7 space-y-3">
              {FIXED.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold text-ink">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="font-medium text-paper">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
