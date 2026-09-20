// ============================================================================
// Earnings accounting for the teacher. Every received payment flows:
//   gross → − gateway charge → net → 70% teacher / 30% company.
// These helpers total that flow for a period, per student, and per month, so the
// earnings screen can always show the gross first and then each cut, and a
// teacher can reconcile month by month and student by student.
// ============================================================================

import type { Payment } from "./supabase/types";
import { feeBreakdown } from "./money";

export const isReceived = (p: Payment) => /received/i.test(p.payment_status);

export interface CutTotals {
  gross: number;
  charge: number;
  net: number;
  teacher: number;
  company: number;
  count: number;        // number of received payments
  anyEstimated: boolean; // a gateway charge was estimated (not from a settlement)
}

const EMPTY: CutTotals = { gross: 0, charge: 0, net: 0, teacher: 0, company: 0, count: 0, anyEstimated: false };

export function sumCuts(payments: Payment[]): CutTotals {
  const t = { ...EMPTY };
  for (const p of payments) {
    if (!isReceived(p)) continue;
    const f = feeBreakdown(p);
    t.gross += f.gross; t.charge += f.gatewayCharge; t.net += f.net;
    t.teacher += f.teacherShare; t.company += f.companyShare; t.count += 1;
    if (f.gatewayEstimated) t.anyEstimated = true;
  }
  return t;
}

// YYYY-MM (calendar month) of a payment date.
export const monthOf = (iso: string) => (iso || "").slice(0, 7);

export interface MonthEarning { key: string; label: string; totals: CutTotals; }

export function byMonth(payments: Payment[]): MonthEarning[] {
  const g = new Map<string, Payment[]>();
  for (const p of payments) {
    if (!isReceived(p)) continue;
    const k = monthOf(p.payment_date);
    (g.get(k) ?? g.set(k, []).get(k)!).push(p);
  }
  return [...g.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // newest month first
    .map(([key, rows]) => ({
      key,
      label: new Date(key + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      totals: sumCuts(rows),
    }));
}

export interface StudentEarning { studentId: string; rows: Payment[]; totals: CutTotals; }

export function byStudent(payments: Payment[]): StudentEarning[] {
  const g = new Map<string, Payment[]>();
  for (const p of payments) {
    (g.get(p.student_id) ?? g.set(p.student_id, []).get(p.student_id)!).push(p);
  }
  return [...g.entries()]
    .map(([studentId, rows]) => ({ studentId, rows, totals: sumCuts(rows) }))
    .filter((s) => s.totals.teacher > 0 || s.rows.some(isReceived))
    .sort((a, b) => b.totals.teacher - a.totals.teacher); // biggest earner first
}

// Average teacher earning per calendar day, from the first received payment to
// today. A steady run-rate the teacher can sanity-check against.
export function avgPerDay(payments: Payment[]): number {
  const received = payments.filter(isReceived);
  if (received.length === 0) return 0;
  const dates = received.map((p) => p.payment_date).filter(Boolean).sort();
  const first = new Date(dates[0] + "T00:00:00").getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime();
  const days = Math.max(1, Math.round((today - first) / 86400000) + 1);
  const total = received.reduce((a, p) => a + feeBreakdown(p).teacherShare, 0);
  return Math.round(total / days);
}
