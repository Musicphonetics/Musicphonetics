import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { REAL_MOMENTS } from "@/lib/home-config";

// A warm, honest gallery - the "real students, real stages" proof. The five
// strongest, real photos across Delhi NCR.
export function RealMoments() {
  return (
    <section className="bg-onyx py-16 text-paper sm:py-28">
      <div className="container-mp">
        <SectionHeader
          eyebrow="From our classes"
          title="Real students. Real stages."
          sub="No stock photos - our students, our recitals, our small wins from across Delhi NCR."
          center
          invert
        />

        <div className="mt-10 gap-3 [column-fill:_balance] columns-2 sm:mt-12 sm:gap-4 lg:columns-3">
          {REAL_MOMENTS.slice(0, 5).map((m, i) => (
            <Reveal key={m.src} delay={(i % 3) * 90}>
              <figure className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-white/10 sm:mb-4 sm:rounded-2xl">
                <img
                  src={m.src}
                  alt={m.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-2.5 text-[11px] font-medium leading-snug text-white drop-shadow sm:p-4 sm:text-sm">
                  {m.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm text-paper/60">
            Want your child in the next photo? It starts with one message.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
