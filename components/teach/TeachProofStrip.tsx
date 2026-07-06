import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PROOF_STATS } from "@/lib/teach-config";

export function TeachProofStrip() {
  return (
    <Section background="ink" spacing="sm">
      <Reveal>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {PROOF_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-gold sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-paper/60 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={120}>
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-paper/70">
          Recognised with Trinity College London. Government-registered and
          standardised — every process, contract and safeguarding norm is already
          in place, so you walk into a system, not a start-up.
        </p>
      </Reveal>
    </Section>
  );
}
