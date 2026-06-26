import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { Reveal } from "@/components/ui/Reveal";
import { OPERATIONS } from "@/lib/trust";

export function Operations() {
  return (
    <TrustSubsection
      eyebrow="Section 02 · Business Operations"
      title="A company should be organised before it grows."
      intro="Ten operating systems run the company behind every class. Each will connect to a live dashboard."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {OPERATIONS.map((op, i) => (
          <Reveal key={op.name} delay={(i % 5) * 60}>
            <div className="group mp-glass flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-white/5 text-gold transition-colors group-hover:border-gold/40 group-hover:bg-gold/10">
                <TrustIcon icon={op.icon} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-paper">{op.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-paper/55">{op.line}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </TrustSubsection>
  );
}
