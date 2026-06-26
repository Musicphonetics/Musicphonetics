import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { Reveal } from "@/components/ui/Reveal";
import { RECOGNITION, RECOGNITION_NOTE } from "@/lib/trust";

export function Recognition() {
  return (
    <TrustSubsection
      eyebrow="Section 05 · Public Recognition"
      title="Recognised beyond the classroom."
      intro="Media, performances, and institutional work that build credibility — uploads in progress."
    >
      <ol className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] snap-x">
        {RECOGNITION.map((r, i) => (
          <Reveal key={r.title} delay={(i % 3) * 70} as="li">
            <div className="mp-glass flex w-[240px] shrink-0 snap-start flex-col rounded-2xl p-5 sm:w-[260px]">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <TrustIcon icon={r.icon} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-paper">{r.title}</h3>
              <p className="mt-1.5 text-sm text-paper/55">{r.line}</p>
              <span className="mt-4 w-fit rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper/45">
                Uploads pending
              </span>
            </div>
          </Reveal>
        ))}
      </ol>
      <p className="mt-6 text-sm text-paper/50">{RECOGNITION_NOTE}</p>
    </TrustSubsection>
  );
}
