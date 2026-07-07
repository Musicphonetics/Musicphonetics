import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

// Real experiences that happen after joining - stated factually, no
// "Coming Soon" tiles. Real student/film stories slot in here as they're filmed.
const EXPERIENCES: { title: string; line: string; tag: string }[] = [
  { title: "Monthly Home Concerts", line: "Students perform for family at home - confidence built one evening at a time.", tag: "Performance" },
  { title: "Quarterly Stage Performances", line: "Real auditoriums and audiences - composure that exam rooms can't teach.", tag: "Performance" },
  { title: "Annual Musicphonetics Awards", line: "A celebration of a year's growth, with certificates, guests, and families.", tag: "Celebration" },
  { title: "Director Sessions", line: "Direct mentoring that keeps students inspired between weekly classes.", tag: "Mentoring" },
  { title: "Student Collaborations", line: "Playing alongside peers builds listening, discipline, and belonging.", tag: "Community" },
];

export function Stories() {
  return (
    <Section id="stories" background="ink" spacing="lg">
      <SectionHeading
        eyebrow="Beyond the lessons"
        title="What happens after you join."
        intro="Music education isn't a class on a calendar - it's a year of growth, performance, and family moments. This is the culture every student becomes part of."
        invert
      />

      {/* Featured */}
      <Reveal>
        <article className="relative mt-12 grid overflow-hidden rounded-3xl border border-white/10 lg:grid-cols-2">
          <div className="relative min-h-[260px]">
            <ImagePlaceholder label="Home concert · film still" aspect="landscape" tone="ink" className="absolute inset-0 h-full w-full rounded-none border-0" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>
          <div className="flex flex-col justify-center bg-white/[0.03] p-8 sm:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">The culture</span>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
              A weekly class becomes part of who a child is.
            </h3>
            <p className="mt-3 text-paper/70">
              Practice, performance, and quiet confidence - built over months and
              years, and shared with the people who matter most.
            </p>
          </div>
        </article>
      </Reveal>

      {/* Experience tiles */}
      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5 [scrollbar-width:thin]">
        {EXPERIENCES.map((s, i) => (
          <Reveal key={s.title} delay={(i % 5) * 60}>
            <article className="flex h-full w-[74vw] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:w-auto sm:shrink">
              <div className="relative">
                <ImagePlaceholder label="Photo" aspect="landscape" tone="ink" className="rounded-none border-0" />
                <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold backdrop-blur-sm">{s.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h4 className="font-display text-base font-semibold text-paper">{s.title}</h4>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-paper/60">{s.line}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
