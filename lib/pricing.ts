// ============================================================================
// Musicphonetics, CURRENT program list prices (single source of truth).
//
// These are the effective/current prices shown across the site and used for new
// enrolments. HISTORICAL payments keep their own recorded amounts, never
// rewrite past transactions from this file. Teacher coupons are applied on top
// (see lib/coupon.ts); the final charged amount and the breakdown are stored per
// payment so reports stay meaningful.
// ============================================================================

import { inr } from "./money";

export type PlanKey = "foundation" | "main" | "directors";

export const PROGRAM_PRICES: Record<PlanKey, number | null> = {
  foundation: 10000,
  main: 12000,
  directors: null, // Director's Circle, by consultation
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

// ---------------------------------------------------------------------------
// Director's Circle is priced per class, set by a personal consultation. We
// still let families see the entry point so they can gauge fit. Single source
// of truth for the hint, reused everywhere the Director's Circle is shown.
// ---------------------------------------------------------------------------
export const DIRECTORS_FEE_FROM = 2500;
export const DIRECTORS_FEE_TO = 5000;
/** e.g. shown as the price line: "From ₹2,500 / class" */
export const DIRECTORS_FEE_FROM_LABEL = "From ₹2,500 / class";
/** compact one-liner used as a hint/subtext */
export const DIRECTORS_FEE_HINT = "By consultation · from ₹2,500 per class (up to ₹5,000)";
/** a fuller sentence for cards/notes */
export const DIRECTORS_FEE_NOTE = "Fees are set by a personal consultation, from ₹2,500 per class, up to ₹5,000.";
