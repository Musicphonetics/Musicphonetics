import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const FACTS = [
  "Home, online, or at our South Delhi centre",
  "Flexible slots",
  "8 classes a month",
  "Starts with a free trial",
];

const STEPS = [
  { n: 1, t: "Message us", d: "Tell us the instrument and who it's for." },
  { n: 2, t: "Free trial with a matched teacher", d: "Meet a teacher chosen for the student - no commitment." },
  { n: 3, t: "Your personalised plan", d: "We confirm slot, faculty, and plan on the trial." },
];

export function ScheduleBlock() {
  return (
    <Section background="white" spacing="lg">
      <Reveal>
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Simple to start, built around your schedule.
          </h2>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {FACTS.map((f) => (
            <span key={f} className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-4 py-2 text-sm font-medium text-ink/80">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-feature-green"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {f}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={(i % 3) * 80}>
            <div className="h-full rounded-2xl border border-hairline bg-paper p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-gold font-display text-sm font-semibold text-[#7A5E0F]">
                {s.n}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
