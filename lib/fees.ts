// ============================================================================
// Advance-fee calculator for the Student Portal. Given the monthly fee, a start
// anchor and the recorded payments, it works out how much has been paid, how far
// ahead the family is, and the next due date. Recomputed from payments, so the
// moment the office records an advance payment the parent's portal updates.
// ============================================================================

export interface FeePaymentLite {
  amount_paid: number;
  payment_date: string; // ISO date
  payment_status: string;
}

export interface FeeStanding {
  monthlyFee: number;
  totalPaid: number;
  cyclesStarted: number;    // months that have begun since the anchor
  monthsPaid: number;       // whole months the payments cover
  expectedByNow: number;    // monthlyFee * cyclesStarted
  advanceAmount: number;    // paid beyond what's due to date (credit)
  advanceMonths: number;    // advanceAmount / monthlyFee (1 dp)
  outstanding: number;      // shortfall to date
  nextDueISO: string | null; // date the next unpaid month begins
  paidAhead: boolean;
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  return x;
}

// Counts monthly cycles that have STARTED since the anchor (each begins on the
// anchor's day-of-month). The current cycle counts once we're past its day.
function cyclesStarted(anchor: Date, today: Date): number {
  let m = (today.getFullYear() - anchor.getFullYear()) * 12 + (today.getMonth() - anchor.getMonth());
  if (today.getDate() >= anchor.getDate()) m += 1;
  return Math.max(1, m);
}

export function computeFeeStanding(
  monthlyFee: number | null | undefined,
  startDate: string | null | undefined,
  payments: FeePaymentLite[],
): FeeStanding | null {
  const fee = Number(monthlyFee) || 0;
  if (fee <= 0) return null;

  const counted = payments.filter((p) => p.payment_status === "Received" || p.payment_status === "Partial");
  const totalPaid = counted.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);

  // Anchor: the student's start date, else the earliest payment, else this month.
  const dates = counted.map((p) => p.payment_date).filter(Boolean).sort();
  const anchorStr = startDate || dates[0] || new Date().toISOString().slice(0, 10);
  const anchor = new Date(anchorStr + "T00:00:00");
  const today = new Date();

  const started = cyclesStarted(anchor, today);
  const expectedByNow = fee * started;
  const monthsPaidWhole = Math.floor(totalPaid / fee);
  const advanceAmount = Math.max(0, totalPaid - expectedByNow);
  const outstanding = Math.max(0, expectedByNow - totalPaid);
  const nextDue = addMonths(anchor, monthsPaidWhole);

  return {
    monthlyFee: fee,
    totalPaid,
    cyclesStarted: started,
    monthsPaid: monthsPaidWhole,
    expectedByNow,
    advanceAmount,
    advanceMonths: Math.round((advanceAmount / fee) * 10) / 10,
    outstanding,
    nextDueISO: isNaN(nextDue.getTime()) ? null : nextDue.toISOString().slice(0, 10),
    paidAhead: advanceAmount > 0,
  };
}
