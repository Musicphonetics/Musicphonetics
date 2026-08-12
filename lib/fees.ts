// ============================================================================
// Class-based fee accounting for the Student Portal. Fees buy CLASSES:
// ₹12,000 = 8 classes. As classes are completed the fee is "consumed" — the
// parent sees a progress bar, how much is left, and when renewal is coming.
// Advance payments simply add more purchased classes; everything stays countable
// across every transaction. Recomputed from data, so recording a payment (or a
// completed class) updates the parent's portal instantly.
// ============================================================================

export interface FeePaymentLite {
  amount_paid: number;
  payment_status: string;
}

export interface FeeStanding {
  monthlyFee: number;
  classesPerMonth: number;
  totalPaid: number;
  classesPurchased: number;   // classes the payments have bought
  completed: number;          // classes actually taken
  used: number;               // completed, capped at purchased
  remaining: number;          // classes still available
  pct: number;                // used / purchased (0..1) — the progress bar
  feeConsumed: number;        // ₹ used up so far
  feeRemaining: number;       // ₹ still "in the bank"
  monthsAhead: number;        // remaining / classesPerMonth (1 dp)
  renewalSoon: boolean;       // few classes left
  fullyUsed: boolean;
}

// One payment's block of classes, mapped onto the REAL dates classes were taken.
// This is what lets the family see the story: paid on X → these classes → the
// block got finished on Y (which is when the next payment fell due). Nothing is
// projected or invented — finishedOn only appears once enough real classes exist.
export interface FeeCycle {
  index: number;
  paidOn: string;              // payment_date
  amount: number;
  classes: number;             // classes this payment bought
  startedOn: string | null;    // date of the first class drawn from this block
  finishedOn: string | null;   // date the block ran out — i.e. renewal fell due
  done: number;                // completed classes within this block
  status: "done" | "active" | "upcoming";
}

export interface FeeCyclePayment {
  amount_paid: number;
  payment_status: string;
  payment_date: string;
}

export function computeFeeCycles(
  payments: FeeCyclePayment[],
  monthlyFee: number | null | undefined,
  classesPerMonth: number | null | undefined,
  completedDates: string[],     // real class dates (any order)
): FeeCycle[] {
  const fee = Number(monthlyFee) || 0;
  if (fee <= 0) return [];
  const cpm = Number(classesPerMonth) > 0 ? Number(classesPerMonth) : 8;

  const pays = payments
    .filter((p) => p.payment_status === "Received" || p.payment_status === "Partial")
    .slice()
    .sort((a, b) => a.payment_date.localeCompare(b.payment_date));
  const dates = completedDates.filter(Boolean).slice().sort((a, b) => a.localeCompare(b));
  const total = dates.length;

  let cursor = 0; // how many completed classes are already spoken for by earlier blocks
  return pays.map((p, i) => {
    const classes = Math.max(0, Math.round((Number(p.amount_paid) / fee) * cpm));
    const start = cursor;
    const end = cursor + classes; // exclusive index into the completed-class dates
    const done = Math.max(0, Math.min(total, end) - start);
    const startedOn = done > 0 ? dates[start] : null;
    const finishedOn = classes > 0 && total >= end ? dates[end - 1] : null;
    cursor = end;
    return {
      index: i,
      paidOn: p.payment_date,
      amount: Number(p.amount_paid) || 0,
      classes,
      startedOn,
      finishedOn,
      done,
      status: finishedOn ? "done" : done > 0 ? "active" : "upcoming",
    };
  });
}

// How many SETS the payments have funded. The rule the studio actually uses:
// each payment received = one set of classes. A larger payment (e.g. two months
// in one go) counts as however many whole fees it covers, but never less than
// one set per payment — and it works even when fee_quoted isn't filled in, so a
// payment always creates a set. Only Received/Partial payments count.
export function countPaidSets(
  payments: FeePaymentLite[],
  monthlyFee: number | null | undefined,
): number {
  const fee = Number(monthlyFee) || 0;
  let sets = 0;
  for (const p of payments) {
    if (p.payment_status !== "Received" && p.payment_status !== "Partial") continue;
    sets += fee > 0 ? Math.max(1, Math.round((Number(p.amount_paid) || 0) / fee)) : 1;
  }
  return sets;
}

