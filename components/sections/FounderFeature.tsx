import Image from "next/image";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Reveal } from "@/components/ui/Reveal";
import { Stave } from "@/components/ui/Stave";
import { Button } from "@/components/ui/Button";
import { FOUNDER } from "@/lib/founder";

const STORY = [
  "Every student came with a different rhythm.",
  "But most music education treated them the same.",
  "After 1,100+ one-on-one students, one thing became clear.",
  "Talent was not the problem.",
  "The system was.",
];

const TIMELINE = [
  { year: "2016", text: "First students" },
  { year: "School years", text: "Classroom discipline & experience" },
  { year: "1,100+", text: "One-on-one learning patterns" },
  { year: "Musicphonetics", text: "Structured music education" },
  { year: "Next phase", text: "Cities, teachers, technology, global learning", roadmap: true },
];

export function FounderFeature() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-32">
      <AuroraBackground />
      <div className="container-mp relative">
        <Reveal>
          <p className="eyebrow text-center text-gold">Why Musicphonetics exists</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-semibold leading-tight sm:text-5xl">
            One guitar. One student. <span className="mp-shimmer">One conviction.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-paper/70">
            After more than 1,100 students taught one to one — and a year leading
            music shows and guidance programmes inside a school of a thousand —
            the founder saw what most miss: talent was never the problem. The
            system was. So he built a better one.
          </p>
          <div className="mt-6 flex justify-center">
            <Stave />
          </div>
        </Reveal>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Cinematic founder frame */}
          <Reveal>
            <div className="relative mx-auto max-w-sm">
              {/* Gold trails / rings */}
              <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] border border-gold/30" />
              <div aria-hidden="true" className="absolute -inset-8 rounded-[2.5rem] border border-gold/10" />

              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/12 shadow-card-hover">
                <Image
                  src={FOUNDER.photo}
                  alt={FOUNDER.photoAlt}
                  width={1024}
                  height={1536}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="font-display text-xl font-semibold text-paper">
                    {FOUNDER.name}
                  </p>
                  <p className="text-sm text-gold">Founder, Musicphonetics</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Scroll story */}
          <div>
            <ol className="space-y-5">
              {STORY.map((line, i) => (
                <Reveal key={line} delay={i * 90} as="li">
                  <p className="flex items-start gap-4 text-xl font-medium leading-snug text-paper/85 sm:text-2xl">
                    <span className="mt-2 h-px w-8 shrink-0 bg-gold" aria-hidden="true" />
                    {line}
                  </p>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={120}>
              <div className="mt-8">
                <Button href="/founder" variant="light" size="lg">
                  Read the full story
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Timeline */}
        <Reveal>
          <div className="mt-20">
            <ol className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] snap-x">
              {TIMELINE.map((t, i) => (
                <li key={t.year} className="w-[200px] shrink-0 snap-start">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${t.roadmap ? "border border-dashed border-gold bg-transparent" : "bg-gold"}`} />
                    {i < TIMELINE.length - 1 && <span className="h-px flex-1 bg-white/15" aria-hidden="true" />}
                  </div>
                  <p className="mt-3 font-display text-lg font-semibold text-paper">{t.year}</p>
                  <p className="mt-1 text-sm text-paper/60">{t.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* Mission / vision — the founder's aspiration, in his words */}
        <Reveal>
          <figure className="mx-auto mt-20 max-w-3xl text-center">
            <blockquote className="font-display text-2xl font-medium leading-snug text-paper sm:text-3xl">
              &ldquo;My dream isn&apos;t to become India&apos;s biggest music teacher.
              It&apos;s to build one of the world&apos;s most trusted music education
              systems.&rdquo;
            </blockquote>
            <figcaption className="mt-5 text-sm text-gold">{FOUNDER.name} · Founder</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
