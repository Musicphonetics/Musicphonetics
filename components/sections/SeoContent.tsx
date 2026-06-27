import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Readable, premium SEO/GEO content. Natural keywords woven into real prose —
 * not keyword-stuffed. Helps search engines and AI engines understand the
 * company's geography, formats, and offerings.
 */
export function SeoContent() {
  return (
    <Section background="white" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <div>
            <p className="eyebrow">Structured music education</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Music classes in India — and increasingly, the world.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="space-y-5 text-base leading-relaxed text-ink/70">
            <p>
              Musicphonetics teaches guitar, piano, keyboard, vocals, and more —
              one student at a time, at home across Delhi NCR or live online.
              What sets it apart isn&apos;t a longer list of instruments; it&apos;s
              the structure behind every lesson. Each student follows a
              director-led method with a clear path, rather than scattered,
              one-off classes.
            </p>
            <p>
              We teach children taking their very first steps and adults
              returning to an old dream alike. For families who want recognised
              milestones, our teaching maps to graded pathways such as Trinity
              and Rockschool — woven into the learning, never bolted on as
              cramming.
            </p>
            <p>
              We&apos;re based in Delhi NCR today and growing thoughtfully, city
              by city, with online classes that already reach students wherever
              they are. If you&apos;ve struggled to find a teacher you can trust,
              what we offer is simple: a method, a standard, and a real plan from
              the very first trial.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
