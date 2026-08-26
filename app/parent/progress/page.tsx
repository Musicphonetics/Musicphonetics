"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { FoundationCard } from "@/components/portal/FoundationCard";
import { MonthlyPlanCard } from "@/components/portal/MonthlyPlanCard";
import { planHasContent } from "@/lib/ai";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, completedCount, type ParentData } from "@/lib/supabase/parent";
import { computeFoundation, skillIndicators } from "@/lib/foundation";
import { studentPlan } from "@/lib/plan";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";

const goalMonthLabel = (m?: string | null) =>
  m ? new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export default function ParentProgress() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = () => loadParentData().then((d) => { setErr(d.error); setData(d); });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const plan = student ? studentPlan(student) : "foundation";
  const foundation = useMemo(() => {
    if (!data || !student) return null;
    return computeFoundation(completedCount(data, student.id), 1, false, plan !== "foundation");
  }, [data, student, plan]);
  const skills = foundation ? skillIndicators(foundation) : [];
  const switcher = data
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Learning journey" headerRight={switcher}>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : student && foundation ? (
        <div className="space-y-4">

          {plan === "foundation" ? (
            <FoundationCard
              instrument={student.instrument}
              foundation={foundation}
              currentTopic={student.current_topic}
              songs={Array.isArray(student.repertoire) ? student.repertoire : []}
              nextMilestone={student.next_milestone}
            />
          ) : plan === "main" ? (
            <>
              <div className="rounded-2xl border border-gold/40 bg-white p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">Learning path</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-ink">Main Musicphonetics Pathway</h3>
                <p className="mt-1 text-sm text-ink/70">Ongoing, structured growth in confidence, theory, ear training and performance, guided by a fresh goal each month.</p>
              </div>
              {planHasContent(student.monthly_plan) ? (
                <MonthlyPlanCard studentName={student.name} instrument={student.instrument} monthlyPlan={student.monthly_plan} plan={plan} />
              ) : (
                <div className="rounded-2xl border border-hairline bg-white p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">{goalMonthLabel(student.goal_month)} · This month&apos;s goal</p>
                  {student.monthly_goal?.trim()
                    ? <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{student.monthly_goal}</p>
                    : <p className="mt-1.5 text-sm leading-relaxed text-ink/65">Your teacher will set this month&apos;s goal soon.</p>}
                </div>
              )}
            </>
          ) : (
            <MonthlyPlanCard studentName={student.name} instrument={student.instrument} monthlyPlan={student.monthly_plan} plan={plan} />
          )}

          {/* Foundation: the month's 8-class plan (in addition to the journey) */}
          {plan === "foundation" && planHasContent(student.monthly_plan) && (
            <MonthlyPlanCard studentName={student.name} instrument={student.instrument} monthlyPlan={student.monthly_plan} plan={plan} />
          )}

          {/* Skill indicators - Foundation only (the tracked curriculum path). */}
          {plan === "foundation" && (
            <div className="rounded-2xl border border-hairline bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/55">Skill indicators</p>
              <div className="space-y-3">
                {skills.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink/80">{s.label}</span>
                      <span className="font-semibold text-ink">{s.value}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-mist">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold to-deep-gold" style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-ink/60">Indicators grow as your child progresses through the journey. Your teacher fine-tunes focus after every class.</p>
            </div>
          )}
        </div>
      ) : <Loading />}
    </PortalShell>
  );
}
