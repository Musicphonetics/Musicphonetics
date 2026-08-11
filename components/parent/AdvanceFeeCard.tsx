"use client";

import { formatMoney } from "@/components/portal/kit";
import { computeFeeStanding, type FeePaymentLite } from "@/lib/fees";
import type { Student, Payment } from "@/lib/supabase/types";

const pretty = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

// Shows the family exactly where they stand — including any advance they've paid
// before the due date. Auto-updates whenever the office records a payment.
export function AdvanceFeeCard({ student, payments }: { student: Student; payments: Payment[] }) {
  const s = computeFeeStanding(
    student.fee_quoted,
    student.start_date,
    payments as unknown as FeePaymentLite[],
  );
  if (!s) return null;

  const name = student.name.split(" ")[0];

  return (
    <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Your fee standing</p>

      {s.paidAhead ? (
        <div className="mt-3 rounded-2xl bg-emerald-500/[0.08] p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <span className="text-xl">✓</span>
            <span className="font-display text-lg font-bold">You&rsquo;re paid in advance</span>
          </div>
          <p className="mt-1.5 text-sm text-ink/75">
            You&rsquo;ve paid <b>{formatMoney(s.advanceAmount)}</b> beyond what&rsquo;s due
            {s.advanceMonths >= 0.5 ? <> — about <b>{s.advanceMonths} month{s.advanceMonths >= 1.5 ? "s" : ""}</b> ahead</> : null}.
            Thank you! {name}&rsquo;s classes are fully covered.
          </p>
        </div>
      ) : s.outstanding > 0 ? (
        <div className="mt-3 rounded-2xl bg-gold/[0.12] p-4">
          <div className="font-display text-lg font-bold text-ink">Amount due: {formatMoney(s.outstanding)}</div>
          <p className="mt-1 text-sm text-ink/70">Renew below to keep {name}&rsquo;s classes running without a break.</p>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl bg-ink/[0.04] p-4">
          <div className="font-display text-lg font-bold text-ink">You&rsquo;re all caught up 🎵</div>
          <p className="mt-1 text-sm text-ink/70">Nothing due right now.</p>
        </div>
      )}

      {/* Clear, simple breakdown */}
      <div className="mt-4 grid gap-2 text-sm">
        <Row k="Monthly fee" v={formatMoney(s.monthlyFee)} />
        <Row k="Total paid so far" v={formatMoney(s.totalPaid)} />
        <Row k="Months covered" v={`${s.monthsPaid}`} />
        <Row k="Paid up to (next due)" v={pretty(s.nextDueISO)} highlight />
      </div>
    </div>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-1.5 last:border-0">
      <span className="text-ink/55">{k}</span>
      <span className={"font-semibold " + (highlight ? "text-[#7A5E0F]" : "text-ink")}>{v}</span>
    </div>
  );
}
