import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

interface Exp {
  title: string;
  body: string;
  art: React.ReactNode;
}

// Generated, branded background artwork (consistent luxury style — no stock).
function Art({ children, from, to }: { children: React.ReactNode; from: string; to: string }) {
  return (
    <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}>
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full opacity-90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {children}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
    </div>
  );
}

const G = "rgba(201,162,39,0.55)";
const Gf = "rgba(201,162,39,0.18)";

const EXPERIENCES: Exp[] = [
  {
    title: "Monthly Home Concerts",
    body: "Students perform for family in their own home — proud parents, warm cinematic moments, real confidence built monthly.",
    art: (
      <Art from="#1a1208" to="#0B0F18">
        <ellipse cx="200" cy="150" rx="160" ry="120" fill={Gf} />
        <circle cx="200" cy="150" r="40" fill="none" stroke={G} strokeWidth="1.2" />
        <circle cx="200" cy="150" r="70" fill="none" stroke={Gf} strokeWidth="1" />
        <path d="M120 360 h160 v60 h-160 z" fill="none" stroke={Gf} strokeWidth="1" />
      </Art>
    ),
  },
  {
    title: "Quarterly Stage Performances",
    body: "Professional auditoriums, stage lighting, and a real audience — performance experience that exam halls can't give.",
    art: (
      <Art from="#0d1f17" to="#0B0F18">
        <path d="M200 40 L120 220 H280 Z" fill={Gf} />
        <path d="M200 40 L60 260 H340 Z" fill="none" stroke={G} strokeWidth="1" />
        <line x1="200" y1="40" x2="200" y2="300" stroke={Gf} strokeWidth="1" />
      </Art>
    ),
  },
  {
    title: "Student Collaborations",
    body: "Learners of similar age and different instruments practise together — a creative environment, not an isolated lesson.",
    art: (
      <Art from="#101522" to="#0B0F18">
        <circle cx="140" cy="160" r="6" fill={G} />
        <circle cx="270" cy="120" r="6" fill={G} />
        <circle cx="210" cy="250" r="6" fill={G} />
        <circle cx="300" cy="240" r="6" fill={G} />
        <path d="M140 160 L270 120 L210 250 L300 240 L140 160" fill="none" stroke={Gf} strokeWidth="1.2" />
      </Art>
    ),
  },
  {
    title: "Join the Ecosystem",
    body: "Not one teacher — one learning community. Parents, teachers, students, and technology, all connected.",
    art: (
      <Art from="#0d1b16" to="#0B0F18">
        <circle cx="200" cy="160" r="10" fill={G} />
        {[40, 100, 160, 220, 280, 340].map((a, i) => {
          const r = (a * Math.PI) / 180;
          const x = 200 + Math.cos(r) * 110;
          const y = 160 + Math.sin(r) * 110;
          return <g key={i}><line x1="200" y1="160" x2={x} y2={y} stroke={Gf} strokeWidth="1" /><circle cx={x} cy={y} r="5" fill={G} /></g>;
        })}
      </Art>
    ),
  },
  {
    title: "Director Sessions",
    body: "The Director works directly with students — motivation, Q&A, workshops, and mentoring beyond the weekly class.",
    art: (
      <Art from="#1a1208" to="#0B0F18">
        <circle cx="200" cy="150" r="34" fill="none" stroke={G} strokeWidth="1.4" />
        <circle cx="200" cy="150" r="64" fill="none" stroke={Gf} strokeWidth="1" />
        <circle cx="200" cy="150" r="94" fill="none" stroke={Gf} strokeWidth="0.8" />
      </Art>
    ),
  },
  {
    title: "Annual Musicphonetics Awards",
    body: "A luxury celebration — certificates, awards, guest artists, and families, recognising a year of real growth.",
    art: (
      <Art from="#15110a" to="#0B0F18">
        <path d="M200 90 l18 40 44 5 -32 30 9 44 -39 -22 -39 22 9 -44 -32 -30 44 -5 z" fill={Gf} stroke={G} strokeWidth="1.2" strokeLinejoin="round" />
      </Art>
    ),
  },
];

export function MoreThanLessons() {
  return (
    <Section background="ink" spacing="lg">
      <SectionHeading
        eyebrow="The experience"
        title="More than weekly lessons."
        intro="Musicphonetics surrounds the weekly class with a full calendar of performance, community, and celebration."
        invert
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXPERIENCES.map((exp, i) => (
          <Reveal key={exp.title} delay={(i % 3) * 80}>
            <article className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl border border-white/10">
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                {exp.art}
              </div>
              <div className="relative p-6">
                <h3 className="font-display text-xl font-semibold text-paper">{exp.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{exp.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-paper/45">
        Card artwork is original and branded. Real photography will be added as events are documented.
      </p>
    </Section>
  );
}
