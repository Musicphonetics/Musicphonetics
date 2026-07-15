"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { TextArea, Toast, Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { StudentStat, StudentReport, ClassUpdate } from "@/lib/supabase/types";
import { attendanceStats } from "@/lib/attendance";
import { studentPlan, PLAN_LABEL } from "@/lib/plan";
import { logAudit, AUDIT } from "@/lib/audit";
import { cn } from "@/lib/utils";

const thisMonth = () => new Date().toISOString().slice(0, 7);
const monthBounds = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return { start: new Date(y, m - 1, 1).toISOString().slice(0, 10), end: new Date(y, m, 1).toISOString().slice(0, 10) };
};

type Fields = {
  topics_covered: string; skills_improved: string; homework_completion: string; teacher_comments: string;
  current_goal: string; goal_outcome: string; next_goal: string; attention_areas: string;
};
const EMPTY: Fields = { topics_covered: "", skills_improved: "", homework_completion: "", teacher_comments: "", current_goal: "", goal_outcome: "", next_goal: "", attention_areas: "" };

export default function TeacherReports() {
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [sid, setSid] = useState("");
  const [ym, setYm] = useState(thisMonth());
  const [f, setF] = useState<Fields>(EMPTY);
  const [existing, setExisting] = useState<StudentReport | null>(null);
  const [stats, setStats] = useState<{ scheduled: number; completed: number; attendance: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingRep, setLoadingRep] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: keyof Fields, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isSupabaseConfigured()) { setStudents([]); return; }
    loadRoster().then(({ rows }) => setStudents(rows));
  }, []);

  const picked = useMemo(() => students?.find((s) => s.student_id === sid) || null, [students, sid]);

  useEffect(() => {
    if (!sid || !ym) { setExisting(null); setStats(null); setF(EMPTY); return; }
    setLoadingRep(true);
    const sb = getSupabase();
    const { start, end } = monthBounds(ym);
    (async () => {
      const [rRes, cRes] = await Promise.all([
        sb.from("student_reports").select("*").eq("student_id", sid).eq("report_month", ym).maybeSingle(),
        sb.from("class_updates").select("class_status,attendance_status,counts_toward_cycle,makeup_required,makeup_completed").eq("student_id", sid).gte("class_date", start).lt("class_date", end),
      ]);
      const rows = (cRes.data as Pick<ClassUpdate, "class_status" | "attendance_status" | "counts_toward_cycle" | "makeup_required" | "makeup_completed">[]) ?? [];
      const st = attendanceStats(rows);
      setStats({ scheduled: rows.length, completed: st.completed, attendance: st.attendancePercent });
      const rep = rRes.data as StudentReport | null;
      setExisting(rep);
      setF(rep ? {
        topics_covered: rep.topics_covered ?? "", skills_improved: rep.skills_improved ?? "", homework_completion: rep.homework_completion ?? "",
        teacher_comments: rep.teacher_comments ?? "", current_goal: rep.current_goal ?? "", goal_outcome: rep.goal_outcome ?? "",
        next_goal: rep.next_goal ?? "", attention_areas: rep.attention_areas ?? "",
      } : EMPTY);
      setLoadingRep(false);
    })();
  }, [sid, ym]);

  async function save(status: "draft" | "submitted") {
    if (!sid) { setToast({ kind: "error", message: "Pick a student." }); return; }
    setBusy(true);
    const { data: u } = await getSupabase().auth.getUser();
    const uid = u.user?.id;
    if (!uid) { setBusy(false); setToast({ kind: "error", message: "Session expired." }); return; }
    const plan = picked ? studentPlan({ plan: null, fee_quoted: picked.fee_quoted }) : null;
    const payload = {
      student_id: sid, teacher_id: uid, report_month: ym,
      plan, instrument: picked?.instrument ?? null,
      classes_scheduled: stats?.scheduled ?? null, classes_completed: stats?.completed ?? null, attendance_percent: stats?.attendance ?? null,
      ...f,
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : existing?.submitted_at ?? null,
    };
    const { error } = await getSupabase().from("student_reports").upsert(payload, { onConflict: "student_id,report_month" });
    setBusy(false);
    if (error) { setToast({ kind: "error", message: error.message }); return; }
    logAudit({ action: AUDIT.REPORT_SUBMITTED, student_id: sid, teacher_id: uid, entity_type: "student_report", summary: `Report ${ym} ${status}` });
    setToast({ kind: "success", message: status === "submitted" ? "Report submitted for review." : "Draft saved." });
    setExisting((prev) => ({ ...(prev ?? {}), ...payload } as StudentReport));
  }

  const published = existing?.status === "published";

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Monthly reports">
      {!students ? <Loading /> : students.length === 0 ? (
        <EmptyState title="No students yet" hint="Add a student before writing a report." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Student</span>
              <select value={sid} onChange={(e) => setSid(e.target.value)} className={SELECT}>
                <option value="">Select…</option>
                {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Month</span>
              <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} className={SELECT} />
            </label>
          </div>

          {sid && (loadingRep ? <Loading /> : (
            <>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-mist p-3 text-center text-xs">
                <div><p className="font-semibold text-ink">{stats?.scheduled ?? 0}</p><p className="text-ink/55">Logged</p></div>
                <div><p className="font-semibold text-ink">{stats?.completed ?? 0}</p><p className="text-ink/55">Completed</p></div>
                <div><p className="font-semibold text-ink">{stats?.attendance ?? 0}%</p><p className="text-ink/55">Attendance</p></div>
              </div>
              {picked && <p className="text-xs text-ink/60">Plan: <b className="text-ink">{PLAN_LABEL[studentPlan({ plan: null, fee_quoted: picked.fee_quoted })]}</b> · Stats auto-filled from class updates.</p>}

              {existing && (
                <div className={cn("rounded-xl px-3 py-2 text-xs font-semibold",
                  published ? "bg-feature-green/12 text-feature-green" : existing.status === "submitted" ? "bg-gold/15 text-[#7A5E0F]" : "bg-ink/5 text-ink/60")}>
                  Status: {existing.status}{published ? " — visible to the family" : ""}
                </div>
              )}

              <TextArea label="Topics covered" value={f.topics_covered} onChange={(v) => set("topics_covered", v)} />
              <TextArea label="Skills improved" value={f.skills_improved} onChange={(v) => set("skills_improved", v)} />
              <TextArea label="Teacher's comments" value={f.teacher_comments} onChange={(v) => set("teacher_comments", v)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextArea label="This month's goal" value={f.current_goal} onChange={(v) => set("current_goal", v)} />
                <TextArea label="Goal outcome" value={f.goal_outcome} onChange={(v) => set("goal_outcome", v)} />
                <TextArea label="Next month's goal" value={f.next_goal} onChange={(v) => set("next_goal", v)} />
                <TextArea label="Areas needing attention" value={f.attention_areas} onChange={(v) => set("attention_areas", v)} />
              </div>
              <TextArea label="Homework completion (e.g. 8/8, mostly done)" value={f.homework_completion} onChange={(v) => set("homework_completion", v)} />

              <div className="flex gap-3">
                <button disabled={busy || published} onClick={() => save("draft")}
                  className="flex-1 rounded-full border border-hairline bg-white py-3 text-sm font-semibold text-ink/80 disabled:opacity-50">
                  Save draft
                </button>
                <button disabled={busy || published} onClick={() => save("submitted")}
                  className="flex-1 rounded-full bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-50">
                  {published ? "Published" : "Submit for review"}
                </button>
              </div>
              <p className="text-xs text-ink/55">Once submitted, the owner reviews and publishes it — then the family can read and print it.</p>
            </>
          ))}
        </div>
      )}
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}

const SELECT = "w-full rounded-xl border border-hairline bg-white px-4 py-3.5 text-base focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
