// ============================================================================
// Class cycles. Fees buy classes in SETS (one set = classes_per_month classes,
// default 8). This groups a student's real class history into those sets so the
// teacher never scrolls through 104 classes at once: they see "Cycle 1 · paid on
// 4 Aug · 8 classes", tap it, and only those 8 open up. A payment that buys 16
// classes simply funds two cycles of 8. Everything is derived from real data.
// ============================================================================

import type { ClassUpdate, Payment } from "./supabase/types";
import { isValidCompleted } from "./attendance";

export interface ClassCycle {
  number: number;              // 1-based cycle number (Cycle 1, Cycle 2 …)
  size: number;                // classes in a full cycle (classes_per_month)
  paidOn: string | null;       // date of the payment that funded this cycle
  amount: number | null;       // fee for this set (or the payment amount if fee unknown)
  paymentMode: string | null;  // how it was paid (funding payment)
  paid: boolean;               // a recorded payment funds this cycle
  classes: ClassUpdate[];      // every class entry in this cycle, oldest → newest
  doneCount: number;           // valid completed classes within this cycle
  status: "done" | "active" | "upcoming" | "unpaid";
}

// Expand a payment into the per-set blocks it funds. ₹24,000 at a ₹12,000 set
// fee = two sets; if the fee isn't recorded yet, one set per payment.
interface FundedSet { paidOn: string; amount: number; mode: string | null; }

export function groupIntoCycles(
  classes: ClassUpdate[],
  payments: Payment[],
  feeQuoted: number | null | undefined,
  classesPerMonth: number | null | undefined,
): ClassCycle[] {
  const cpm = Number(classesPerMonth) > 0 ? Number(classesPerMonth) : 8;
  const fee = Number(feeQuoted) || 0;

  // 1. Funded sets, in the order they were paid for.
  const funded: FundedSet[] = [];
  payments
    .filter((p) => p.payment_status === "Received" || p.payment_status === "Partial")
    .slice()
    .sort((a, b) => (a.payment_date || "").localeCompare(b.payment_date || ""))
    .forEach((p) => {
      const sets = fee > 0 ? Math.max(1, Math.round((Number(p.amount_paid) || 0) / fee)) : 1;
      for (let k = 0; k < sets; k++) {
        funded.push({
          paidOn: p.payment_date,
          amount: fee > 0 ? fee : Number(p.amount_paid) || 0,
          mode: p.payment_mode ?? null,
        });
      }
    });

  // 2. Walk the classes oldest→newest, filling cpm valid-completed per cycle.
  //    Non-completed entries (cancelled, rescheduled) ride along in whatever
  //    cycle is currently filling, so they show in context but never consume a
  //    paid slot.
  const sorted = classes.slice().sort((a, b) => (a.class_date || "").localeCompare(b.class_date || ""));
  const buckets: ClassUpdate[][] = [];
  let done = 0;
  for (const c of sorted) {
    const idx = Math.floor(done / cpm);
    (buckets[idx] ||= []).push(c);
    if (isValidCompleted(c)) done++;
  }

  // 3. Enough cycles to cover both what was paid for and what was actually taught.
  const cycleCount = Math.max(funded.length, buckets.length, 1);

  const out: ClassCycle[] = [];
  for (let i = 0; i < cycleCount; i++) {
    const rows = buckets[i] ?? [];
    const doneCount = rows.reduce((n, c) => n + (isValidCompleted(c) ? 1 : 0), 0);
    const f = funded[i];
    const paid = !!f;
    const full = doneCount >= cpm;
    const status: ClassCycle["status"] = !paid ? "unpaid" : full ? "done" : doneCount > 0 ? "active" : "upcoming";
    out.push({
      number: i + 1,
      size: cpm,
      paidOn: f?.paidOn ?? null,
      amount: f?.amount ?? null,
      paymentMode: f?.mode ?? null,
      paid,
      classes: rows,
      doneCount,
      status,
    });
  }
  return out;
}
