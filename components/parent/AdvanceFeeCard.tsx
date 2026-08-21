"use client";

import { formatMoney } from "@/components/portal/kit";
import { computeFeeStanding, computeFeeCycles, computeSetProgress, computeSetDeadline, type FeePaymentLite, type FeeCyclePayment } from "@/lib/fees";
import type { Student, Payment } from "@/lib/supabase/types";

const shortDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// Shows the family exactly where their fees stand — as CLASSES. Fees buy classes;
// as classes are taken, the bar fills and the balance drops, so parents see their
// money being used and know when renewal is near. Advance payments add classes.
// completedDates are the REAL class dates, used to show when each payment's block
// of classes started and got finished (no calendar-month assumption).
export function AdvanceFeeCard({ student, payments, completed, completedDates = [] }: { student: Student; payments: Payment[]; completed: number; completedDates?: string[] }) {
  const s = computeFeeStanding(
    student.fee_quoted,
    student.classes_per_month,
    completed,
    payments as unknown as FeePaymentLite[],
  );
  if (!s || s.classesPurchased <= 0) return null;

  const cycles = computeFeeCycles(
    payments as unknown as FeeCyclePayment[],
    student.fee_quoted,
    student.classes_per_month,
    completedDates,
  );

  const sp = computeSetProgress(completed, student.classes_per_month, s.classesPurchased);
  const deadline = computeSetDeadline(cycles);
  const name = student.name.split(" ")[0];
  const setPctW = `${Math.round((sp.currentDone / sp.perSet) * 100)}%`;

  return (
    <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Your classes &amp; fees</p>
        {sp.allComplete
          ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Renewal due</span>
          : sp.remainingInSet <= 2
            ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Renewal coming soon</span>
            : <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>}
      </div>

      {/* Big number: progress in the current SET of classes (never past the set size) */}
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="font-display text-4xl font-bold leading-none text-ink">{sp.currentDone}<span className="text-2xl text-ink/40">/{sp.perSet}</span></div>
          <p className="mt-1 text-sm text-ink/60">Set {sp.currentSet} of {sp.paidSets} · {sp.remainingInSet} class{sp.remainingInSet === 1 ? "" : "es"} left in this set</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-ink/45 line-through">{formatMoney(s.feeConsumed)}</div>
          <div className="font-display text-xl font-bold text-[#7A5E0F]">{formatMoney(s.feeRemaining)}</div>
          <p className="text-[11px] text-ink/50">balance in credit</p>
        </div>
      </div>

      {/* Progress bar: current set */}
      <div className="mt-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-ink/[0.07]">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-[#C6A02E] transition-all" style={{ width: setPctW }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-ink/55">
          <span>{sp.currentDone} of {sp.perSet} this set</span>
          <span>{sp.completedSets} set{sp.completedSets === 1 ? "" : "s"} completed</span>
        </div>

        {/* Class-validity clock. Subtle from day 0 (plants the deadline), turns
            into a clear nudge past the alert threshold, then a lapsed notice. */}
        {deadline && !sp.allComplete && (
          deadline.state === "ok" ? (
            <p className="mt-2 text-right text-[11px] text-ink/40">Valid till {shortDate(deadline.deadline)}</p>
          ) : deadline.state === "urgent" ? (
            <p className="mt-2 rounded-lg bg-gold/15 px-3 py-2 text-xs font-semibold text-[#7A5E0F]">
              ⏳ {deadline.daysLeft > 0 ? <>Only <b>{deadline.daysLeft} day{deadline.daysLeft === 1 ? "" : "s"}</b> left to finish this set — it&rsquo;s valid till {shortDate(deadline.deadline)}.</> : <>This set is valid till {shortDate(deadline.deadline)} — please finish the remaining classes now.</>}
            </p>
          ) : (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              This set of classes has passed its {deadline.daysElapsed}-day validity. Please message us to keep {name}&rsquo;s remaining classes active.
            </p>
          )
        )}
      </div>

      {/* Advance: a whole set already paid but not started */}
      {Math.max(0, sp.paidSets - sp.currentSet) > 0 && (
        <p className="mt-3 rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700">
          ✓ Advance received — {name}&rsquo;s next {Math.max(0, sp.paidSets - sp.currentSet) * sp.perSet} classes are already paid.
        </p>
      )}

      {/* Human line */}
      <p className="mt-4 rounded-2xl bg-ink/[0.04] p-3 text-sm text-ink/75">
        {s.monthsAhead >= 1
          ? <>You&rsquo;re paid <b>~{s.monthsAhead} month{s.monthsAhead >= 1.5 ? "s" : ""}</b> in advance — {name}&rsquo;s next {s.remaining} classes are fully covered. 🎵</>
          : sp.remainingInSet <= 2 && !sp.allComplete
            ? <>Just <b>{sp.remainingInSet} class{sp.remainingInSet === 1 ? "" : "es"}</b> left in this set. Renew soon so {name}&rsquo;s classes never pause.</>
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

      {/* Payment cycles — each payment mapped to the real classes it covered */}
      {cycles.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Each payment&rsquo;s classes</p>
          <div className="space-y-2">
            {cycles.map((c) => (
              <div key={c.index} className="rounded-2xl border border-hairline bg-ink/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{formatMoney(c.amount)}</span>
                  {c.status === "done"
                    ? <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">Completed</span>
                    : c.status === "active"
                      ? <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#7A5E0F]">In progress</span>
                      : <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-ink/60">Ready (advance)</span>}
                </div>
                <p className="mt-1 text-xs text-ink/65">
                  Paid <b className="text-ink/80">{shortDate(c.paidOn)}</b> · {c.classes} classes
                  {c.status === "done" && c.finishedOn
                    ? <> · finished <b className="text-ink/80">{shortDate(c.finishedOn)}</b> — renewal fell due</>
                    : c.status === "active"
                      ? <> · <b className="text-[#7A5E0F]">{c.done} of {c.classes} done</b>, {c.classes - c.done} left</>
                      : <> · not started yet</>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
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
