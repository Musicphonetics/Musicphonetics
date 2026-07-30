import { normalizePlan, planHasContent } from "@/lib/ai";
import { cn } from "@/lib/utils";

const monthLabel = (m?: string) =>
  m ? new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// The premium Director's Circle view the family sees: direct mentorship framing,
// one big monthly goal, and the 8 defined classes — personalised to the student.
export function DirectorsPlanCard({
  studentName, instrument, plan, completed = 0,
}: {
  studentName: string; instrument?: string | null;
  plan?: { month?: string; big_goal?: string; classes?: { n: number; title: string; focus: string }[] } | null;
  completed?: number;
}) {
  const first = studentName.split(" ")[0] || "your child";
  const p = normalizePlan(plan, plan?.month || new Date().toISOString().slice(0, 7));
  const hasPlan = planHasContent(p);

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/40 bg-white">
      {/* Premium header */}
      <div className="bg-ink px-5 py-5 text-paper">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Director&apos;s Circle</p>
          <span className="rounded-full border border-gold/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">Premium · by the Director</span>
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold">{first}&apos;s direct mentorship</h3>
        <p className="mt-1 text-sm text-paper/70">
          One-to-one, personally guided by the Director{instrument ? ` · ${instrument}` : ""} · {monthLabel(p.month)}
        </p>
      </div>

      {/* The one big goal */}
      {hasPlan ? (
        <>
          <div className="border-b border-hairline bg-gold/[0.06] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">🎯 This month&apos;s big goal</p>
            <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">
              {p.big_goal || "Your personalised goal for this month."}
            </p>
          </div>

          {/* The 8 defined classes */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">The 8 mentorship classes</p>
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
                        <span className="text-ink/40">Class {c.n}:</span> {c.title || `Mentorship class ${c.n}`}
                      </p>
                      {c.focus && <p className="mt-0.5 text-[13px] leading-snug text-ink/70">{c.focus}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[11px] leading-relaxed text-ink/55">
              Each class is planned personally for {first}. Ticks appear as classes are completed. The Director may adapt the plan as {first} grows.
            </p>
          </div>
        </>
      ) : (
        <div className="px-5 py-6 text-center">
          <p className="text-sm text-ink/70">
            {first}&apos;s personalised monthly plan is being prepared by the Director. Your one big goal and 8 mentorship classes will appear here shortly.
          </p>
        </div>
      )}
    </div>
  );
}
