import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

// M3.1 - real, defensible numbers only. Count up once on scroll into view.
const STATS = [
  { value: 10, suffix: " yrs", label: "Teaching since 2016" },
  { value: 1100, suffix: "+", label: "Students taught" },
  { value: 8, suffix: "", label: "Classes / cycle" },
  { value: 23, suffix: "", label: "Institutional standards" },
  { value: 7, suffix: "-stage", label: "Faculty selection" },
];

export function ProofBand() {
  return (
    <Section background="ink" spacing="md">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-center sm:grid-cols-3 lg:grid-cols-5">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={(i % 5) * 60}>
            <div>
              <p className="font-display text-4xl font-semibold text-gold sm:text-5xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-paper/70">
                {s.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
