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

// How many SETS the payments have funded. There is NO fixed fee — each student's
// fee is whatever the teacher entered in Admission details (₹6k, ₹10k, ₹16k…),
// and one set = one such fee. So the number of paid sets is simply the money
// received ÷ that student's fee (a two-month payment = two sets). If the fee
// hasn't been entered yet, we fall back to one set per payment so recording a
// payment still creates a set until the fee is filled in. Received/Partial only.
export function countPaidSets(
  payments: FeePaymentLite[],
  monthlyFee: number | null | undefined,
): number {
  const fee = Number(monthlyFee) || 0;
  const valid = payments.filter((p) => p.payment_status === "Received" || p.payment_status === "Partial");
  if (valid.length === 0) return 0;
  if (fee > 0) {
    const totalPaid = valid.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
    return Math.max(1, Math.round(totalPaid / fee));
  }
  return valid.length; // fee not entered yet — one set per payment
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

// Class-validity clock. Each set of classes must be finished within a window
// (policy: 35 days from when the set starts). We nudge quietly from day 0, raise
// a clear alert once it crosses the alert threshold, and mark it lapsed after
// the limit. Nothing is deleted — this only informs; the studio decides.
export const SET_LIMIT_DAYS = 35;
export const SET_ALERT_DAYS = 30;
export const FEE_DUE_DAYS = 30; // fee for the next set is due 30 days from payment

export function addDaysIso(iso: string, days: number): string {
  return new Date(new Date(iso + "T00:00:00").getTime() + days * 86400000).toISOString().slice(0, 10);
}

export interface SetDeadline {
  start: string;          // ISO date the current set's clock started
  deadline: string;       // ISO date the set lapses (start + limit)
  daysElapsed: number;
  daysLeft: number;       // limit − elapsed (negative once lapsed)
  state: "ok" | "urgent" | "expired";
}

// Works off the payment→class cycles. The current set's clock starts at its
// first class; if it hasn't started yet, at the date it was paid for — so a
// student who paid but keeps delaying still sees the clock running.
export function computeSetDeadline(cycles: FeeCycle[], now: Date = new Date()): SetDeadline | null {
  const active = cycles.find((c) => c.status === "active") || cycles.find((c) => c.status === "upcoming");
  const startIso = active?.startedOn || active?.paidOn;
  if (!startIso) return null;
  const day = 86400000;
  const start = new Date(startIso + "T00:00:00").getTime();
  const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00").getTime();
  const daysElapsed = Math.max(0, Math.round((today - start) / day));
  const deadline = new Date(start + SET_LIMIT_DAYS * day).toISOString().slice(0, 10);
  return {
    start: startIso,
    deadline,
    daysElapsed,
    daysLeft: SET_LIMIT_DAYS - daysElapsed,
    state: daysElapsed >= SET_LIMIT_DAYS ? "expired" : daysElapsed >= SET_ALERT_DAYS ? "urgent" : "ok",
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
