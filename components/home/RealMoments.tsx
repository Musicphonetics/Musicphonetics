import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { REAL_MOMENTS } from "@/lib/home-config";

// "Real students, real stages." A big swipeable gallery up top, then a compact
// grid underneath - lots of real photos, app-like to browse.
export function RealMoments() {
  const swipe = REAL_MOMENTS.slice(0, 6);
  const grid = REAL_MOMENTS.slice(6);
  return (
    <section className="bg-onyx py-14 sm:py-24">
      <div className="container-mp">
        <SectionHeader
          eyebrow="From our classes"
          title="Real students. Real stages."
          sub="No stock photos - these are our people, our recitals and our small wins from across Delhi NCR."
          invert
        />
      </div>

      {/* Swipeable hero gallery */}
      <Reveal>
        <div
          role="region"
          aria-label="Photos from our classes"
          tabIndex={0}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:px-8"
        >
          {swipe.map((m) => (
            <figure key={m.src} className="relative w-[82vw] max-w-[340px] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 sm:w-[380px]">
              <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium leading-snug text-white drop-shadow">{m.caption}</figcaption>
            </figure>
          ))}
          <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
        </div>
      </Reveal>

      <div className="container-mp">
        <p className="mt-4 flex items-center gap-2 text-xs text-paper/60">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 7l5 5-5 5M5 7l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Swipe through more moments
        </p>

        {/* Compact grid of the rest */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {grid.map((m, i) => (
            <Reveal key={m.src} delay={(i % 3) * 80}>
              <figure className="group relative overflow-hidden rounded-2xl border border-white/10">
                <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-2.5 text-[11px] font-medium leading-snug text-white drop-shadow">{m.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-sm text-paper/60">Want your child in the next photo? It starts with one message.</p>
        </Reveal>
      </div>
    </section>
  );
}
