"use client";

import { useMemo, useState } from "react";
import { groupIntoCycles, type ClassCycle } from "@/lib/cycles";
import { formatMoney } from "@/components/portal/kit";
import { accuracyMeta, practiceLevel } from "@/lib/classNotes";
import type { ClassUpdate, Payment } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const pretty = (iso: string | null | undefined) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";
const shortDate = (iso: string | null | undefined) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS: Record<ClassCycle["status"], { label: string; cls: string }> = {
  done: { label: "Complete", cls: "bg-emerald-500/12 text-emerald-700" },
  active: { label: "In progress", cls: "bg-gold/20 text-[#7A5E0F]" },
  upcoming: { label: "Paid ahead", cls: "bg-forest/10 text-forest" },
  unpaid: { label: "Renewal due", cls: "bg-gold text-ink" },
};

// The family's view of their child's classes, grouped by the payment that paid
// for them. Each "cycle" is one paid set of classes: the payment made, how many
// classes happened, and when. Read-only, with the same class detail the parent
// already sees. Tapping a cycle opens just those classes.
export function ParentClassCycles({
  classes, payments, feeQuoted, classesPerMonth,
}: {
  classes: ClassUpdate[];
  payments: Payment[];
  feeQuoted: number | null;
  classesPerMonth: number | null;
}) {
  const cycles = useMemo(
    () => groupIntoCycles(classes, payments, feeQuoted, classesPerMonth),
    [classes, payments, feeQuoted, classesPerMonth],
  );
  const ordered = useMemo(() => cycles.slice().reverse(), [cycles]);
  const activeNumber = useMemo(() => {
    const a = cycles.find((c) => c.status === "active") || cycles.find((c) => c.status === "unpaid");
    return a?.number ?? cycles[cycles.length - 1]?.number ?? null;
  }, [cycles]);
  const [openN, setOpenN] = useState<number | null>(activeNumber);

  if (cycles.length === 0) return null;

  return (
    <div className="space-y-3">
      {ordered.map((cyc) => {
        const open = openN === cyc.number;
        const pill = STATUS[cyc.status];
        const first = cyc.classes.find((c) => c.class_status === "Completed")?.class_date ?? cyc.classes[0]?.class_date ?? null;
        const last = [...cyc.classes].reverse().find((c) => c.class_status === "Completed")?.class_date ?? null;
        return (
          <div key={cyc.number} className="overflow-hidden rounded-2xl border border-hairline bg-white">
            <button onClick={() => setOpenN(open ? null : cyc.number)} className="flex w-full items-start gap-3 p-4 text-left">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-base font-bold",
                cyc.status === "done" ? "bg-emerald-500/12 text-emerald-700" : "bg-gold/15 text-[#7A5E0F]")}>
                {cyc.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Cycle {cyc.number}</p>
                {/* The payment that paid for this cycle */}
                <p className="mt-0.5 text-xs text-ink/65">
                  {cyc.paid
                    ? <>Paid {cyc.amount ? formatMoney(cyc.amount) : ""} · {shortDate(cyc.paidOn)}{cyc.paymentMode ? ` · ${cyc.paymentMode}` : ""}</>
                    : <>Not paid yet</>}
                </p>
                {/* How many classes, and when */}
                <p className="mt-0.5 text-xs text-ink/55">
                  {cyc.doneCount}/{cyc.size} classes
                  {first ? ` · ${shortDate(first)}${last && last !== first ? ` – ${shortDate(last)}` : ""}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", pill.cls)}>{pill.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                  className={cn("text-ink/40 transition-transform", open && "rotate-180")}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {open && (
              <div className="border-t border-hairline bg-paper p-3">
                {cyc.classes.length === 0 ? (
                  <p className="px-1 py-2 text-sm text-ink/50">No classes in this cycle yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {cyc.classes.map((c) => <ClassCard key={c.id} c={c} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClassCard({ c }: { c: ClassUpdate }) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{pretty(c.class_date)}</p>
        <div className="flex items-center gap-2">
          {c.class_number != null && <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-ink/60">Class {c.class_number}</span>}
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
            c.class_status === "Completed" ? "bg-feature-green/10 text-feature-green" : "bg-gold/15 text-[#7A5E0F]")}>{c.class_status}</span>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {c.taught && <Row k="Taught">{c.taught}</Row>}
        {typeof c.accuracy_percent === "number" && (() => {
          const m = accuracyMeta(c.accuracy_percent!);
          return (
            <div className="flex items-center gap-2 py-0.5">
              <span className="text-sm font-semibold text-ink">Accuracy:</span>
              <span className="h-2 w-24 overflow-hidden rounded-full bg-ink/[0.07]">
                <span className={cn("block h-full rounded-full", m.bar)} style={{ width: `${Math.max(0, Math.min(100, c.accuracy_percent!))}%` }} />
              </span>
              <span className={cn("text-sm font-bold", m.tone)}>{c.accuracy_percent}% · {m.label}</span>
            </div>
          );
        })()}
        {c.error_areas && <Row k="Struggled with">{c.error_areas}</Row>}
        {(() => { const p = practiceLevel(c.practice_level); return p ? <Row k="Practice">{p.label} · {p.hint}</Row> : null; })()}
        {c.homework && <Row k="Homework">{c.homework}</Row>}
        {c.student_response && <Row k="How it went">{c.student_response}</Row>}
        {c.parent_feedback && <Row k="Your note">{c.parent_feedback}</Row>}
        {c.teacher_notes && <Row k="Teacher note">{c.teacher_notes}</Row>}
        {c.next_class_date && <Row k="Next class">{pretty(c.next_class_date)}</Row>}
        {!c.taught && !c.homework && !c.student_response && !c.teacher_notes && c.accuracy_percent == null && !c.error_areas &&
          <p className="text-sm text-ink/45">Class {c.class_status.toLowerCase()}.</p>}
      </div>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-ink/80"><span className="font-semibold text-ink">{k}:</span> {children}</p>;
}
