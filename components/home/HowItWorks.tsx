import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { HOW_STEPS } from "@/lib/home-config";

// Swipe on mobile, a clean 4-up grid on desktop. Each step is a real photo with
// a warm, clear explanation.
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-paper py-14 sm:py-20">
      <div className="container-mp">
        <SectionHeader eyebrow="How it works" title="A clear path, not random classes." />

        <div role="region" aria-label="How it works" tabIndex={0} className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-4">
          {HOW_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 70}>
              <article className="flex h-full w-[78vw] max-w-[300px] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-hairline bg-white shadow-card sm:w-auto sm:max-w-none">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img src={s.img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-gold font-display text-sm font-bold text-ink shadow">{i + 1}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">{s.kicker}</span>
                  <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
