import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CURRICULUM_LEVELS, TYPICAL_JOURNEY } from "@/lib/curriculum";

export function CurriculumLevels() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="The path by level"
        title="From first note to graded exams."
        intro="Four levels, one structured method. Timeframes below are typical and vary by student."
      />

      <div className="mt-12 space-y-4">
        {CURRICULUM_LEVELS.map((lvl, i) => (
          <Reveal key={lvl.key} delay={(i % 2) * 70}>
            <div className="grid gap-4 rounded-3xl border border-hairline bg-white p-6 shadow-card sm:grid-cols-[0.9fr_1.6fr_1.1fr] sm:items-center sm:p-8">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold font-display text-sm font-semibold text-[#7A5E0F]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">{lvl.name}</h3>
                  <p className="text-xs text-ink/55">{lvl.timeframe} · typical</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink/75">{lvl.works}</p>
              <div className="text-sm">
                <p className="text-ink/80"><span className="font-semibold text-ink">Milestone:</span> {lvl.milestone}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-[#7A5E0F]">
                  {lvl.pathway}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Typical journey strip */}
      <Reveal>
        <div className="mt-10 rounded-3xl border border-hairline bg-ink p-6 text-paper sm:p-8">
          <p className="eyebrow text-gold">A typical journey</p>
          <ol className="mt-5 grid gap-4 sm:grid-cols-4">
            {TYPICAL_JOURNEY.map((j) => (
              <li key={j.when} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-display text-sm font-semibold text-gold">{j.when}</p>
                <p className="mt-1 text-sm text-paper/80">{j.what}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-paper/55">
            A typical journey — every student differs.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
