import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const STORIES: { title: string; line: string; cta: "Watch" | "Read" | "Coming Soon" }[] = [
  { title: "6 Years With Musicphonetics", line: "One family's long journey of growth.", cta: "Coming Soon" },
  { title: "Two Daughters, Two Instruments", line: "Guitar and piano, under one roof.", cta: "Coming Soon" },
  { title: "Mother & Daughter Learning Together", line: "Music as a shared family ritual.", cta: "Coming Soon" },
  { title: "An Adult Learner's Journey", line: "It's never too late to begin.", cta: "Coming Soon" },
  { title: "Twins Learning Together", line: "Friendly rivalry, real progress.", cta: "Coming Soon" },
  { title: "Monthly Home Concerts", line: "Confidence, built one performance at a time.", cta: "Watch" },
  { title: "From Keyboard to Guitar", line: "Exploring a second instrument.", cta: "Coming Soon" },
  { title: "The First Few Months", line: "What real beginnings look like.", cta: "Read" },
];

export function Stories() {
  return (
    <Section id="stories" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Musicphonetics Stories"
        title="Real families. Real journeys."
        intro="The moments behind the method — told as stories, not statistics. Video and photo stories are being added over time."
      />
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [scrollbar-width:thin]">
        {STORIES.map((s, i) => (
          <Reveal key={s.title} delay={(i % 4) * 60}>
            <article className="flex h-full w-[72vw] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-hairline bg-paper shadow-card sm:w-auto sm:shrink">
              <ImagePlaceholder label="Story photo / video" aspect="landscape" />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/60">{s.line}</p>
                <span
                  className={
                    "mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold " +
                    (s.cta === "Coming Soon"
                      ? "bg-ink/5 text-ink/50"
                      : "bg-gold/15 text-deep-gold")
                  }
                >
                  {s.cta !== "Coming Soon" && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  )}
                  {s.cta}
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
