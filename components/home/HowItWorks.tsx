import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01", t: "Match",
    d: "We match a teacher to the student's age, instrument and goal - not whoever happens to be free.",
  },
  {
    n: "02", t: "Method",
    d: "A real curriculum: technique, theory, ear training and rhythm - structure, not just a pile of songs.",
  },
  {
    n: "03", t: "Track",
    d: "Notes, homework and clear direction after every class. Parents see progress, not guesswork.",
  },
  {
    n: "04", t: "Perform",
    d: "Open mics and student showcases every few months. Practice turns into confidence on a real stage.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-ink py-20 text-paper sm:py-28">
      <div className="container-mp">
        <SectionHeader eyebrow="How it works" title="A clear path, not random classes." invert />
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={(i % 2) * 90}>
              <div className="border-t border-white/12 pt-5">
                <span className="font-display text-3xl font-medium text-gold">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-paper sm:text-2xl">{s.t}</h3>
                <p className="mt-2 max-w-sm text-base leading-relaxed text-paper/70">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
