"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Field, TextArea, Toast, Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { StudentStat } from "@/lib/supabase/types";
import type { AttendanceStatus, ClassUpdate } from "@/lib/supabase/types";
import { ATTENDANCE_LABEL } from "@/lib/attendance";
import { logAudit, AUDIT } from "@/lib/audit";
import { studentCode } from "@/lib/students";

// Attendance is the primary field; class_status is kept in sync for legacy reads.
const ATT_OPTIONS: AttendanceStatus[] = [
  "present", "absent", "cancelled_by_parent", "cancelled_by_teacher", "rescheduled", "no_show", "holiday",
];
const ATT_TO_LEGACY: Record<AttendanceStatus, ClassUpdate["class_status"]> = {
  scheduled: "Rescheduled", present: "Completed", absent: "No-Show",
  cancelled_by_parent: "Cancelled", cancelled_by_teacher: "Cancelled",
  rescheduled: "Rescheduled", holiday: "Cancelled", no_show: "No-Show",
};
const COUNTS_DEFAULT: Record<AttendanceStatus, boolean> = {
  scheduled: false, present: true, absent: true, cancelled_by_parent: false,
  cancelled_by_teacher: false, rescheduled: false, holiday: false, no_show: true,
};
const MAKEUP_DEFAULT: Record<AttendanceStatus, boolean> = {
  scheduled: false, present: false, absent: false, cancelled_by_parent: false,
  cancelled_by_teacher: true, rescheduled: true, holiday: false, no_show: false,
};

const today = () => new Date().toISOString().slice(0, 10);

