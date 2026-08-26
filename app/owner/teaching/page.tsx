"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";
import { MonthlyPlanCard } from "@/components/portal/MonthlyPlanCard";
import { FoundationCard } from "@/components/portal/FoundationCard";
import { computeFoundation } from "@/lib/foundation";
import { studentPlan, PLAN_LABEL, type Plan } from "@/lib/plan";
import { planHasContent } from "@/lib/ai";
import type { Student, ClassUpdate } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const prettyDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function OwnerTeaching() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [completedById, setCompletedById] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);
  const [teacherFilter, setTeacherFilter] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setStudents([]); return; }
    loadOwnerData().then((d) => {
      setErr(d.error);
      setStudents(d.students);
      setTeachers(d.teachers.map((t) => ({ id: t.id, name: t.full_name || "Unnamed teacher" })));
      const done: Record<string, number> = {};
      for (const c of d.classes) {
        if (c.class_status === "Completed" && c.counts_toward_cycle !== false) done[c.student_id] = (done[c.student_id] ?? 0) + 1;
      }
      setCompletedById(done);
    });
  }, []);

  const teacherName = (id: string | null | undefined) => teachers.find((t) => t.id === id)?.name ?? "Unassigned";

  const filtered = useMemo(() => {
    let list = students ?? [];
    if (teacherFilter) list = list.filter((s) => s.teacher_id === teacherFilter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.student_code ?? "").toLowerCase().includes(q));
    return list;
  }, [students, teacherFilter, query]);

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Teaching plans">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)}
          className="rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none">
          <option value="">All teachers</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student name or code…"
          className="min-w-[200px] flex-1 rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        {students && <span className="text-sm text-ink/55">{filtered.length} student{filtered.length === 1 ? "" : "s"}</span>}
      </div>

      {!students ? <Loading /> : filtered.length === 0 ? (
        <p className="rounded-2xl border border-hairline bg-white p-6 text-sm text-ink/60">No students match.</p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((s) => {
            const plan = studentPlan(s);
            const hasPlan = planHasContent(s.monthly_plan);
            const done = completedById[s.id] ?? 0;
            const open = openId === s.id;
            return (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-hairline bg-white">
                <button onClick={() => setOpenId(open ? null : s.id)} className="flex w-full items-center gap-3 p-4 text-left">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm font-bold text-[#7A5E0F]">{(s.name[0] || "?").toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{s.name} {s.student_code && <span className="ml-1 font-mono text-[11px] text-ink/45">{s.student_code}</span>}</p>
                    <p className="truncate text-xs text-ink/60">{teacherName(s.teacher_id)} · {s.instrument || "-"} · {done} classes done</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", planBadge(plan))}>{PLAN_LABEL[plan]}</span>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", hasPlan ? "bg-feature-green/12 text-feature-green" : "bg-mist text-ink/50")}>{hasPlan ? "Plan set" : "No plan"}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={cn("shrink-0 text-ink/40 transition-transform", open && "rotate-180")}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {open && <StudentDetail student={s} plan={plan} completed={done} teacherName={teacherName(s.teacher_id)} />}
              </div>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}

function planBadge(plan: Plan) {
  return { foundation: "bg-gold/15 text-[#7A5E0F]", main: "bg-forest/12 text-forest", directors: "bg-ink/10 text-ink/70" }[plan];
}

// Expanded: the teacher's 8-class plan + progress + recent class updates.
function StudentDetail({ student, plan, completed, teacherName }: { student: Student; plan: Plan; completed: number; teacherName: string }) {
  const [classes, setClasses] = useState<ClassUpdate[] | null>(null);

  useEffect(() => {
    getSupabase().from("class_updates").select("*").eq("student_id", student.id).order("class_date", { ascending: false }).limit(8)
      .then(({ data }) => setClasses((data as ClassUpdate[]) ?? []));
  }, [student.id]);

  const foundation = plan === "foundation" ? computeFoundation(completed, 1, false, false) : null;

  return (
    <div className="border-t border-hairline bg-paper p-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">This month&apos;s plan (by {teacherName})</p>
          <MonthlyPlanCard studentName={student.name} instrument={student.instrument} monthlyPlan={student.monthly_plan} plan={plan} completed={completed} />
        </div>
        <div className="space-y-4">
          {foundation && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Curriculum progress</p>
              <FoundationCard instrument={student.instrument} foundation={foundation} currentTopic={student.current_topic} songs={Array.isArray(student.repertoire) ? student.repertoire : []} nextMilestone={student.next_milestone} />
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Recent class updates</p>
            {!classes ? <p className="text-xs text-ink/50">Loading…</p> : classes.length === 0 ? (
              <p className="rounded-xl border border-hairline bg-white p-4 text-sm text-ink/60">No classes logged yet.</p>
            ) : (
              <div className="space-y-2">
                {classes.map((c) => (
                  <div key={c.id} className="rounded-xl border border-hairline bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-ink">{prettyDate(c.class_date)}</p>
                      <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold text-ink/60">{c.class_status}</span>
                    </div>
                    {c.taught && <p className="mt-1 text-xs text-ink/80"><b className="text-ink/60">Taught:</b> {c.taught}</p>}
                    {c.homework && <p className="mt-0.5 text-xs text-ink/70"><b className="text-ink/60">Homework:</b> {c.homework}</p>}
                    {c.teacher_notes && <p className="mt-0.5 text-xs text-ink/60"><b className="text-ink/60">Notes:</b> {c.teacher_notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
