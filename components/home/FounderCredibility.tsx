import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { FOUNDER_CREDIBILITY } from "@/lib/home-config";

// The founder's network photos belong here, as credibility, captioned factually,
// never illustrating a lesson.
export function FounderCredibility() {
  return (
    <section className="bg-charcoal-2 py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Beyond the classroom"
          title="Trusted, and in good company."
          sub="Ten years of teaching has put our founder on stages, panels and podiums across Delhi NCR."
          invert
        />

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FOUNDER_CREDIBILITY.map((s, i) => (
            <Reveal key={s.src} delay={(i % 3) * 80}>
              <figure className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img src={s.src} alt={s.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
                <figcaption className="px-4 py-3 text-sm text-ivory/70">{s.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
