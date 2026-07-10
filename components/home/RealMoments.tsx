import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { REAL_MOMENTS } from "@/lib/home-config";

// A warm, honest gallery - the "real students, real stages" proof. The five
// strongest, real photos across Delhi NCR.
export function RealMoments() {
  return (
    <section className="bg-paper py-20 text-ink sm:py-28">
      <div className="container-mp">
        <SectionHeader
          eyebrow="From our classes"
          title="Real students. Real stages."
          sub="No stock photos - our students, our recitals, our small wins from across Delhi NCR."
          center
        />

        <div className="mt-12 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {REAL_MOMENTS.slice(0, 5).map((m, i) => (
            <Reveal key={m.src} delay={(i % 3) * 90}>
              <figure className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-hairline shadow-card">
                <img
                  src={m.src}
                  alt={m.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium leading-snug text-white drop-shadow">
                  {m.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm text-ink/60">
            Want your child in the next photo? It starts with one message.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
