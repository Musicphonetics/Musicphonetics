import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

const NUMBERS = [
  { value: 10, suffix: "+", label: "Years teaching", note: "A decade refining how music is actually taught." },
  { value: 1100, suffix: "+", label: "Students taught", note: "Children, teenagers, and adults — personally." },
  { value: 8, suffix: "", label: "Classes / cycle", note: "A steady monthly rhythm that builds momentum." },
  { value: 4, suffix: "", label: "Core learning tracks", note: "Foundation, Fluency, Performance, Mastery." },
  { value: 3, suffix: "", label: "Learning formats", note: "Home, online, and future academy pathways." },
];

export function NumbersStory() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="The numbers tell the story"
        title="A decade of teaching, in five numbers."
        intro="Every number is real, and every one has a reason behind it."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {NUMBERS.map((n, i) => (
          <Reveal key={n.label} delay={(i % 5) * 70}>
            <div className="flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6">
              <span className="font-display text-4xl font-semibold text-ink">
                <CountUp value={n.value} suffix={n.suffix} />
              </span>
              <span className="mt-1 text-sm font-semibold text-deep-gold">
                {n.label}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{n.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