// Total classes the payments have bought (whole sets). Falls back to one set
// before any payment so a new student isn't shown as already used up.
export function purchasedClasses(
  payments: FeePaymentLite[],
  monthlyFee: number | null | undefined,
  classesPerMonth: number | null | undefined,
): number {
  const cpm = Number(classesPerMonth) > 0 ? Number(classesPerMonth) : 8;
  const sets = countPaidSets(payments, monthlyFee);
  return (sets > 0 ? sets : 1) * cpm;
}

// Classes are counted in SETS (one set = one paid month = classes_per_month
// classes). The counter never goes past the set size: 14 completed at 8/set is
// "Set 1 done + 6 of 8 in Set 2", shown as 6/8, not 14/16. Each payment funds a
// set; renewal is due only once every funded set is complete.
export interface SetProgress {
  perSet: number;         // classes in one set (classes_per_month)
  paidSets: number;       // sets funded by payments (min 1)
  completedSets: number;  // sets fully finished
  currentSet: number;     // 1-based index of the set in progress
  currentDone: number;    // classes done in the current set (0..perSet)
  remainingInSet: number; // perSet - currentDone
  totalCompleted: number; // raw completed classes (all sets)
  allComplete: boolean;   // every paid set finished → renewal due
}

export function computeSetProgress(
  completedClasses: number,
  classesPerMonth: number | null | undefined,
  classesPurchased: number | null | undefined,
): SetProgress {
  const perSet = Number(classesPerMonth) > 0 ? Number(classesPerMonth) : 8;
  const done = Math.max(0, Math.floor(completedClasses || 0));
  const purchased = Number(classesPurchased) > 0 ? Number(classesPurchased) : perSet;
  const paidSets = Math.max(1, Math.round(purchased / perSet));
  const capacity = paidSets * perSet;
  const used = Math.min(done, capacity);        // never count past what's paid for
  const fullSets = Math.floor(used / perSet);
  const allComplete = used >= capacity;
  const completedSets = Math.min(fullSets, paidSets);
  const currentSet = allComplete ? paidSets : completedSets + 1;
  const currentDone = allComplete ? perSet : used - completedSets * perSet;
  return {
    perSet, paidSets, completedSets, currentSet, currentDone,
    remainingInSet: perSet - currentDone,
    totalCompleted: done,
    allComplete,
  };
}

export function computeFeeStanding(
  monthlyFee: number | null | undefined,
  classesPerMonth: number | null | undefined,
  completedClasses: number,
  payments: FeePaymentLite[],
): FeeStanding | null {
  const fee = Number(monthlyFee) || 0;
  if (fee <= 0) return null;
  const cpm = Number(classesPerMonth) > 0 ? Number(classesPerMonth) : 8;

  const totalPaid = payments
    .filter((p) => p.payment_status === "Received" || p.payment_status === "Partial")
    .reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);

  const classesPurchased = purchasedClasses(payments, fee, cpm);
  const completed = Math.max(0, Math.floor(completedClasses || 0));
  const used = Math.min(completed, classesPurchased);
  const remaining = Math.max(0, classesPurchased - completed);
  const pct = classesPurchased > 0 ? used / classesPurchased : 0;
  const feeConsumed = classesPurchased > 0 ? (used / classesPurchased) * totalPaid : 0;

  return {
    monthlyFee: fee,
    classesPerMonth: cpm,
    totalPaid,
    classesPurchased,
    completed,
    used,
    remaining,
    pct,
    feeConsumed: Math.round(feeConsumed),
    feeRemaining: Math.round(totalPaid - feeConsumed),
    monthsAhead: Math.round((remaining / cpm) * 10) / 10,
    renewalSoon: remaining > 0 && remaining <= Math.max(1, Math.round(cpm * 0.25)),
    fullyUsed: classesPurchased > 0 && remaining === 0,
  };
}
