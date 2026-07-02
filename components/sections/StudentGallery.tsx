import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// M9 — real student/teaching photos only. This array is intentionally EMPTY:
// the "Inside our lessons" section renders nothing until images are dropped in
// /public/images/students/ and listed here (see that folder's README).
export type GalleryImage = {
  src: string; // /images/students/lesson-01.webp
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

export const STUDENT_IMAGES: GalleryImage[] = [];

export function StudentGallery({ images = STUDENT_IMAGES }: { images?: GalleryImage[] }) {
  if (!images.length) return null;

  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Inside our lessons"
        title="Real moments, real progress."
        intro="Students at home and on stage across Delhi NCR."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {images.map((img, i) => (
          <Reveal key={img.src} delay={(i % 4) * 60}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-mist shadow-card">
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                sizes="(max-width:640px) 50vw, 22vw"
                placeholder={img.blurDataURL ? "blur" : "empty"}
                blurDataURL={img.blurDataURL}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
