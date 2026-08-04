import { normalizePlan, planHasContent } from "@/lib/ai";
import { PLAN_LABEL, type Plan } from "@/lib/plan";
import { cn } from "@/lib/utils";

const monthLabel = (m?: string) =>
  m ? new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// The family-facing monthly plan: one big goal + the 8 defined classes,
// personalised to the student. Director's Circle gets the premium (dark, "direct
// mentorship") treatment; Foundation / Main get a lighter "this month" framing.
export function MonthlyPlanCard({
  studentName, instrument, monthlyPlan, plan, completed = 0,
}: {
  studentName: string; instrument?: string | null;
  monthlyPlan?: { month?: string; big_goal?: string; classes?: { n: number; title: string; focus: string }[] } | null;
  plan: Plan; completed?: number;
}) {
  const first = studentName.split(" ")[0] || "your child";
  const p = normalizePlan(monthlyPlan, monthlyPlan?.month || new Date().toISOString().slice(0, 7));
  const hasPlan = planHasContent(p);
  const premium = plan === "directors";

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-white", premium ? "border-gold/40" : "border-hairline")}>
      {/* Header */}
      {premium ? (
        <div className="bg-ink px-5 py-5 text-paper">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Director&apos;s Circle</p>
            <span className="rounded-full border border-gold/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">Premium · by the Director</span>
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold">{first}&apos;s direct mentorship</h3>
          <p className="mt-1 text-sm text-paper/70">
            One-to-one, personally guided by the Director{instrument ? ` · ${instrument}` : ""} · {monthLabel(p.month)}
          </p>
          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-white/[0.04] px-2.5 py-1 text-[11px] text-paper/60">
            <span className="text-gold">◆</span> Fees by consultation · from ₹2,500/class (up to ₹5,000)
          </p>
        </div>
      ) : (
        <div className="border-b border-hairline bg-gradient-to-br from-gold/[0.1] to-transparent px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A5E0F]">{PLAN_LABEL[plan]} · This month&apos;s plan</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">{first}&apos;s plan for {monthLabel(p.month)}</h3>
        </div>
      )}

      {hasPlan ? (
        <>
          {/* One big goal */}
          <div className={cn("border-b border-hairline px-5 py-4", premium ? "bg-gold/[0.06]" : "bg-mist/40")}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">🎯 This month&apos;s big goal</p>
            <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">
              {p.big_goal || "Your personalised goal for this month."}
            </p>
          </div>

          {/* The 8 classes */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">
              {premium ? "The 8 mentorship classes" : "The 8 classes this month"}
            </p>
            <ol className="mt-3 space-y-2.5">
              {p.classes.map((c) => {
                const done = completed >= c.n;
                return (
                  <li key={c.n} className={cn("flex gap-3 rounded-xl border p-3", done ? "border-feature-green/30 bg-feature-green/[0.04]" : "border-hairline")}>
                    <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                      done ? "bg-feature-green/15 text-feature-green" : "bg-gold/15 text-[#7A5E0F]")}>
                      {done
                        ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                        : c.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        <span className="text-ink/40">Class {c.n}:</span> {c.title || `Class ${c.n}`}
                      </p>
                      {c.focus && <p className="mt-0.5 text-[13px] leading-snug text-ink/70">{c.focus}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[11px] leading-relaxed text-ink/55">
              Each class is planned personally for {first}. Ticks appear as classes are completed{premium ? "; the Director may adapt the plan as they grow" : ""}.
            </p>
          </div>
        </>
      ) : (
        <div className="px-5 py-6 text-center">
          <p className="text-sm text-ink/70">
            {first}&apos;s personalised monthly plan is being prepared{premium ? " by the Director" : ""}. The big goal and 8 classes will appear here shortly.
          </p>
        </div>
      )}
    </div>
  );
}
