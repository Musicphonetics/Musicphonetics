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
import { cn } from "@/lib/utils";

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
const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Tap-to-pick durations — no typing. "55–60" stores 60.
const DURATIONS: { v: number; label: string }[] = [
  { v: 30, label: "30 min" },
  { v: 45, label: "45 min" },
  { v: 50, label: "50 min" },
  { v: 60, label: "55–60 min" },
];

function DurationChips({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DURATIONS.map((d) => (
        <button
          key={d.v}
          type="button"
          onClick={() => onChange(d.v)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition",
            value === d.v ? "border-gold bg-gold text-ink shadow-card" : "border-hairline bg-white text-ink/70 hover:border-gold/50",
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

function StudentPicker({ students, sid, onPick }: { students: StudentStat[]; sid: string; onPick: (v: string) => void }) {
  const picked = students.find((s) => s.student_id === sid) || null;
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">Student <span className="text-[#7A5E0F]">*</span></span>
        <select value={sid} onChange={(e) => onPick(e.target.value)}
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
    </div>
  );
}

type Mode = "quick" | "backfill" | "detailed";

export default function ClassUpdatePage() {
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [mode, setMode] = useState<Mode>("quick");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadRoster().then(({ rows }) => setStudents(rows));
  }, []);

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Class Update">
      {!students ? <Loading /> : students.length === 0 ? (
        <EmptyState title="No students yet" hint="Add a student before logging a class." />
      ) : (
        <div className="space-y-5">
          {/* Mode switcher */}
          <div className="grid grid-cols-3 gap-1 rounded-full border border-hairline bg-mist p-1 text-sm font-semibold">
            {([
              ["quick", "Quick"],
              ["backfill", "Backfill"],
              ["detailed", "Detailed"],
            ] as [Mode, string][]).map(([m, label]) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={cn("rounded-full py-2 transition", mode === m ? "bg-white text-ink shadow-card" : "text-ink/55 hover:text-ink")}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-ink/50">
            {mode === "quick" && "Log one class in seconds — date, a tap for duration, and what you taught."}
            {mode === "backfill" && "Add many past classes at once — perfect for entering a student’s attendance for the last few weeks."}
            {mode === "detailed" && "The full record — attendance, homework, responses and internal notes."}
          </p>

          {mode === "quick" && <QuickForm students={students} />}
          {mode === "backfill" && <BackfillForm students={students} />}
          {mode === "detailed" && <DetailedForm students={students} />}
        </div>
      )}
    </PortalShell>
  );
}

/* ------------------------------------------------------------------ */
/* QUICK — one class, tap-based. Present + counts by default.          */
/* ------------------------------------------------------------------ */
function QuickForm({ students }: { students: StudentStat[] }) {
  const [sid, setSid] = useState("");
  const [date, setDate] = useState(today());
  const [duration, setDuration] = useState<number>(50);
  const [present, setPresent] = useState(true);
  const [taught, setTaught] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  async function save() {
    if (!sid) { setToast({ kind: "error", message: "Pick a student." }); return; }
    if (!date) { setToast({ kind: "error", message: "Class date is required." }); return; }
    setBusy(true);
    const { data: u } = await getSupabase().auth.getUser();
    const uid = u.user?.id;
    if (!uid) { setBusy(false); setToast({ kind: "error", message: "Session expired." }); return; }
    const attendance: AttendanceStatus = present ? "present" : "absent";
    const { error } = await getSupabase().from("class_updates").insert({
      teacher_id: uid,
      student_id: sid,
      class_date: date,
      class_status: ATT_TO_LEGACY[attendance],
      attendance_status: attendance,
      counts_toward_cycle: COUNTS_DEFAULT[attendance],
      makeup_required: false,
      makeup_completed: false,
      duration_min: duration,
      taught: taught || null,
      last_modified_by: uid,
    });
    setBusy(false);
    if (error) { setToast({ kind: "error", message: error.message }); return; }
    logAudit({ action: AUDIT.CLASS_LOGGED, student_id: sid, teacher_id: uid, entity_type: "class_update",
      summary: `Quick · ${date} · ${ATTENDANCE_LABEL[attendance]}`, meta: { attendance, duration_min: duration } });
    setToast({ kind: "success", message: "Saved. Ready for the next one." });
    // Keep the student selected for fast repeat entry; clear the rest.
    setTaught("");
    setDate(today());
  }

  return (
    <div className="space-y-4">
      <StudentPicker students={students} sid={sid} onPick={setSid} />
      <Field label="Class date" req type="date" value={date} onChange={setDate} />

      <div>
        <span className="mb-1.5 block text-sm font-semibold text-ink">Duration</span>
        <DurationChips value={duration} onChange={setDuration} />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-semibold text-ink">Did the class happen?</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPresent(true)}
            className={cn("flex-1 rounded-xl border py-3 text-sm font-semibold transition",
              present ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" : "border-hairline bg-white text-ink/60")}>
            ✓ Present
          </button>
          <button type="button" onClick={() => setPresent(false)}
            className={cn("flex-1 rounded-xl border py-3 text-sm font-semibold transition",
              !present ? "border-red-400 bg-red-50 text-red-600" : "border-hairline bg-white text-ink/60")}>
            Absent
          </button>
        </div>
      </div>

      <TextArea label="What was taught" value={taught} onChange={setTaught} placeholder="e.g. G–C–D chord changes, strumming pattern 1" />

      <button disabled={busy} onClick={save}
        className="w-full rounded-full bg-ink py-4 text-base font-semibold text-paper shadow-card disabled:opacity-60">
        {busy ? "Saving…" : "Save & add another"}
      </button>
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BACKFILL — many past classes at once. Date · duration · topic.      */
/* ------------------------------------------------------------------ */
type BackRow = { id: number; date: string; duration: number; taught: string };
const FREQ: { label: string; days: number }[] = [
  { label: "Once a week", days: 7 },
  { label: "Twice a week", days: 3 },
  { label: "Every day", days: 1 },
];

function BackfillForm({ students }: { students: StudentStat[] }) {
  const [sid, setSid] = useState("");
  const [start, setStart] = useState(addDays(today(), -56)); // ~2 months ago
  const [freqIdx, setFreqIdx] = useState(0);
  const [count, setCount] = useState("8");
  const [rows, setRows] = useState<BackRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const nextId = useMemo(() => ({ n: 1 }), []);

  function generate() {
    const n = Math.max(0, Math.min(60, Math.floor(Number(count) || 0)));
    const step = FREQ[freqIdx].days;
    const out: BackRow[] = [];
    for (let i = 0; i < n; i++) {
      out.push({ id: nextId.n++, date: addDays(start, i * step), duration: 50, taught: "" });
    }
    setRows(out);
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const date = last ? addDays(last.date, FREQ[freqIdx].days) : start;
    setRows((p) => [...p, { id: nextId.n++, date, duration: 50, taught: "" }]);
  }

  const upd = (id: number, patch: Partial<BackRow>) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setRows((p) => p.filter((r) => r.id !== id));

  async function save() {
    if (!sid) { setToast({ kind: "error", message: "Pick a student." }); return; }
    const valid = rows.filter((r) => r.date);
    if (valid.length === 0) { setToast({ kind: "error", message: "Add at least one class with a date." }); return; }
    setBusy(true);
    const { data: u } = await getSupabase().auth.getUser();
    const uid = u.user?.id;
    if (!uid) { setBusy(false); setToast({ kind: "error", message: "Session expired." }); return; }
    const picked = students.find((s) => s.student_id === sid);
    const base = (picked?.classes_completed ?? 0);
    // Save oldest first so class numbers read in order.
    const ordered = [...valid].sort((a, b) => a.date.localeCompare(b.date));
    const inserts = ordered.map((r, i) => ({
      teacher_id: uid,
      student_id: sid,
      class_date: r.date,
      class_status: "Completed" as const,
      attendance_status: "present" as AttendanceStatus,
      counts_toward_cycle: true,
      makeup_required: false,
      makeup_completed: false,
      class_number: base + i + 1,
      duration_min: r.duration,
      taught: r.taught || null,
      last_modified_by: uid,
    }));
    const { error } = await getSupabase().from("class_updates").insert(inserts);
    setBusy(false);
    if (error) { setToast({ kind: "error", message: error.message }); return; }
    logAudit({ action: AUDIT.CLASS_LOGGED, student_id: sid, teacher_id: uid, entity_type: "class_update",
      summary: `Backfilled ${inserts.length} classes`, meta: { count: inserts.length } });
    setToast({ kind: "success", message: `Added ${inserts.length} classes to ${picked?.name ?? "the student"}.` });
    setRows([]);
  }

  return (
    <div className="space-y-4">
      <StudentPicker students={students} sid={sid} onPick={setSid} />

      {/* Generator */}
      <div className="space-y-3 rounded-2xl border border-hairline bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-ink">Add several classes fast</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First class was on" type="date" value={start} onChange={setStart} />
          <Field label="How many classes?" inputMode="numeric" value={count} onChange={setCount} />
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink">How often?</span>
          <div className="flex flex-wrap gap-2">
            {FREQ.map((fq, i) => (
              <button key={fq.label} type="button" onClick={() => setFreqIdx(i)}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition",
                  freqIdx === i ? "border-gold bg-gold text-ink" : "border-hairline bg-white text-ink/70 hover:border-gold/50")}>
                {fq.label}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={generate}
          className="w-full rounded-full border border-ink/15 bg-mist py-3 text-sm font-semibold text-ink hover:bg-mist/70">
          Generate {Math.max(0, Math.min(60, Math.floor(Number(count) || 0)))} rows
        </button>
        <p className="text-xs text-ink/45">Dates fill in automatically — just tweak any that differ and write what was taught in each.</p>
      </div>

      {/* Rows */}
      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.id} className="space-y-2.5 rounded-2xl border border-hairline bg-white p-3.5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Class {i + 1}</span>
                <button type="button" onClick={() => remove(r.id)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input type="date" value={r.date} onChange={(e) => upd(r.id, { date: e.target.value })}
                  className="rounded-xl border border-hairline bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
                {DURATIONS.map((d) => (
                  <button key={d.v} type="button" onClick={() => upd(r.id, { duration: d.v })}
                    className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      r.duration === d.v ? "border-gold bg-gold text-ink" : "border-hairline bg-white text-ink/60 hover:border-gold/50")}>
                    {d.label}
                  </button>
                ))}
              </div>
              <input value={r.taught} onChange={(e) => upd(r.id, { taught: e.target.value })}
                placeholder="What was taught in this class…"
                className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
            </div>
          ))}
          <button type="button" onClick={addRow}
            className="w-full rounded-full border border-dashed border-ink/20 py-3 text-sm font-semibold text-ink/70 hover:border-gold/50 hover:text-ink">
            + Add a class
          </button>
        </div>
      )}

      <button disabled={busy || rows.length === 0} onClick={save}
        className="w-full rounded-full bg-ink py-4 text-base font-semibold text-paper shadow-card disabled:opacity-60">
        {busy ? "Saving…" : `Save ${rows.length || ""} ${rows.length === 1 ? "class" : "classes"}`.trim()}
      </button>
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DETAILED — the full record (unchanged behaviour).                   */
/* ------------------------------------------------------------------ */
function DetailedForm({ students }: { students: StudentStat[] }) {
  const router = useRouter();
  const [sid, setSid] = useState("");
  const [attendance, setAttendance] = useState<AttendanceStatus>("present");
  const [counts, setCounts] = useState(true);
  const [makeup, setMakeup] = useState(false);
  const [f, setF] = useState<Record<string, string>>({ class_date: today() });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const picked = useMemo(() => students.find((s) => s.student_id === sid) || null, [students, sid]);

  useEffect(() => {
    if (picked) set("class_number", String((picked.classes_completed ?? 0) + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

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
    <div className="space-y-4">
      <StudentPicker students={students} sid={sid} onPick={setSid} />

      <Field label="Class date" req type="date" value={f.class_date || ""} onChange={(v) => set("class_date", v)} />

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
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink">Duration</span>
          <DurationChips value={f.duration_min ? Number(f.duration_min) : null} onChange={(v) => set("duration_min", String(v))} />
        </div>
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
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </div>
  );
}
