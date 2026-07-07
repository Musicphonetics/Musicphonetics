"use client";

import { Badge } from "@/components/ui/Badge";
import { getOverviewMetrics, getLeadsBySource } from "@/lib/mock-crm";
import { formatINR } from "@/lib/utils";

export function DashboardCards() {
  const m = getOverviewMetrics();
  const sources = getLeadsBySource().filter((s) => s.count > 0);
  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  const cards = [
    { label: "New Enquiries Today", value: String(m.newEnquiriesToday), tone: "gold" as const },
    { label: "Qualified Leads", value: String(m.qualifiedLeads) },
    { label: "Active Students", value: String(m.activeStudents) },
    { label: "Revenue This Month", value: formatINR(m.revenueThisMonth), tone: "green" as const },
    { label: "Pending Payments", value: formatINR(m.pendingPayments), tone: "warn" as const },
    { label: "Classes Remaining", value: String(m.classesRemaining) },
    { label: "Top Lead Source", value: m.topLeadSource },
    { label: "Most Requested Instrument", value: m.mostRequestedInstrument },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-hairline bg-white p-5 shadow-card"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              {card.label}
            </p>
            <p
              className={
                "mt-2 font-display text-2xl font-semibold " +
                (card.tone === "green"
                  ? "text-feature-green"
                  : card.tone === "warn"
                  ? "text-deep-gold"
                  : "text-ink")
              }
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Leads by source - CSS bar chart */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Leads by source</h2>
          <Badge tone="muted">Last 30 days · demo</Badge>
        </div>
        <ul className="mt-5 space-y-3">
          {sources.map((s) => (
            <li key={s.source} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm text-ink/70">
                {s.source}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${(s.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-sm font-semibold text-ink">
                {s.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
