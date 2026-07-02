import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

// Real, defensible safety facts — sourced from the Standards Library
// (7-stage selection, child-protection standard, code of ethics).
const SAFEGUARDS = [
  {
    title: "Police & document verification",
    body: "Every teacher is police-verified and their identity documents checked before they're approved — a required stage of our selection, not an afterthought.",
  },
  {
    title: "Reference checks + founder approval",
    body: "Every teacher clears reference checks and a final founder approval before they teach a single class.",
  },
  {
    title: "A written child-protection standard",
    body: "Conduct in the home, boundaries, and safety are governed by a documented standard — the same for every teacher, every home.",
  },
  {
    title: "You're always in the room",
    body: "Home classes are designed for a parent to be present and informed, with honest updates after every class.",
  },
];

export function SafetyFirst() {
  return (
    <Section id="safety" background="green" spacing="lg">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Safety &amp; child protection
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              A stranger never enters your home.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-paper/80">
              A home class means someone new around your child — we treat that with
              the seriousness it deserves. Every teacher is verified through our
              seven-stage selection before they ever meet a student.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/standards/child-protection" variant="light" size="lg">
                Read our child-protection standard
              </Button>
              <Button
                href="/standards"
                variant="secondary"
                size="lg"
                className="border-white/25 text-paper hover:border-white"
              >
                See all standards
              </Button>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {SAFEGUARDS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 80}>
              <div className="h-full rounded-2xl border border-white/12 bg-white/[0.05] p-6 backdrop-blur-sm">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-ink">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-4 text-base font-semibold text-paper">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/75">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
