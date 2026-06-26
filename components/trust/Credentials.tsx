import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { Reveal } from "@/components/ui/Reveal";
import { CREDENTIALS, CREDENTIALS_NOTE } from "@/lib/trust";

export function Credentials() {
  return (
    <TrustSubsection
      id="credentials"
      eyebrow="Section 01 · Company Credentials"
      title="Registered, certified, verified."
      intro="The legal and operational foundations of a serious education company — documented, not declared."
      blueprint
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CREDENTIALS.map((c, i) => (
          <Reveal key={c.name} delay={(i % 3) * 70}>
            <div className="group mp-glass flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <TrustIcon icon="certificate" />
                </span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                  {c.status}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-paper">{c.name}</h3>
              <p className="mt-1 text-xs text-paper/45">Issued: {c.issued}</p>
              <div className="mt-4 flex-1" />
              <button
                type="button"
                disabled
                title="Certificate uploading soon"
                className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-paper/50"
              >
                <TrustIcon icon="privacy" size={13} />
                View Certificate
              </button>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-sm text-paper/50">{CREDENTIALS_NOTE}</p>
    </TrustSubsection>
  );
}
