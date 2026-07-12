import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { HOW_STEPS } from "@/lib/home-config";

// The house step pattern: numbered 01–04, one photo each, one clear line.
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 bg-charcoal-2 py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader eyebrow="How it works" title="A clear path, not random classes." invert />

        <div role="region" aria-label="How it works" tabIndex={0} className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {HOW_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 70}>
              <article className="flex h-full w-[78vw] max-w-[300px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-white/10 bg-charcoal sm:w-auto sm:max-w-none">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img src={s.img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,20,29,0.6),transparent_55%)]" />
                  <span className="absolute left-4 top-4 font-display text-2xl font-medium text-gold">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gold">{s.kicker}</span>
                  <h3 className="mt-2 font-display text-xl font-medium leading-snug text-ivory">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/65">{s.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
