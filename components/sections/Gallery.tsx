import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const GALLERY_SLOTS: { label: string; aspect: "square" | "portrait" | "landscape" }[] = [
  { label: "Lesson photo · home class", aspect: "landscape" },
  { label: "Student performance photo", aspect: "portrait" },
  { label: "Trinity certificate photo", aspect: "square" },
  { label: "Lesson photo · online class", aspect: "square" },
  { label: "Student recital photo", aspect: "landscape" },
  { label: "Teacher with student", aspect: "portrait" },
];

export function Gallery() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Moments"
        title="Real learning, in real homes and online."
        intro="Image placeholders below. Replace each with a real, alt-described photo before launch."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GALLERY_SLOTS.map((slot, i) => (
          <Reveal key={slot.label} delay={(i % 3) * 80}>
            <ImagePlaceholder label={slot.label} aspect={slot.aspect} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
