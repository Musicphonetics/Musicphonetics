import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { LIFE_AT_MP } from "@/lib/media";

export function LifeAtMusicphonetics() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Life at Musicphonetics"
        title="Music that leaves the practice room."
        intro="Open mics, stages, showcases, and the moments students remember - this is what learning here actually feels like."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {LIFE_AT_MP.map((img, i) => (
          <Reveal key={img.src} delay={(i % 4) * 70}>
            <figure className="group relative overflow-hidden rounded-2xl shadow-card">
              <Photo
                image={img}
                aspect="portrait"
                sizes="(max-width: 640px) 50vw, 22vw"
                rounded="rounded-2xl"
                className="transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-xs font-medium text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {img.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
