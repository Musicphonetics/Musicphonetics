import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { Reveal } from "@/components/ui/Reveal";
import { CREDENTIALS } from "@/lib/trust";
import { cn } from "@/lib/utils";

// Public Trust Centre shows only completed verifications. In-progress
// certifications appear publicly once officially received.
const COMPLETED = CREDENTIALS.filter((c) => !c.inProgress);

export function Credentials() {
  return (
    <TrustSubsection
      id="credentials"
      eyebrow="Section 01 · Trust & Verifications"
      title="Registered, certified, verified."
      intro="The legal foundations of a serious education company — documented, not declared."
      blueprint
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMPLETED.map((c, i) => (
          <Reveal key={c.name} delay={(i % 3) * 60}>
            <div className="group mp-glass flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <TrustIcon icon="certificate" />
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    c.inProgress
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  )}
                >
                  {c.status}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-paper">{c.name}</h3>
              <div className="mt-4 flex-1" />
              <button
                type="button"
                disabled
                title={c.inProgress ? "Certification in progress" : "Certificate available on request"}
                className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-paper/50"
              >
                <TrustIcon icon="privacy" size={13} />
                {c.inProgress ? "In progress" : "Available on request"}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-sm text-paper/50">
        Verification documents are available on request. Further certifications
        are added here as they are officially received.
      </p>
    </TrustSubsection>
  );
}
