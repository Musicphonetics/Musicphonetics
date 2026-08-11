"use client";

import { formatMoney } from "@/components/portal/kit";
import { computeFeeStanding, type FeePaymentLite } from "@/lib/fees";
import type { Student, Payment } from "@/lib/supabase/types";

// Shows the family exactly where their fees stand — as CLASSES. Fees buy classes;
// as classes are taken, the bar fills and the balance drops, so parents see their
// money being used and know when renewal is near. Advance payments add classes.
export function AdvanceFeeCard({ student, payments, completed }: { student: Student; payments: Payment[]; completed: number }) {
  const s = computeFeeStanding(
    student.fee_quoted,
    student.classes_per_month,
    completed,
    payments as unknown as FeePaymentLite[],
  );
  if (!s || s.classesPurchased <= 0) return null;

  const name = student.name.split(" ")[0];
  const pctW = `${Math.round(s.pct * 100)}%`;

  return (
    <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Your classes &amp; fees</p>
        {s.renewalSoon
          ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Renewal coming soon</span>
          : s.fullyUsed
            ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Renewal due</span>
            : <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>}
      </div>

      {/* Big number: classes remaining */}
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="font-display text-4xl font-bold leading-none text-ink">{s.remaining}<span className="ml-1 text-lg font-semibold text-ink/50">left</span></div>
          <p className="mt-1 text-sm text-ink/60">of {s.classesPurchased} classes paid for</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-ink/45 line-through">{formatMoney(s.feeConsumed)}</div>
          <div className="font-display text-xl font-bold text-[#7A5E0F]">{formatMoney(s.feeRemaining)}</div>
          <p className="text-[11px] text-ink/50">balance in credit</p>
        </div>
      </div>

      {/* Progress bar: classes used */}
      <div className="mt-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-ink/[0.07]">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-[#C6A02E] transition-all" style={{ width: pctW }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-ink/55">
          <span>{s.used} completed</span>
          <span>{Math.round(s.pct * 100)}% used</span>
        </div>
      </div>

      {/* Human line */}
      <p className="mt-4 rounded-2xl bg-ink/[0.04] p-3 text-sm text-ink/75">
        {s.monthsAhead >= 1
          ? <>You&rsquo;re paid <b>~{s.monthsAhead} month{s.monthsAhead >= 1.5 ? "s" : ""}</b> in advance — {name}&rsquo;s next {s.remaining} classes are fully covered. 🎵</>
          : s.renewalSoon
            ? <>Just <b>{s.remaining} class{s.remaining === 1 ? "" : "es"}</b> left. Renew soon so {name}&rsquo;s classes never pause.</>
            : s.fullyUsed
              ? <>All paid classes are complete. Renew to continue {name}&rsquo;s journey.</>
              : <><b>{s.remaining}</b> of {s.classesPurchased} classes remaining.</>}
      </p>

      {/* Countable breakdown */}
      <div className="mt-4 grid gap-2 text-sm">
        <Row k="Monthly fee" v={`${formatMoney(s.monthlyFee)} · ${s.classesPerMonth} classes`} />
        <Row k="Total paid so far" v={formatMoney(s.totalPaid)} />
        <Row k="Classes paid for" v={`${s.classesPurchased}`} />
        <Row k="Classes completed" v={`${s.completed}`} />
        <Row k="Classes remaining" v={`${s.remaining}`} highlight />
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
