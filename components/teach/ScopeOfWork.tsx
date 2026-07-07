import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SCOPE } from "@/lib/teach-config";

export function ScopeOfWork() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Scope of work"
        title="Exactly what the role is."
        intro="No ambiguity. This is the whole job - nothing hidden, nothing added later."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {SCOPE.map((s, i) => (
          <Reveal key={s.n} delay={(i % 2) * 70}>
            <div className="flex h-full items-start gap-4 rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold font-display text-sm font-semibold text-[#7A5E0F]">
                {s.n}
              </span>
              <p className="text-sm leading-relaxed text-ink/80">
                {s.text}
                {s.note && (
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-[#7A5E0F]">{s.note}</span>
                )}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
