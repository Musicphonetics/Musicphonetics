// ============================================================================
// Payment-driven class cycles. Each payment a student makes automatically buys
// a number of classes — from an explicit "classes this covers" figure, or from
// amount ÷ per-class rate — and those classes are consumed in date order. So
// "₹8k then ₹16k" shows up as two cycles that map onto the real classes: the 8k
// covers the first block, the 16k the next, and anything taught beyond what's
// paid falls into an "unpaid" cycle (fee due). Everything is derived from data.
// ============================================================================

import type { ClassUpdate, Payment } from "./supabase/types";
import { isValidCompleted } from "./attendance";

export interface ClassCycle {
  number: number;              // 1-based cycle number (Cycle 1, Cycle 2 …)
  size: number;                // classes this cycle covers
  paidOn: string | null;       // date of the payment that funded this cycle
  amount: number | null;       // the payment amount (what was received)
  paymentMode: string | null;  // how it was paid
  paid: boolean;               // a recorded payment funds this cycle
  classes: ClassUpdate[];      // every class entry in this cycle, oldest → newest
  doneCount: number;           // valid completed classes within this cycle
  status: "done" | "active" | "upcoming" | "unpaid";
}

// How many classes a single payment buys: an explicit count if recorded,
// otherwise amount ÷ (fee ÷ classes-per-set). Falls back to one set.
export function classesForPayment(p: Payment, feeQuoted: number | null | undefined, classesPerMonth: number | null | undefined): number {
  const cpm = Number(classesPerMonth) > 0 ? Number(classesPerMonth) : 8;
  if (p.classes_included != null && Number(p.classes_included) > 0) return Math.round(Number(p.classes_included));
  const fee = Number(feeQuoted) || 0;
  if (fee > 0) return Math.max(1, Math.round(((Number(p.amount_paid) || 0) / fee) * cpm));
  return cpm;
}

export function groupIntoCycles(
  classes: ClassUpdate[],
  payments: Payment[],
  feeQuoted: number | null | undefined,
  classesPerMonth: number | null | undefined,
): ClassCycle[] {
  const cpm = Number(classesPerMonth) > 0 ? Number(classesPerMonth) : 8;

  // 1. Each payment, oldest first, with the number of classes it buys.
  const blocks = payments
    .filter((p) => p.payment_status === "Received" || p.payment_status === "Partial")
    .slice()
    .sort((a, b) => (a.payment_date || "").localeCompare(b.payment_date || ""))
    .map((p) => ({
      paidOn: p.payment_date,
      amount: Number(p.amount_paid) || 0,
      mode: p.payment_mode ?? null,
      size: classesForPayment(p, feeQuoted, classesPerMonth),
    }));

  // 2. Walk the classes oldest→newest, filling each payment's block with its
  //    `size` valid-completed classes. Non-completed entries (cancelled,
  //    rescheduled) ride along in the current block but never consume a slot.
  const sorted = classes.slice().sort((a, b) => (a.class_date || "").localeCompare(b.class_date || ""));
  const buckets: ClassUpdate[][] = blocks.map(() => []);
  const unpaid: ClassUpdate[] = [];
  let bi = 0;        // current payment block
  let filled = 0;    // completed classes placed in the current block
  for (const c of sorted) {
    while (bi < blocks.length && filled >= blocks[bi].size) { bi++; filled = 0; }
    if (bi < blocks.length) {
      buckets[bi].push(c);
      if (isValidCompleted(c)) filled++;
    } else {
      unpaid.push(c); // taught beyond everything paid for
    }
  }

  const out: ClassCycle[] = [];
  blocks.forEach((b, i) => {
    const rows = buckets[i];
    const doneCount = rows.reduce((n, c) => n + (isValidCompleted(c) ? 1 : 0), 0);
    const status: ClassCycle["status"] = doneCount >= b.size ? "done" : doneCount > 0 ? "active" : "upcoming";
    out.push({ number: i + 1, size: b.size, paidOn: b.paidOn, amount: b.amount, paymentMode: b.mode, paid: true, classes: rows, doneCount, status });
  });

  // Classes taught with no payment left to cover them → fee due.
  if (unpaid.length > 0) {
    const doneCount = unpaid.reduce((n, c) => n + (isValidCompleted(c) ? 1 : 0), 0);
    out.push({ number: out.length + 1, size: Math.max(cpm, doneCount), paidOn: null, amount: null, paymentMode: null, paid: false, classes: unpaid, doneCount, status: "unpaid" });
  }

  return out;
}
