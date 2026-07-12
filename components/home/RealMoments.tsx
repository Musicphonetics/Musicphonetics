import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { REAL_MOMENTS } from "@/lib/home-config";

// The six strongest real photos, one consistent treatment.
export function RealMoments() {
  const moments = REAL_MOMENTS;
  return (
    <section className="bg-charcoal py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader
          eyebrow="From our classes"
          title="Real students. Real stages."
          sub="No stock photos, our people, our recitals and our small wins from across Delhi NCR."
          invert
        />

        <div role="region" aria-label="Photos from our classes" tabIndex={0} className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
          {moments.map((m, i) => (
            <Reveal key={m.src} delay={(i % 3) * 60}>
              <figure className="group relative aspect-[3/4] w-[62vw] max-w-[240px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 sm:w-auto sm:max-w-none">
                <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,20,29,0.85),transparent_55%)]" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 text-[13px] leading-snug text-ivory drop-shadow">{m.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
          <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
        </div>

        <Reveal><p className="mt-8 text-center text-sm text-ivory/60">Want your child in the next photo? It starts with one message.</p></Reveal>
      </div>
    </section>
  );
}
