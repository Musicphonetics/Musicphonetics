"use client";

import { Badge } from "@/components/ui/Badge";
import { getLeadsBySource, MOCK_PEOPLE } from "@/lib/mock-crm";

export function MarketingPanel() {
  const sources = getLeadsBySource();
  const withLeads = sources.filter((s) => s.count > 0);
  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  const topSource = withLeads[0]?.source ?? "-";

  // Conversion by source (converted / total) - demo computation
  const converted = MOCK_PEOPLE.filter((p) => p.currentStatus === "Converted");
  const convBySource = new Map<string, number>();
  converted.forEach((p) =>
    convBySource.set(p.leadSource, (convBySource.get(p.leadSource) ?? 0) + 1)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Most valuable source
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {topSource}
          </p>
          <Badge tone="muted" className="mt-2">
            Placeholder ranking
          </Badge>
        </div>
        <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Total leads
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {MOCK_PEOPLE.length}
          </p>
        </div>
        <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Converted
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-feature-green">
            {converted.length}
          </p>
        </div>
      </div>

      {/* Leads by source */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-ink">Leads by source</h2>
        <ul className="mt-5 space-y-3">
          {withLeads.map((s) => (
            <li key={s.source} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-ink/70">{s.source}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${(s.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-sm font-semibold text-ink">
                {s.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Conversion by source - placeholder */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Conversion by source</h2>
          <Badge tone="muted">Placeholder · demo</Badge>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {withLeads.map((s) => {
            const conv = convBySource.get(s.source) ?? 0;
            const rate = s.count ? Math.round((conv / s.count) * 100) : 0;
            return (
              <li
                key={s.source}
                className="flex items-center justify-between rounded-xl border border-hairline px-4 py-2.5 text-sm"
              >
                <span className="text-ink/70">{s.source}</span>
                <span className="font-semibold text-ink">
                  {conv}/{s.count} · {rate}%
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-ink/45">
          TODO(integration): replace with real attribution once lead tracking is
          connected.
        </p>
      </div>
    </div>
  );
}
