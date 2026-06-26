import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { Reveal } from "@/components/ui/Reveal";
import { STANDARDS } from "@/lib/trust";

export function StandardsDocs() {
  return (
    <TrustSubsection
      eyebrow="Section 03 · Standards & Documentation"
      title="Every standard, written down."
      intro="The handbooks, policies, and frameworks that make quality repeatable. Documents are being finalised for publication."
      blueprint
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STANDARDS.map((d, i) => (
          <Reveal key={d.title} delay={(i % 3) * 50}>
            <div className="group mp-glass flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/5 text-gold">
                <TrustIcon icon={d.icon} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-paper">{d.title}</h3>
                <p className="text-xs text-paper/45">{d.type} · {d.category}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </TrustSubsection>
  );
}