export default function ClassUpdatePage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [sid, setSid] = useState("");
  const [attendance, setAttendance] = useState<AttendanceStatus>("present");
  const [counts, setCounts] = useState(true);
  const [makeup, setMakeup] = useState(false);
  const [f, setF] = useState<Record<string, string>>({ class_date: today() });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadRoster().then(({ rows }) => setStudents(rows));
  }, []);

  const picked = useMemo(() => students?.find((s) => s.student_id === sid) || null, [students, sid]);

  useEffect(() => {
    if (picked) set("class_number", String((picked.classes_completed ?? 0) + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  // Sensible defaults when attendance changes; teacher can still override.
  useEffect(() => {
    setCounts(COUNTS_DEFAULT[attendance]);
    setMakeup(MAKEUP_DEFAULT[attendance]);
  }, [attendance]);

  const cancelledOrMoved = ["absent", "cancelled_by_parent", "cancelled_by_teacher", "rescheduled", "no_show", "holiday"].includes(attendance);

  async function save() {
    if (!sid) { setToast({ kind: "error", message: "Pick a student." }); return; }
    if (!f.class_date) { setToast({ kind: "error", message: "Class date is required." }); return; }
    setBusy(true);
    const { data: u } = await getSupabase().auth.getUser();
    const uid = u.user?.id;
    if (!uid) { setBusy(false); setToast({ kind: "error", message: "Session expired." }); return; }
    const { error } = await getSupabase().from("class_updates").insert({
      teacher_id: uid,
      student_id: sid,
      class_date: f.class_date,
      class_status: ATT_TO_LEGACY[attendance],
      attendance_status: attendance,
      counts_toward_cycle: counts,
      makeup_required: makeup,
      makeup_completed: false,
      rescheduled_to: attendance === "rescheduled" && f.rescheduled_to ? f.rescheduled_to : null,
      class_number: f.class_number ? Number(f.class_number) : null,
      duration_min: f.duration_min ? Number(f.duration_min) : null,
      taught: f.taught || null,
      homework: f.homework || null,
      student_response: f.student_response || null,
      parent_feedback: f.parent_feedback || null,
      parent_reason: cancelledOrMoved ? (f.parent_reason || null) : null,
      next_class_date: f.next_class_date || null,
      teacher_notes: f.teacher_notes || null,
      last_modified_by: uid,
    });
    setBusy(false);
    if (error) { setToast({ kind: "error", message: error.message }); return; }
    logAudit({ action: AUDIT.CLASS_LOGGED, student_id: sid, teacher_id: uid, entity_type: "class_update",
      summary: `Class ${f.class_date} · ${ATTENDANCE_LABEL[attendance]}`, meta: { attendance, counts_toward_cycle: counts, makeup } });
    setToast({ kind: "success", message: "Class update saved." });
    setTimeout(() => router.push("/teacher/dashboard"), 700);
  }

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Class Update">
      {!students ? <Loading /> : students.length === 0 ? (
        <EmptyState title="No students yet" hint="Add a student before logging a class." />
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Student <span className="text-[#7A5E0F]">*</span></span>
            <select value={sid} onChange={(e) => setSid(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3.5 text-base focus-visible:outline-2 focus-visible:outline-gold focus:outline-none">
              <option value="">Select a student…</option>
              {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name} · {s.instrument || "-"}</option>)}
            </select>
          </label>

          {picked && (
            <div className="grid grid-cols-4 gap-2 rounded-xl bg-mist p-3 text-center text-xs">
              <div><p className="font-semibold text-ink">{studentCode(picked)}</p><p className="text-ink/55">Code</p></div>
              <div><p className="font-semibold text-ink">{picked.level || "-"}</p><p className="text-ink/55">Level</p></div>
              <div><p className="font-semibold text-ink">{picked.classes_completed}</p><p className="text-ink/55">Completed</p></div>
              <div><p className="font-semibold text-ink">{picked.classes_remaining}</p><p className="text-ink/55">Remaining</p></div>
            </div>
          )}

          <Field label="Class date" req type="date" value={f.class_date || ""} onChange={(v) => set("class_date", v)} />

          {/* Attendance */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Attendance <span className="text-[#7A5E0F]">*</span></span>
            <select value={attendance} onChange={(e) => setAttendance(e.target.value as AttendanceStatus)}
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3.5 text-base focus-visible:outline-2 focus-visible:outline-gold focus:outline-none">
              {ATT_OPTIONS.map((a) => <option key={a} value={a}>{ATTENDANCE_LABEL[a]}</option>)}
            </select>
          </label>

          {attendance === "rescheduled" && (
            <Field label="Rescheduled to" type="date" value={f.rescheduled_to || ""} onChange={(v) => set("rescheduled_to", v)} />
          )}

          <div className="flex flex-col gap-2 rounded-xl border border-hairline bg-white p-3.5">
            <label className="flex items-center gap-2.5 text-sm text-ink/80">
              <input type="checkbox" checked={counts} onChange={(e) => setCounts(e.target.checked)} className="h-4 w-4 accent-gold" />
              Counts toward the paid cycle (and Foundation progress)
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink/80">
              <input type="checkbox" checked={makeup} onChange={(e) => setMakeup(e.target.checked)} className="h-4 w-4 accent-gold" />
              A make-up class is required
            </label>
          </div>

          {cancelledOrMoved && (
            <TextArea label="Reason (visible to the family)" value={f.parent_reason || ""} onChange={(v) => set("parent_reason", v)} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Class number" inputMode="numeric" value={f.class_number || ""} onChange={(v) => set("class_number", v)} />
            <Field label="Duration (min)" inputMode="numeric" value={f.duration_min || ""} onChange={(v) => set("duration_min", v)} />
          </div>
          <TextArea label="What was taught" value={f.taught || ""} onChange={(v) => set("taught", v)} />
          <TextArea label="Homework given" value={f.homework || ""} onChange={(v) => set("homework", v)} />
          <TextArea label="Student response" value={f.student_response || ""} onChange={(v) => set("student_response", v)} />
          <TextArea label="Parent feedback / concern" value={f.parent_feedback || ""} onChange={(v) => set("parent_feedback", v)} />
          <Field label="Next class date" type="date" value={f.next_class_date || ""} onChange={(v) => set("next_class_date", v)} />
          <TextArea label="Teacher notes (internal)" value={f.teacher_notes || ""} onChange={(v) => set("teacher_notes", v)} />

          <button disabled={busy} onClick={save}
            className="w-full rounded-full bg-ink py-4 text-base font-semibold text-paper shadow-card disabled:opacity-60">
            {busy ? "Saving…" : "Save class update"}
          </button>
        </div>
      )}
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}
