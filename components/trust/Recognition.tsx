import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { Reveal } from "@/components/ui/Reveal";
import { RECOGNITION, PARTNERS } from "@/lib/trust";

export function Recognition() {
  return (
    <TrustSubsection
      eyebrow="Section 05 · Public Recognition"
      title="Recognised beyond the classroom."
      intro="Institutional achievements across media, performance, education, and public life. Confidential associations are referenced without disclosing identities."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {RECOGNITION.map((g, i) => (
          <Reveal key={g.title} delay={(i % 2) * 80}>
            <div className="mp-glass h-full rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <TrustIcon icon={g.icon} />
                </span>
                <h3 className="text-lg font-semibold text-paper">{g.title}</h3>
                {g.confidential && (
                  <span className="ml-auto rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper/50">
                    Confidential
                  </span>
                )}
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <li key={it} className="rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-paper/80">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Industry network — partner wall */}
      <Reveal>
        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-semibold text-paper">Built through relationships. Growing through trust.</h3>
              <p className="mt-1 text-sm text-paper/55">Industry network · reserved placeholders for partners and collaborators.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {PARTNERS.map((p) => (
              <div key={p} className="mp-glass flex h-20 items-center justify-center rounded-xl px-3 text-center text-sm font-semibold text-paper/70 transition-colors hover:text-paper">
                {p}
              </div>
            ))}
            <div className="mp-glass flex h-20 items-center justify-center rounded-xl px-3 text-center text-xs text-paper/40">
              + future collaborators
            </div>
          </div>
        </div>
      </Reveal>
    </TrustSubsection>
  );
}
