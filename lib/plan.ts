// Which Musicphonetics batch a student is on, and what their portal shows.
//
//   foundation → curriculum progress bar + monthly goal
//   main       → monthly goal only (no progress bar)
//   directors  → neither (a bespoke, personally-guided plan)
//
// Uses the explicit `plan` column when set; otherwise infers from the fee
// (Foundation ₹8,000 vs Main Pathway ₹12,000). It never infers "directors" -
// that is set explicitly (activation stamps it, or a teacher/owner sets it).

export type Plan = "foundation" | "main" | "directors";

export const PLAN_LABEL: Record<Plan, string> = {
  foundation: "Foundation",
  main: "Main Pathway",
  directors: "Director's Circle",
};

export function studentPlan(s: { plan?: string | null; fee_quoted: number | null }): Plan {
  const p = (s.plan || "").toLowerCase();
  if (p === "foundation" || p === "main" || p === "directors") return p;
  return (s.fee_quoted ?? 8000) < 12000 ? "foundation" : "main";
}

// Only Foundation shows the curriculum progress bar.
export const showsProgressBar = (plan: Plan) => plan === "foundation";
// Foundation + Main Pathway show the teacher's rolling monthly goal.
export const showsMonthlyGoal = (plan: Plan) => plan === "foundation" || plan === "main";
