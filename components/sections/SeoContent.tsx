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
          <div className="space-y-5 text-lg leading-relaxed text-ink/70">
            <p>
              Musicphonetics teaches guitar, piano, keyboard, and vocals across
              Delhi NCR — at home, online, and in groups — with a structured,
              faculty-led method rather than scattered, one-off classes.
            </p>
            <p>
              Children taking their first steps and adults returning to an old
              dream learn the same way: a clear path, a real standard, and
              graded exam pathways for those who want them.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
