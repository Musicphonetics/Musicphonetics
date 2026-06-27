import { Reveal } from "@/components/ui/Reveal";

interface Stat {
  value: string;
  label: string;
}

// Real quantities only — no adjective-stats.
const DEFAULT_STATS: Stat[] = [
  { value: "10 yrs", label: "Teaching since 2016" },
  { value: "1,100+", label: "Students taught" },
  { value: "Trinity", label: "Graded exam pathways" },
  { value: "Home · Online · Centre", label: "Across Delhi NCR" },
  { value: "7-stage", label: "Faculty selection" },
];

export function ProofStrip({ stats = DEFAULT_STATS }: { stats?: Stat[] }) {
  return (
    <section aria-label="Musicphonetics at a glance" className="border-b border-hairline bg-white">
      <div className="container-mp grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={(i % 5) * 60}>
            <div className="px-3 py-7 text-center sm:py-9">
              <div className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs uppercase tracking-wider text-ink/55">
                {s.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
