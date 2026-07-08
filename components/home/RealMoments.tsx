import { Reveal } from "@/components/ui/Reveal";
import { REAL_MOMENTS } from "@/lib/home-config";

// A warm, honest gallery - the "real students, real classes" moment from the
// homepage. Deliberately unpolished, real photos across Delhi NCR.
export function RealMoments() {
  return (
    <section className="bg-paper py-16 text-ink sm:py-20">
      <div className="container-mp">
        <Reveal>
          <p className="eyebrow text-center">Straight from our classes</p>
          <h2 className="mx-auto mt-2 max-w-3xl text-center font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Real students. Real classes. <span className="text-[#7A5E0F]">Real music.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-ink/70">
            No stock photos. These are our students, our recitals and our little
            wins, from classrooms and stages across Delhi NCR.
          </p>
        </Reveal>

        <div className="mt-10 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {REAL_MOMENTS.map((m, i) => (
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
