import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { REAL_MOMENTS } from "@/lib/home-config";

// "Real students, real stages." A swipeable row on mobile; a clean, evenly
// arranged grid on desktop. All clean, real photos.
export function RealMoments() {
  return (
    <section className="bg-gradient-to-b from-paper to-white py-14 sm:py-20">
      <div className="container-mp">
        <SectionHeader
          eyebrow="From our classes"
          title="Real students. Real stages."
          sub="No stock photos - these are our people, our recitals and our small wins from across Delhi NCR."
          center
        />

        {/* Mobile: swipe. Desktop: an even 4-column grid. */}
        <div role="region" aria-label="Photos from our classes" tabIndex={0} className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-4">
          {REAL_MOMENTS.map((m, i) => (
            <Reveal key={m.src} delay={(i % 4) * 60}>
              <figure className="group relative aspect-[3/4] w-[62vw] max-w-[240px] shrink-0 snap-center overflow-hidden rounded-2xl border border-hairline shadow-card sm:w-auto sm:max-w-none">
                <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-3.5 text-[13px] font-medium leading-snug text-white drop-shadow">{m.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
          <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
        </div>

        <Reveal>
          <p className="mt-8 text-center text-sm text-ink/60">Want your child in the next photo? It starts with one message.</p>
        </Reveal>
      </div>
    </section>
  );
}
