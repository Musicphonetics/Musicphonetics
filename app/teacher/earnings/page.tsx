"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { Payment, Payout, StudentStat } from "@/lib/supabase/types";
import { feeBreakdown, inr } from "@/lib/money";
import { isReceived, sumCuts, byStudent, byMonth, avgPerDay, monthOf, type CutTotals } from "@/lib/earnings";
import { cn } from "@/lib/utils";

const dd = (iso: string) => new Date(iso + (iso.length <= 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const thisMonthKey = () => new Date().toISOString().slice(0, 7);

type Period = "month" | "all";

export default function TeacherEarnings() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [students, setStudents] = useState<StudentStat[]>([]);
  const [period, setPeriod] = useState<Period>("month");

  useEffect(() => {
    if (!isSupabaseConfigured()) { setPayments([]); return; }
    const sb = getSupabase();
    sb.from("payments").select("*").order("payment_date", { ascending: false }).then(({ data }) => setPayments((data as Payment[]) ?? []));
    sb.from("payouts").select("*").then(({ data }) => setPayouts((data as Payout[]) ?? []));
    loadRoster().then(({ rows }) => setStudents(rows));
  }, []);

  const nameOf = useMemo(() => {
    const m: Record<string, { name: string; code: string | null }> = {};
    for (const s of students) m[s.student_id] = { name: s.name, code: s.student_code ?? null };
    return m;
  }, [students]);

  const all = useMemo(() => payments ?? [], [payments]);
  const scoped = useMemo(
    () => (period === "month" ? all.filter((p) => monthOf(p.payment_date) === thisMonthKey()) : all),
    [all, period],
  );

  const periodCut = useMemo(() => sumCuts(scoped), [scoped]);
  const lifetimeCut = useMemo(() => sumCuts(all), [all]);
  const perStudent = useMemo(() => byStudent(scoped), [scoped]);
  const months = useMemo(() => byMonth(all), [all]);
  const perDay = useMemo(() => avgPerDay(all), [all]);
  const pendingPayout = useMemo(
    () => payouts.filter((p) => p.status === "pending" || p.status === "advance_paid").reduce((a, p) => a + (p.balance ?? 0), 0),
    [payouts],
  );

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Earnings">
      {!payments ? <Loading /> : all.filter(isReceived).length === 0 ? (
        <div className="space-y-4">
          <EmptyState title="No earnings yet" hint="When payments are recorded for your students, your share appears here." />
          <Link href="/teacher/payments" className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-white py-3 text-sm font-semibold text-ink/80 hover:border-ink/40">+ Record a payment</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Headline stats — the numbers a teacher checks first. */}
          <div className="grid grid-cols-3 gap-3">
            <Sum label="This month" value={inr(sumCuts(all.filter((p) => monthOf(p.payment_date) === thisMonthKey())).teacher)} tone="green" />
            <Sum label="Earning so far" value={inr(lifetimeCut.teacher)} tone="gold" />
            <Sum label="Avg / day" value={inr(perDay)} />
          </div>

          {/* Period switch drives the cut-by-cut panel + per-student list. */}
          <div className="flex gap-1 rounded-xl bg-ink/[0.05] p-1">
            {([["month", "This month"], ["all", "All time"]] as [Period, string][]).map(([p, label]) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors", period === p ? "bg-white text-ink shadow-card" : "text-ink/55 hover:text-ink")}>
                {label}
              </button>
            ))}
          </div>

          {/* Gross → cut by cut → your share. Always starts from the gross. */}
          <CutCard totals={periodCut} title={period === "month" ? "This month, cut by cut" : "All time, cut by cut"} />

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-3">
            <Sum label={period === "month" ? "Payments (mo)" : "Payments"} value={String(periodCut.count)} />
            <Sum label="Students paid" value={String(perStudent.length)} />
            <Sum label="Pending payout" value={inr(pendingPayout)} tone="gold" />
          </div>

          <Link href="/teacher/payments" className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-white py-3 text-sm font-semibold text-ink/80 hover:border-ink/40">+ Record a payment</Link>

          {/* Per-student earnings for the period, each opens to the payment cuts. */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">Earning per student{period === "month" ? " · this month" : ""}</p>
            {perStudent.length === 0 ? (
              <p className="rounded-2xl border border-hairline bg-white p-4 text-sm text-ink/60">No received payments in this period.</p>
            ) : (
              <div className="space-y-2.5">
                {perStudent.map((s) => (
                  <StudentEarningCard key={s.studentId} rows={s.rows} totals={s.totals} info={nameOf[s.studentId]} />
                ))}
              </div>
            )}
          </section>

          {/* Month-by-month history so the year reconciles at a glance. */}
          {months.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">Monthly earnings</p>
              <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
                {months.map((m, i) => (
                  <div key={m.key} className={cn("flex items-center justify-between px-4 py-3", i > 0 && "border-t border-hairline")}>
                    <div>
                      <p className="text-sm font-semibold text-ink">{m.label}</p>
                      <p className="text-[11px] text-ink/55">{inr(m.totals.gross)} gross · {m.totals.count} payment{m.totals.count === 1 ? "" : "s"}</p>
                    </div>
                    <p className="font-display text-base font-semibold text-[#7A5E0F]">{inr(m.totals.teacher)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs leading-relaxed text-ink/55">
            Your share is <b>70% of the net</b> (gross minus the payment-gateway charge, ~3% when the actual isn&apos;t
            known yet). {periodCut.anyEstimated && "Charges marked “est.” update once the settlement is confirmed. "}
            Payouts are made after each payment settles and is verified.
          </p>
        </div>
      )}
    </PortalShell>
  );
}

// The gross → charge → net → your share flow, laid out so each cut is obvious.
function CutCard({ totals, title }: { totals: CutTotals; title: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">{title}</p>
        <span className="text-[11px] text-ink/45">{totals.count} payment{totals.count === 1 ? "" : "s"}</span>
      </div>

      {/* Your share is the answer, shown big up top. */}
      <p className="mt-2 font-display text-3xl font-bold text-[#7A5E0F]">{inr(totals.teacher)}</p>
      <p className="text-xs text-ink/55">your earning{totals.anyEstimated ? " (some charges estimated)" : ""}</p>

      <div className="mt-4 space-y-0">
        <CutRow label="Gross collected" value={inr(totals.gross)} />
        <CutRow label={`Gateway charge${totals.anyEstimated ? " (est.)" : ""}`} value={`− ${inr(totals.charge)}`} muted />
        <CutRow label="Net" value={inr(totals.net)} divider />
        <CutRow label="Your share (70%)" value={inr(totals.teacher)} strong />
        <CutRow label="Company (30%)" value={inr(totals.company)} muted />
      </div>
    </div>
  );
}

function CutRow({ label, value, muted, strong, divider }: { label: string; value: string; muted?: boolean; strong?: boolean; divider?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2", divider && "border-t border-hairline mt-1 pt-3")}>
      <span className={cn("text-sm", strong ? "font-semibold text-ink" : muted ? "text-ink/55" : "text-ink/75")}>{label}</span>
      <span className={cn("tabular-nums", strong ? "font-display text-lg font-bold text-[#7A5E0F]" : muted ? "text-sm text-ink/55" : "text-sm font-semibold text-ink")}>{value}</span>
    </div>
  );
}

function StudentEarningCard({ rows, totals, info }: { rows: Payment[]; totals: CutTotals; info?: { name: string; code: string | null } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{info?.name || "Student"}</p>
          <p className="text-[11px] text-ink/55">{inr(totals.gross)} gross · {totals.count} payment{totals.count === 1 ? "" : "s"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-display text-base font-semibold text-[#7A5E0F]">{inr(totals.teacher)}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("text-ink/40 transition-transform", open && "rotate-180")}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </button>
      {open && (
        <div className="divide-y divide-hairline/70 border-t border-hairline">
          {rows.map((p) => {
            const f = feeBreakdown(p);
            return (
              <div key={p.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink/70">{dd(p.payment_date)}{p.payment_mode ? ` · ${p.payment_mode}` : ""}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", isReceived(p) ? "bg-feature-green/12 text-feature-green" : "bg-gold/15 text-[#7A5E0F]")}>{p.payment_status}</span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink/70 sm:grid-cols-4">
                  <span>Gross <b className="text-ink">{inr(f.gross)}</b></span>
                  <span>Charge{f.gatewayEstimated ? " (est.)" : ""} <b className="text-ink">{inr(f.gatewayCharge)}</b></span>
                  <span>Net <b className="text-ink">{inr(f.net)}</b></span>
                  <span>Your 70% <b className="text-[#7A5E0F]">{inr(f.teacherShare)}</b></span>
                </div>
                {p.settlement_status && <p className="mt-1 text-[11px] text-ink/50">Settlement: {p.settlement_status}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sum({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "gold" | "green" }) {
  const c = { ink: "text-ink", gold: "text-[#7A5E0F]", green: "text-feature-green" }[tone];
  return (
    <div className="rounded-2xl border border-hairline bg-white p-3.5 text-center">
      <p className={cn("font-display text-lg font-semibold", c)}>{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink/55">{label}</p>
    </div>
  );
}
