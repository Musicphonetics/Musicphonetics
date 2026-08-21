"use client";

import Link from "next/link";
import {
  computeFeeStanding, computeFeeCycles, computeSetProgress, computeSetDeadline,
  addDaysIso, FEE_DUE_DAYS, type FeePaymentLite, type FeeCyclePayment,
} from "@/lib/fees";
import type { Student, Payment } from "@/lib/supabase/types";
import type { StudentView } from "@/lib/supabase/parent";
import { cn } from "@/lib/utils";

const shortDate = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";
const initial = (n: string) => (n.trim()[0] || "?").toUpperCase();

// The at-a-glance panel at the top of the student portal — profile, this set's
// classes, days left in the validity window, next class, fee-due date, and a
// single honest health read: "On track" or "Needs attention".
export function StudentSnapshot({ student, view, pays, completedDates }: {
  student: Student; view: StudentView; pays: Payment[]; completedDates: string[];
}) {
  const s = computeFeeStanding(student.fee_quoted, student.classes_per_month, view.completed, pays as unknown as FeePaymentLite[]);
  const purchased = s?.classesPurchased ?? (student.classes_per_month ?? 8);
  const sp = computeSetProgress(view.completed, student.classes_per_month, purchased);
  const cycles = computeFeeCycles(pays as unknown as FeeCyclePayment[], student.fee_quoted, student.classes_per_month, completedDates);
  const deadline = computeSetDeadline(cycles);

  const activeCycle = cycles.find((c) => c.status === "active") || cycles.find((c) => c.status === "upcoming");
  const feePaidOn = activeCycle?.paidOn || pays[0]?.payment_date || null;
  const feeDue = feePaidOn ? addDaysIso(feePaidOn, FEE_DUE_DAYS) : null;

  const daysLeft = deadline ? Math.max(0, deadline.daysLeft) : null;
  const attention = (deadline && deadline.state !== "ok") || sp.allComplete;

  return (
    <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">
      {/* Profile */}
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 font-display text-xl font-bold text-[#7A5E0F]">{initial(student.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-ink">{student.name}</p>
          <p className="truncate text-xs text-ink/60">
            {[student.instrument, student.level].filter(Boolean).join(" · ") || "Student"}
            {student.student_code && <span className="ml-1.5 font-mono text-ink/45">{student.student_code}</span>}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold",
          attention ? "bg-gold/15 text-[#7A5E0F]" : "bg-emerald-500/12 text-emerald-700")}>
          {attention ? "Needs attention" : "On track"}
        </span>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Metric big label="Classes" value={`${sp.currentDone}/${sp.perSet}`} sub="this set" />
        <Metric big label="Days remaining" value={daysLeft != null ? String(daysLeft) : "—"} sub={daysLeft != null ? "to finish set" : "add a payment"} tone={deadline?.state === "urgent" ? "warn" : deadline?.state === "expired" ? "bad" : undefined} />
        <Metric label="Next class" value={shortDate(view.nextClassDate)} />
        <Metric label="Fee due" value={shortDate(feeDue)} />
      </div>

      {/* Health line */}
      <div className={cn("mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
        attention ? "bg-gold/10 text-[#7A5E0F]" : "bg-emerald-500/[0.08] text-emerald-700")}>
        <span aria-hidden>{attention ? "⚠️" : "✅"}</span>
        <span className="min-w-0 flex-1">
          {sp.allComplete
            ? "This set is complete — renew to keep classes going."
            : deadline?.state === "expired"
              ? "This set has passed its 35-day validity — please message us."
              : deadline?.state === "urgent"
                ? `Only ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to finish this set — book your classes now.`
                : "Class schedule is healthy — keep up the steady pace."}
        </span>
        {attention && <Link href="/parent/payments" className="shrink-0 font-semibold underline underline-offset-2">Fees →</Link>}
      </div>
    </div>
  );
}

function Metric({ label, value, sub, big, tone }: { label: string; value: string; sub?: string; big?: boolean; tone?: "warn" | "bad" }) {
  return (
    <div className="rounded-2xl bg-ink/[0.03] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-ink/45">{label}</p>
      <p className={cn("mt-0.5 font-display font-bold leading-none", big ? "text-xl" : "text-base",
        tone === "bad" ? "text-red-600" : tone === "warn" ? "text-[#7A5E0F]" : "text-ink")}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-ink/45">{sub}</p>}
    </div>
  );
}
