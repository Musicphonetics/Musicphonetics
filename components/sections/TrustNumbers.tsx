import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

interface Item {
  value?: number;
  suffix?: string;
  big?: string;
  label: string;
}

const ITEMS: Item[] = [
  { value: 10, suffix: "+", label: "Years teaching" },
  { value: 1100, suffix: "+", label: "Students taught" },
  { value: 8, suffix: "-class", label: "Learning cycles" },
  { value: 4, label: "Core learning tracks" },
  { big: "Home + Online", label: "Class formats" },
  { big: "India-first", label: "Global-ready" },
];

export function TrustNumbers() {
  return (
    <section className="border-y border-hairline bg-white">
      <div className="container-mp grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-6">
        {ITEMS.map((item, i) => (
          <Reveal key={item.label} delay={i * 70}>
            <div className="px-4 py-8 text-center sm:py-10">
              <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {item.value !== undefined ? (
                  <CountUp value={item.value} suffix={item.suffix} />
                ) : (
                  item.big
                )}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-wider text-ink/55">
                {item.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
