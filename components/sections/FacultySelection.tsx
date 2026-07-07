import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Stave } from "@/components/ui/Stave";

interface Stage {
  n: string;
  title: string;
  body: string;
}

const STAGES: Stage[] = [
  { n: "01", title: "Application", body: "Proficiency, experience, and fit are reviewed before anything else." },
  { n: "02", title: "Interview", body: "A direct conversation on communication, professionalism, and values." },
  { n: "03", title: "Skill assessment", body: "The teacher demonstrates genuine command of their instrument." },
  { n: "04", title: "Teaching evaluation", body: "A live demo lesson. Playing well and teaching well are not the same thing - we hire for the second." },
  { n: "05", title: "Background & document verification", body: "Identity, qualifications, and credentials confirmed against originals." },
  { n: "06", title: "Reference checks", body: "Real accounts of reliability and conduct from people who have worked with them." },
  { n: "07", title: "Founder approval", body: "No teacher reaches a student without a final personal sign-off." },
];

export function FacultySelection({
  eyebrow = "Faculty",
  title = "Every teacher is chosen, not listed.",
  intro = "We don't run a marketplace of strangers. Every Musicphonetics teacher passes a seven-stage selection before they teach a single student - because each one carries our name into your home and onto our stage.",
  stages = STAGES,
  closing = "Faculty teach across Delhi NCR - at home, online, and at our centre.",
  ctaHref = "/standards",
  ctaLabel = "See our teaching standards",
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  stages?: Stage[];
  closing?: string;
  ctaHref?: string;
  ctaLabel?: string;
} = {}) {
  return (
    <Section id="teachers" background="paper" spacing="lg">
      <div className="max-w-2xl">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/70 sm:text-lg">{intro}</p>
          <Stave className="mt-6" />
        </Reveal>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((s, i) => (
          <Reveal key={s.n} delay={(i % 3) * 70} as="li">
            <div className="flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <span className="font-display text-2xl font-semibold text-gold/50">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink/70">{closing}</p>
          <a href={ctaHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-deep-gold hover:underline">
            {ctaLabel} <span aria-hidden="true">→</span>
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
