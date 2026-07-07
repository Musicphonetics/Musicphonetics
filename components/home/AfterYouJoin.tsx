import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

const POINTS = [
  { t: "A student profile before starting", d: "We learn the student first - level, goal and learning style." },
  { t: "A teacher assigned on fit", d: "Matched to the student, not whoever is free." },
  { t: "Class updates after sessions", d: "What was taught, homework, and what's next." },
  { t: "Progress tracking", d: "A clear view of how the student is growing." },
  { t: "Parent communication", d: "You stay informed, without chasing." },
  { t: "Founder oversight", d: "The standard is held from the top." },
];

function Check() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export function AfterYouJoin() {
  return (
    <section className="bg-ink py-20 text-paper sm:py-24">
      <div className="container-mp">
        <Reveal>
          <p className="eyebrow text-gold">After you join</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            A more organised way to learn music.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/75">
            Every assigned teacher follows a structured Musicphonetics process - so learning stays consistent, tracked and clear.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.t} delay={(i % 3) * 70}>
              <div className="flex h-full items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Check />
                <div>
                  <h3 className="text-sm font-semibold text-paper">{p.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-paper/65">{p.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-9">
            <WhatsAppCTA label="Book a Free Consultation" message={WA_MSG.process} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
