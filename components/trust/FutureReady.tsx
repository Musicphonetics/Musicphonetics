import { TrustSubsection } from "./TrustSubsection";
import { HeroCanvas } from "@/components/ui/HeroCanvas";
import { Reveal } from "@/components/ui/Reveal";

export function FutureReady() {
  return (
    <TrustSubsection
      eyebrow="Section 08 · Future Ready"
      title="Built to operate internationally."
      intro="Teaching across cities. Expanding globally — with the systems already in place to support it."
    >
      <Reveal>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-midnight">
          <HeroCanvas className="absolute inset-0 h-full w-full" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-paper/70 sm:text-sm">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> Live — India &amp; online</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold/40 ring-1 ring-gold/40" /> Signal routes to planned regions</span>
          </div>
        </div>
      </Reveal>
    </TrustSubsection>
  );
}
