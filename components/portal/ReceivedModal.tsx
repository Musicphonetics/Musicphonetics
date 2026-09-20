"use client";

import { formatMoney } from "@/components/portal/kit";

export interface ReceivedRow {
  id: string;
  studentId: string;
  name: string;
  code: string | null;
  date: string;
  amount: number;
  mode: string | null;
}

const pretty = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// Breaks the "Received this month" figure down to the actual payments behind it,
// grouped by student, so the number is traceable to who paid and when.
export function ReceivedModal({ rows, total, onClose }: { rows: ReceivedRow[]; total: number; onClose: () => void }) {
  // Group by student, biggest contributor first.
  const groups = new Map<string, ReceivedRow[]>();
  for (const r of rows) (groups.get(r.studentId) ?? groups.set(r.studentId, []).get(r.studentId)!).push(r);
  const ordered = [...groups.values()].sort((a, b) => sum(b) - sum(a));

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/70 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper shadow-card-hover" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-hairline bg-paper/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="font-display text-lg font-semibold text-ink">Received this month</p>
            <p className="text-xs text-ink/55">{formatMoney(total)} · {rows.length} payment{rows.length === 1 ? "" : "s"}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-hairline px-4 py-1.5 text-sm font-semibold text-ink/70 hover:border-ink/40">Close</button>
        </div>

        <div className="space-y-2.5 p-4">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/55">No payments received yet this month.</p>
          ) : ordered.map((g) => (
            <div key={g[0].studentId} className="overflow-hidden rounded-xl border border-hairline bg-white">
              <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{g[0].name}</p>
                  {g[0].code && <p className="font-mono text-[11px] text-ink/50">{g[0].code}</p>}
                </div>
                <p className="font-display text-sm font-bold text-emerald-700">{formatMoney(sum(g))}</p>
              </div>
              <ul className="divide-y divide-hairline/70">
                {g.map((r) => (
                  <li key={r.id} className="flex items-center justify-between px-3.5 py-2 text-xs text-ink/70">
                    <span>{pretty(r.date)}{r.mode ? ` · ${r.mode}` : ""}</span>
                    <span className="font-semibold text-ink">{formatMoney(r.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const sum = (rows: ReceivedRow[]) => rows.reduce((a, r) => a + r.amount, 0);
