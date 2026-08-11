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

  const classesPurchased = Math.round((totalPaid / fee) * cpm);
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
