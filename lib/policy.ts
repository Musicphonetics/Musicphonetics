// ============================================================================
// Musicphonetics course + billing policy - one source of truth, reused across
// the pay page, programme pages, the welcome/onboarding document and terms.
// ============================================================================

export const CLASSES_PER_CYCLE = 8;
export const CYCLE_DAYS = 35;         // 8 classes must be used within 35 days
export const GRACE_WEEKS = 1;         // 35 days = 4 teaching weeks + 1 week grace

// The class-schedule rules a student agrees to at enrolment.
export const SCHEDULE_POLICY: string[] = [
  "Each month you receive 8 classes, one hour each.",
  "All 8 classes must be completed within 35 days (5 weeks) of your cycle start date.",
  "The 35 days already include a 1-week extension over the usual 4 teaching weeks.",
  "8 classes cannot be stretched across two months - the cycle is 35 days, not 60.",
  "After 35 days, any unused classes lapse and the schedule is suspended.",
  "To continue, simply renew for the next cycle - your teacher and slot are held for you.",
];

// The billing rules (pro-rata so accounting is clean, not random).
export const BILLING_POLICY: string[] = [
  "Fees are aligned to the calendar month so billing is simple and predictable.",
  "If you join mid-month, your first payment is pro-rated for the remaining days only.",
  "From then on, the monthly fee is due at the start of each month (1st or 2nd).",
  "Payments are made only through the official Musicphonetics Cashfree link.",
];

// The terms a family reads and agrees to BEFORE paying.
export const TERMS_AGREED: string[] = [
  "Fees are paid only through the official Musicphonetics Cashfree link.",
  "8 classes per month, to be completed within 35 days of the cycle start.",
  "Unused classes lapse after 35 days; the cycle must be renewed to continue.",
  "Rescheduling is allowed with advance notice, subject to teacher availability.",
  "The final teacher, slot and start are confirmed by the Musicphonetics office.",
  "Refunds follow the published Refund & Payment Standard.",
  "Respectful conduct and a safe learning environment are expected at all times.",
];

export interface Prorata {
  monthly: number;
  daysInMonth: number;
  day: number;
  remainingDays: number;
  firstPayment: number;
  perDay: number;
  nextDueLabel: string;
}

// Pro-rate a monthly fee for someone enrolling today (or on a given date).
export function computeProrata(monthly: number, date = new Date()): Prorata {
  const y = date.getFullYear();
  const m = date.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const day = date.getDate();
  const remainingDays = Math.max(daysInMonth - day + 1, 1);
  const perDay = monthly / daysInMonth;
  const firstPayment = Math.round(perDay * remainingDays);
  const next = new Date(y, m + 1, 1);
  const nextDueLabel = next.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
  return { monthly, daysInMonth, day, remainingDays, firstPayment, perDay: Math.round(perDay), nextDueLabel };
}
