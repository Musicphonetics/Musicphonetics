// ============================================================================
// Musicphonetics — CURRENT program list prices (single source of truth).
//
// These are the effective/current prices shown across the site and used for new
// enrolments. HISTORICAL payments keep their own recorded amounts — never
// rewrite past transactions from this file. Teacher coupons are applied on top
// (see lib/coupon.ts); the final charged amount and the breakdown are stored per
// payment so reports stay meaningful.
// ============================================================================

import { inr } from "./money";

export type PlanKey = "foundation" | "main" | "directors";

export const PROGRAM_PRICES: Record<PlanKey, number | null> = {
  foundation: 10000,
  main: 15000,
  directors: null, // Director's Circle — by consultation
};

export const PROGRAM_NAME: Record<PlanKey, string> = {
  foundation: "Foundation",
  main: "Main Pathway",
  directors: "Director's Circle",
};

/** Display string for a plan's list price, e.g. "₹10,000" or "By consultation". */
export function priceLabel(plan: PlanKey): string {
  const p = PROGRAM_PRICES[plan];
  return p == null ? "By consultation" : inr(p);
}

/** Numeric list price (null for consultation-only plans). */
export function listPrice(plan: PlanKey): number | null {
  return PROGRAM_PRICES[plan];
}
