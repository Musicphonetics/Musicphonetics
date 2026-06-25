import { Reveal } from "@/components/ui/Reveal";
import { TRUST_STATS } from "@/lib/data";

export function TrustStrip() {
  return (
    <section className="border-y border-hairline bg-white">
      <div className="container-mp grid grid-cols-2 divide-x divide-hairline lg:grid-cols-4">
        {TRUST_STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80}>
            <div className="px-4 py-8 text-center sm:py-10">
              <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink/55 sm:text-sm">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
