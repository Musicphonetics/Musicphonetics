"use client";

import Link from "next/link";
import { formatMoney } from "@/components/portal/kit";
import type { StudentStat } from "@/lib/supabase/types";

export interface PendingStudent {
  stat: StudentStat;
  reason: "renewal" | "unpaid" | "renew_soon";
  amount: number;      // fee owed (0 if fee not recorded)
}

// Works out exactly which students the "Pending" figure comes from, so tapping
// the home tile answers "where is the money owed?" Driven by paid classes vs
// classes taught: unpaid = taught but nothing paid; renewal = all paid classes
// used; renew-soon = 1–2 paid classes left.
export function computePending(rows: StudentStat[]): { list: PendingStudent[]; total: number } {
  const list: PendingStudent[] = [];
  for (const s of rows) {
    if (s.status !== "active") continue;
    const fee = s.fee_quoted ?? 0;
    const completed = s.classes_completed;
    const remaining = s.classes_remaining;
    const purchased = s.classes_purchased;
    if ((s.total_paid ?? 0) <= 0 && completed > 0) {
      list.push({ stat: s, reason: "unpaid", amount: fee });
    } else if (purchased > 0 && remaining === 0 && completed > 0) {
      list.push({ stat: s, reason: "renewal", amount: fee });
    } else if (remaining > 0 && remaining <= 2) {
      list.push({ stat: s, reason: "renew_soon", amount: fee });
    }
  }
  // Owed-now first (renewal / unpaid), then renew-soon; bigger amounts first.
  const rank = { renewal: 0, unpaid: 0, renew_soon: 1 } as const;
  list.sort((a, b) => rank[a.reason] - rank[b.reason] || b.amount - a.amount);
  const total = list.filter((p) => p.reason !== "renew_soon").reduce((sum, p) => sum + p.amount, 0);
  return { list, total };
}

const REASON = {
  renewal: { label: "Renewal due", cls: "bg-gold text-ink" },
  unpaid: { label: "Unpaid", cls: "bg-red-500/12 text-red-600" },
  renew_soon: { label: "Renew soon", cls: "bg-gold/20 text-[#7A5E0F]" },
} as const;

export function PendingFeesModal({ list, total, onClose }: { list: PendingStudent[]; total: number; onClose: () => void }) {
  const dueNow = list.filter((p) => p.reason !== "renew_soon");
  const soon = list.filter((p) => p.reason === "renew_soon");

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/70 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper shadow-card-hover" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-hairline bg-paper/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="font-display text-lg font-semibold text-ink">Fees pending</p>
            <p className="text-xs text-ink/55">{formatMoney(total)} owed · {dueNow.length} to renew</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-hairline px-4 py-1.5 text-sm font-semibold text-ink/70 hover:border-ink/40">Close</button>
        </div>

        <div className="space-y-4 p-4">
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/55">Everyone is paid up. Nothing pending.</p>
          ) : (
            <>
              {dueNow.length > 0 && (
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Owed now</p>
                  <ul className="space-y-2">
                    {dueNow.map((p) => <Row key={p.stat.student_id} p={p} />)}
                  </ul>
                </section>
              )}
              {soon.length > 0 && (
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Coming up (1–2 classes left)</p>
                  <ul className="space-y-2">
                    {soon.map((p) => <Row key={p.stat.student_id} p={p} />)}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ p }: { p: PendingStudent }) {
  const r = REASON[p.reason];
  const s = p.stat;
  const detail = p.reason === "unpaid"
    ? `${s.classes_completed} class${s.classes_completed === 1 ? "" : "es"} taught · unpaid`
    : p.reason === "renewal"
      ? `all ${s.classes_purchased} paid classes used`
      : `${s.classes_remaining} class${s.classes_remaining === 1 ? "" : "es"} left`;
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white px-3.5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
        <p className="mt-0.5 text-xs text-ink/55">
          <span className="font-mono">{s.student_code || "—"}</span> · {s.instrument || "—"} · {detail}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-display text-sm font-bold text-ink">{p.amount > 0 ? formatMoney(p.amount) : "—"}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.cls}`}>{r.label}</span>
      </div>
    </li>
  );
}
