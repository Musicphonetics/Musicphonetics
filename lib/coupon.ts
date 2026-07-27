// ============================================================================
// Musicphonetics — teacher coupon helpers (codes only).
// Owner-created, teacher-carried. The percent lives on the code. The final
// charged amount is always validated server-side (functions/api/razorpay) —
// these helpers are for display + storing the breakdown.
// ============================================================================

import { inr } from "./money";

export interface TeacherCoupon {
  id: string;
  code: string;
  teacher_id: string;
  discount_percent: number;
  active: boolean;
  label: string | null;
}

export interface FeeBreakdown {
  listPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
  couponCode: string | null;
}

/** Normalise a coupon code: uppercase, strip non-alphanumerics. */
export function normalizeCode(raw: string): string {
  return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
}

/** Compute list → discount → final. Rounds the discount to whole rupees. */
export function applyCoupon(listPrice: number, discountPercent: number, couponCode: string | null): FeeBreakdown {
  const pct = Math.max(0, Math.min(100, Math.round(discountPercent || 0)));
  const discountAmount = Math.round((listPrice * pct) / 100);
  return {
    listPrice,
    discountPercent: pct,
    discountAmount,
    finalAmount: Math.max(0, listPrice - discountAmount),
    couponCode: couponCode ? normalizeCode(couponCode) : null,
  };
}

/** Suggest a readable, unique-ish code from a teacher's name + percent, e.g. ISAAC20. */
export function suggestCode(fullName: string, discountPercent: number): string {
  const first = (fullName || "TEACHER").trim().split(/\s+/)[0] || "TEACHER";
  const base = normalizeCode(first).slice(0, 8) || "TEACHER";
  return `${base}${Math.round(discountPercent || 0)}`;
}

/** One-line breakdown for UIs, e.g. "₹15,000 − 20% (₹3,000) = ₹12,000". */
export function breakdownLabel(b: FeeBreakdown): string {
  if (!b.discountPercent) return inr(b.listPrice);
  return `${inr(b.listPrice)} − ${b.discountPercent}% (${inr(b.discountAmount)}) = ${inr(b.finalAmount)}`;
}
