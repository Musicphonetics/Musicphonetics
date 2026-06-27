import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { Reveal } from "@/components/ui/Reveal";
import { DOCUMENTS, DOC_STATUS } from "@/lib/trust";
import { cn } from "@/lib/utils";

export function Documentation() {
  return (
    <TrustSubsection
      id="documentation"
      eyebrow="Section 03 · Documentation"
      title="Built to international standards."
      intro="Twenty-five policies, handbooks, and frameworks — with child safety and safeguarding at the core. We don't operate casually."
    >
      {/* Status legend */}
      <div className="mb-8 flex flex-wrap gap-2">
        {DOC_STATUS.map((s) => (
          <span key={s} className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-semibold text-paper/65">
            {s}
          </span>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENTS.map((d, i) => (
          <Reveal key={d.title} delay={(i % 3) * 40}>
            <div
              className={cn(
                "group mp-glass flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1",
                d.highlight ? "border-gold/40 ring-1 ring-gold/20" : "hover:border-gold/40"
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-gold",
                  d.highlight ? "border-gold/40 bg-gold/15" : "border-white/12 bg-white/5"
                )}
              >
                <TrustIcon icon={d.icon} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-paper">{d.title}</h3>
                <p className="text-xs text-paper/45">
                  {d.highlight ? "Priority · " : ""}
                  {d.category}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-sm text-paper/50">
        All documents are version-controlled, reviewed annually, and available on request.
      </p>
    </TrustSubsection>
  );
}
