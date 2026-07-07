const STATS = [
  { value: "10+", label: "Years teaching" },
  { value: "1,100+", label: "Students taught" },
  { value: "200+", label: "Trinity exam passes" },
  { value: "5.0★", label: "On Google reviews" },
];

// Light band — deliberate contrast against the dark sections, and the numbers
// that build instant credibility for a first-time visitor.
export function StatsBand() {
  return (
    <section className="bg-paper py-10 text-ink sm:py-12">
      <div className="container-mp">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-[#7A5E0F] sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink/70 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
