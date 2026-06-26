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
              Musicphonetics offers structured{" "}
              <strong className="font-semibold text-ink">music classes in India</strong>,
              delivered as personal home classes and live{" "}
              <strong className="font-semibold text-ink">online music classes</strong>.
              Whether you are looking for{" "}
              guitar classes, piano and keyboard classes, vocal classes, or
              ukulele and music theory, every student follows the same
              director-led method — not scattered, YouTube-style lessons.
            </p>
            <p>
              We teach both{" "}
              <strong className="font-semibold text-ink">music classes for kids</strong>{" "}
              and{" "}
              <strong className="font-semibold text-ink">music classes for adults</strong>,
              from playful first steps to serious{" "}
              graded preparation. Students who want recognised milestones can
              follow{" "}
              <strong className="font-semibold text-ink">Trinity, ABRSM, and Rockschool exam preparation</strong>{" "}
              pathways as learning references, integrated naturally into the
              method.
            </p>
            <p>
              Today we serve{" "}
              <strong className="font-semibold text-ink">music classes in Delhi NCR</strong>{" "}
              with home and online formats, and we are expanding to Mumbai,
              Bengaluru, Hyderabad, Chennai, Pune, and Kolkata — followed by{" "}
              international locations including Dubai, Singapore, and Malaysia.
              For families abroad, our{" "}
              <strong className="font-semibold text-ink">global online music lessons</strong>{" "}
              bring the same structure to NRI students anywhere in the world.
            </p>
            <p>
              If you have been searching for a reliable{" "}
              <strong className="font-semibold text-ink">music teacher near you</strong>,
              Musicphonetics gives you something most academies cannot: a system,
              a standard, and a clear path from the very first trial class.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
