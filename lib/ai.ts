// Client helpers for the Gemini-backed AI endpoints (server-side key never
// reaches the browser). Both endpoints are stateless; the teacher plan is saved
// separately via Supabase RLS.

export interface PlanClass {
  n: number;
  title: string;
  focus: string;
}

export interface MonthlyPlan {
  month: string;            // "YYYY-MM"
  big_goal: string;
  classes: PlanClass[];     // 8 items
  updated_at?: string;
}

export function emptyPlan(month: string): MonthlyPlan {
  return {
    month,
    big_goal: "",
    classes: Array.from({ length: 8 }, (_, i) => ({ n: i + 1, title: "", focus: "" })),
  };
}

// Coerce whatever is stored/returned into a valid 8-class plan.
export function normalizePlan(raw: unknown, month: string): MonthlyPlan {
  const p = (raw ?? {}) as Partial<MonthlyPlan>;
  const base = emptyPlan(month);
  const classes = Array.isArray(p.classes) ? p.classes : [];
  return {
    month: p.month || month,
    big_goal: typeof p.big_goal === "string" ? p.big_goal : "",
    classes: base.classes.map((c, i) => ({
      n: i + 1,
      title: String(classes[i]?.title ?? "").trim(),
      focus: String(classes[i]?.focus ?? "").trim(),
    })),
    updated_at: p.updated_at,
  };
}

export function planHasContent(
  p?: { big_goal?: string | null; classes?: { title?: string | null; focus?: string | null }[] } | null,
): boolean {
  if (!p) return false;
  const big = (p.big_goal ?? "").trim();
  const anyClass = Array.isArray(p.classes) && p.classes.some((c) => (c?.title ?? "").trim() || (c?.focus ?? "").trim());
  return !!(big || anyClass);
}

// Teacher: rough notes → { big_goal, classes[8] }.
export async function aiGeneratePlan(input: {
  notes: string; student_name?: string; instrument?: string | null; level?: string | null; program?: string;
}): Promise<{ big_goal: string; classes: PlanClass[] }> {
  const res = await fetch("/api/ai/plan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; plan?: { big_goal: string; classes: PlanClass[] }; error?: string };
  if (!res.ok || !data.ok || !data.plan) throw new Error(data.error || "Couldn't generate the plan.");
  return data.plan;
}

// Parent: ask a question about the curriculum.
export async function aiAsk(question: string, ctx?: { student_name?: string; instrument?: string | null }): Promise<string> {
  const res = await fetch("/api/ai/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, ...ctx }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; answer?: string; error?: string };
  if (!res.ok || !data.ok || !data.answer) throw new Error(data.error || "Couldn't get an answer.");
  return data.answer;
}
