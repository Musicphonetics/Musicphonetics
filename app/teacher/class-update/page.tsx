"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Field, Select, TextArea, Toast, Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { StudentStat } from "@/lib/supabase/types";

const STATUS = ["Completed", "Rescheduled", "Cancelled", "No-Show"];
const today = () => new Date().toISOString().slice(0, 10);

export default function ClassUpdatePage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [sid, setSid] = useState("");
  const [f, setF] = useState<Record<string, string>>({ class_date: today(), class_status: "Completed" });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadRoster().then(({ rows }) => setStudents(rows));
  }, []);

  const picked = useMemo(() => students?.find((s) => s.student_id === sid) || null, [students, sid]);

  // Pre-fill class number = completed + 1 when a student is chosen.
  useEffect(() => {
    if (picked) set("class_number", String((picked.classes_completed ?? 0) + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

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
      class_status: f.class_status || "Completed",
      class_number: f.class_number ? Number(f.class_number) : null,
      duration_min: f.duration_min ? Number(f.duration_min) : null,
      taught: f.taught || null,
      homework: f.homework || null,
      student_response: f.student_response || null,
      parent_feedback: f.parent_feedback || null,
      next_class_date: f.next_class_date || null,
      teacher_notes: f.teacher_notes || null,
    });
    setBusy(false);
    if (error) { setToast({ kind: "error", message: error.message }); return; }
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
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-mist p-3 text-center text-xs">
              <div><p className="font-semibold text-ink">{picked.level || "-"}</p><p className="text-ink/55">Level</p></div>
              <div><p className="font-semibold text-ink">{picked.classes_completed}</p><p className="text-ink/55">Completed</p></div>
              <div><p className="font-semibold text-ink">{picked.classes_remaining}</p><p className="text-ink/55">Remaining</p></div>
            </div>
          )}

          <Field label="Class date" req type="date" value={f.class_date || ""} onChange={(v) => set("class_date", v)} />
          <Select label="Class status" value={f.class_status || "Completed"} onChange={(v) => set("class_status", v)} options={STATUS} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class number" inputMode="numeric" value={f.class_number || ""} onChange={(v) => set("class_number", v)} />
            <Field label="Duration (min)" inputMode="numeric" value={f.duration_min || ""} onChange={(v) => set("duration_min", v)} />
          </div>
          <TextArea label="What was taught" value={f.taught || ""} onChange={(v) => set("taught", v)} />
          <TextArea label="Homework given" value={f.homework || ""} onChange={(v) => set("homework", v)} />
          <TextArea label="Student response" value={f.student_response || ""} onChange={(v) => set("student_response", v)} />
          <TextArea label="Parent feedback / concern" value={f.parent_feedback || ""} onChange={(v) => set("parent_feedback", v)} />
          <Field label="Next class date" type="date" value={f.next_class_date || ""} onChange={(v) => set("next_class_date", v)} />
          <TextArea label="Teacher notes" value={f.teacher_notes || ""} onChange={(v) => set("teacher_notes", v)} />

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
