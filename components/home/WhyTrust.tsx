import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

const STEPS = [
  { n: "01", t: "We understand the student", d: "Age, level, instrument, goal and learning style — before anything begins." },
  { n: "02", t: "We recommend the right path", d: "A pathway matched to the student, not a one-size-fits-all class." },
  { n: "03", t: "We assign the right teacher", d: "A teacher chosen on fit — the right person for this learner." },
  { n: "04", t: "We track progress & guide", d: "Class updates, progress notes and clear direction over time." },
];

const TAGS = ["Guitar", "Piano / Keyboard", "Vocals", "Delhi NCR + Online"];

export function WhyTrust() {
  return (
    <section className="bg-ink py-20 text-paper sm:py-24">
      <div className="container-mp">
        <Reveal>
          <p className="eyebrow text-gold">Not random tuition</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            A structured system, not a random class.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/75">
            Before a student begins, we understand who they are — then build the path around them.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={(i % 4) * 70}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <span className="font-display text-2xl font-semibold text-gold">{s.n}</span>
                <h3 className="mt-3 text-base font-semibold text-paper">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/65">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {TAGS.map((t) => (
              <span key={t} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-paper/75">{t}</span>
            ))}
          </div>
          <div className="mt-8">
            <WhatsAppCTA label="Find the Right Path" message={WA_MSG.why} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
