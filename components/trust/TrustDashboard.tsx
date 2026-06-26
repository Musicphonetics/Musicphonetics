import { TrustSubsection } from "./TrustSubsection";
import { Reveal } from "@/components/ui/Reveal";
import { DASHBOARD, DASHBOARD_NOTE } from "@/lib/trust";

export function TrustDashboard() {
  return (
    <TrustSubsection
      eyebrow="Section 07 · Trust Dashboard"
      title="Operating in the open."
      intro="A live operating snapshot — the kind of transparency families, schools, and partners deserve."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD.map((d, i) => (
          <Reveal key={d.label} delay={(i % 3) * 60}>
            <div className="mp-glass flex items-center justify-between rounded-2xl p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-paper/45">{d.label}</p>
                <p className="mt-1.5 font-display text-2xl font-semibold text-paper">{d.value}</p>
              </div>
              {d.status === "ok" && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-sm text-paper/50">{DASHBOARD_NOTE}</p>
    </TrustSubsection>
  );
}
