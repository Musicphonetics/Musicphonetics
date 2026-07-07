// ============================================================================
// Musicphonetics - "Teach With Us" economics.
// Tune every number on the page from here. All projections are illustrative.
// Real, citable figures: 70% teacher share, ₹1,200 / ₹1,500 per-class fees,
// per-class shares ₹840 / ₹1,050, 1,100+ students taught, ~10 years teaching.
// ============================================================================

export const ECON = {
  shareRate: 0.7,
  classesPerStudentPerMonth: 8,
  packages: { foundation: 1200, transformation: 1500 }, // ₹ per class
  blendedPerClassShare: 924, // ≈ 60/40 foundation/transformation × 0.70
};

export type PackageKey = "foundation" | "transformation" | "blended";

/** Per-class share to the teacher for a given package. */
export function perClassShare(pkg: PackageKey): number {
  if (pkg === "blended") return ECON.blendedPerClassShare;
  return Math.round(ECON.packages[pkg] * ECON.shareRate);
}

export interface CalcResult {
  classesPerMonth: number;
  monthly: number;
  annual: number;
  share: number;
}

export function calcIncome(students: number, pkg: PackageKey): CalcResult {
  const share = perClassShare(pkg);
  const classesPerMonth = students * ECON.classesPerStudentPerMonth;
  const monthly = classesPerMonth * share;
  return { classesPerMonth, monthly, annual: monthly * 12, share };
}

export const PACKAGE_OPTIONS: { key: PackageKey; label: string; note: string }[] = [
  { key: "foundation", label: "Foundation", note: "₹1,200/class → ₹840 to you" },
  { key: "blended", label: "Blended", note: "≈ ₹924/class to you" },
  { key: "transformation", label: "Transformation", note: "₹1,500/class → ₹1,050 to you" },
];

// D · Roster ramp (projected)
export const ROSTER_RAMP = [
  { stage: "Week 1 · 2 students", income: 14800 },
  { stage: "Month 1 · 4 students", income: 29600 },
  { stage: "Month 2 · 6 students", income: 44400 },
  { stage: "Month 3 · 8 students", income: 59200 },
];

// E · Solo vs Musicphonetics (honest: edge is stability + volume, not rate)
export const SOLO_VS = [
  { metric: "Per-class rate", solo: 1000, faculty: 924, unit: "₹/class" },
  { metric: "Steady students/month", solo: 4, faculty: 8, unit: "students" },
  { metric: "Steady monthly income", solo: 28000, faculty: 59200, unit: "₹" },
];

// G · 12-month projection (monthly projected income; M6/M12 = loyalty payments)
export const YEAR_PROJECTION = [
  { m: "M1", income: 22000 }, { m: "M2", income: 37000 }, { m: "M3", income: 52000 },
  { m: "M4", income: 59000 }, { m: "M5", income: 59000 }, { m: "M6", income: 74000 },
  { m: "M7", income: 59000 }, { m: "M8", income: 59000 }, { m: "M9", income: 59000 },
  { m: "M10", income: 59000 }, { m: "M11", income: 59000 }, { m: "M12", income: 74000 },
];

export const TEACH_WHATSAPP =
  "https://wa.me/918796199188?text=Hi%20Musicphonetics%2C%20I%27m%20a%20music%20teacher%20and%20I%27d%20like%20to%20join%20your%20faculty";
