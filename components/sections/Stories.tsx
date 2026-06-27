import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";

type CTA = "Watch" | "Read" | "Coming Soon";

const FEATURED = {
  title: "Six years. One family. A lifetime of music.",
  line: "What begins as a weekly class becomes part of who a child is — practice, performance, and quiet confidence that lasts.",
  cta: "Coming Soon" as CTA,
};

const STORIES: { title: string; line: string; cta: CTA; tag: string }[] = [
  { title: "Monthly Home Concerts", line: "Students perform for family — confidence, built one evening at a time.", cta: "Watch", tag: "Performance" },
  { title: "Quarterly Stage Performances", line: "Real auditoriums, real audiences, real stage presence.", cta: "Coming Soon", tag: "Performance" },
  { title: "Annual Musicphonetics Awards", line: "A celebration of a year's growth — certificates, guests, families.", cta: "Coming Soon", tag: "Celebration" },
  { title: "Two Daughters, Two Instruments", line: "Guitar and piano, under one roof.", cta: "Coming Soon", tag: "Family" },
  { title: "Mother & Daughter Learning Together", line: "Music as a shared family ritual.", cta: "Coming Soon", tag: "Family" },
  { title: "An Adult Learner's Journey", line: "It's never too late to begin.", cta: "Read", tag: "Journey" },
  { title: "Director Sessions", line: "Direct mentoring that keeps students inspired.", cta: "Coming Soon", tag: "Mentoring" },
  { title: "The First Few Months", line: "What real beginnings actually look like.", cta: "Read", tag: "Journey" },
];

function CtaPill({ cta }: { cta: CTA }) {
  return (
    <span className={cn(
      "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
      cta === "Coming Soon" ? "bg-white/10 text-paper/60" : "bg-gold/20 text-gold"
    )}>
      {cta !== "Coming Soon" && <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>}
      {cta}
    </span>
  );
}

export function Stories() {
  return (
    <Section id="stories" background="ink" spacing="lg">
      <SectionHeading
        eyebrow="Stories"
        title="What happens after you join."
        intro="Music education isn't a class on a calendar — it's a journey of growth, performance, and family moments. This is what that looks like."
        invert
      />

      {/* Featured story */}
      <Reveal>
        <article className="group relative mt-12 grid overflow-hidden rounded-3xl border border-white/10 lg:grid-cols-2">
          <div className="relative min-h-[260px]">
            <ImagePlaceholder label="Featured story · film still" aspect="landscape" tone="ink" className="absolute inset-0 h-full w-full rounded-none border-0" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>
          <div className="flex flex-col justify-center bg-white/[0.03] p-8 sm:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Featured story</span>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">{FEATURED.title}</h3>
            <p className="mt-3 text-paper/70">{FEATURED.line}</p>
            <div className="mt-5"><CtaPill cta={FEATURED.cta} /></div>
          </div>
        </article>
      </Reveal>

      {/* Story tiles — swipe on mobile */}
      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [scrollbar-width:thin]">
        {STORIES.map((s, i) => (
          <Reveal key={s.title} delay={(i % 4) * 60}>
            <article className="flex h-full w-[74vw] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:w-auto sm:shrink">
              <div className="relative">
                <ImagePlaceholder label="Story moment" aspect="landscape" tone="ink" className="rounded-none border-0" />
                <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold backdrop-blur-sm">{s.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h4 className="font-display text-base font-semibold text-paper">{s.title}</h4>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-paper/60">{s.line}</p>
                <div className="mt-4"><CtaPill cta={s.cta} /></div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
