import { TrustSubsection } from "./TrustSubsection";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANY_TIMELINE } from "@/lib/trust";
import { cn } from "@/lib/utils";

export function CompanyTimeline() {
  return (
    <TrustSubsection
      eyebrow="Section 06 · Musicphonetics Timeline"
      title="From first students to a global roadmap."
      intro="A company built year by year — with systems, not shortcuts."
      blueprint
    >
      <div className="relative mx-auto max-w-3xl">
        <div aria-hidden="true" className="absolute left-3 top-1 h-full w-px bg-gradient-to-b from-gold via-gold/40 to-transparent sm:left-1/2" />
        <ol className="space-y-8">
          {COMPANY_TIMELINE.map((m, i) => {
            const left = i % 2 === 0;
            return (
              <Reveal key={m.year} delay={(i % 3) * 70} as="li">
                <div className={cn("relative pl-10 sm:w-1/2 sm:pl-0", left ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12")}>
                  <span
                    className={cn(
                      "absolute top-1 grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold shadow-[0_0_14px_rgba(201,162,39,0.5)]",
                      "left-0 sm:left-auto",
                      left ? "sm:-right-3.5" : "sm:-left-3.5",
                      m.roadmap ? "border border-dashed border-gold bg-transparent text-gold" : "bg-gold text-ink"
                    )}
                  >
                    {m.roadmap ? "→" : i + 1}
                  </span>
                  <div className="mp-glass rounded-2xl p-5">
                    <p className="font-display text-lg font-semibold text-gold">{m.year}</p>
                    <h3 className="mt-1 text-base font-semibold text-paper">{m.title}</h3>
                    <p className="mt-1.5 text-sm text-paper/60">{m.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </TrustSubsection>
  );
}
