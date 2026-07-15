"use client";

import { useEffect, useState } from "react";
import { loadOwnerData } from "@/lib/supabase/owner";
import { sendNotifications } from "@/lib/notify";
import { logAudit, AUDIT } from "@/lib/audit";
import { cn } from "@/lib/utils";

type Audience = "all_parents" | "all_teachers" | "one_teacher" | "one_family";

interface StudentOpt { id: string; name: string; parent_id: string | null; code: string | null }
interface TeacherOpt { id: string; name: string }

const SELECT = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

// Owner sends an in-app notification (the bell feed). Complements the pinned
// Director's message above — this reaches parents/teachers as a dismissable alert.
export function OwnerNotifyCard() {
  const [students, setStudents] = useState<StudentOpt[]>([]);
  const [teachers, setTeachers] = useState<TeacherOpt[]>([]);
  const [audience, setAudience] = useState<Audience>("all_parents");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mustAck, setMustAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    loadOwnerData().then((d) => {
      setStudents(d.students.map((s) => ({ id: s.id, name: s.name, parent_id: s.parent_id ?? null, code: s.student_code ?? null })));
      setTeachers(d.teachers.map((t) => ({ id: t.id, name: t.full_name || "Unnamed teacher" })));
    });
  }, []);

  async function send() {
    if (!title.trim() && !body.trim()) { setNote("Write a title or message first."); return; }
    setBusy(true); setNote(null);

    let recipients: string[] = [];
    if (audience === "all_parents") recipients = [...new Set(students.map((s) => s.parent_id).filter(Boolean) as string[])];
    else if (audience === "all_teachers") recipients = teachers.map((t) => t.id);
    else if (audience === "one_teacher") recipients = teacherId ? [teacherId] : [];
    else if (audience === "one_family") { const s = students.find((x) => x.id === studentId); recipients = s?.parent_id ? [s.parent_id] : []; }

    if (recipients.length === 0) { setBusy(false); setNote("No recipients found for that choice."); return; }

    const role = audience === "all_teachers" || audience === "one_teacher" ? "teacher" : "parent";
    const res = await sendNotifications(recipients.map((rid) => ({
      recipient_id: rid,
      role: role as "teacher" | "parent",
      type: mustAck ? "director_message" : "general_announcement",
      title: title.trim() || "A message from Musicphonetics",
      body: body.trim() || null,
      must_ack: mustAck,
    })));
    setBusy(false);
    if (!res.ok) { setNote(res.error || "Could not send."); return; }
    logAudit({ action: AUDIT.NOTIFICATION_SENT, entity_type: "notification", summary: `Notified ${recipients.length} (${audience})`, meta: { audience, count: recipients.length, must_ack: mustAck } });
    setTitle(""); setBody(""); setMustAck(false);
    setNote(`Sent to ${recipients.length} ${recipients.length === 1 ? "recipient" : "recipients"} ✓`);
  }

  const AUD: { key: Audience; label: string }[] = [
    { key: "all_parents", label: "All families" },
    { key: "all_teachers", label: "All teachers" },
    { key: "one_family", label: "One family" },
    { key: "one_teacher", label: "One teacher" },
  ];

  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
      <p className="font-display text-lg font-semibold text-ink">Send a notification</p>
      <p className="mt-0.5 text-sm text-ink/60">Appears in the recipient&apos;s notification bell. Tick &ldquo;must acknowledge&rdquo; for important alerts.</p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AUD.map((a) => (
          <button key={a.key} type="button" onClick={() => { setAudience(a.key); setNote(null); }}
            className={cn("rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              audience === a.key ? "border-gold bg-gold/10 text-ink" : "border-hairline text-ink/70 hover:border-ink/30")}>
            {a.label}
          </button>
        ))}
      </div>

      {audience === "one_family" && (
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Family (student)</span>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={SELECT}>
            <option value="">Select a student…</option>
            {students.map((s) => <option key={s.id} value={s.id} disabled={!s.parent_id}>{s.name}{s.code ? ` · ${s.code}` : ""}{!s.parent_id ? " (no login yet)" : ""}</option>)}
          </select>
        </label>
      )}
      {audience === "one_teacher" && (
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Teacher</span>
          <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={SELECT}>
            <option value="">Select a teacher…</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      )}

      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Title" className={cn(SELECT, "mt-3")} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={1000} placeholder="Message (optional)" className={cn(SELECT, "mt-3")} />

      <label className="mt-3 flex items-center gap-2.5 text-sm text-ink/80">
        <input type="checkbox" checked={mustAck} onChange={(e) => setMustAck(e.target.checked)} className="h-4 w-4 accent-gold" />
        Must acknowledge (marks it important)
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={send} disabled={busy} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60">
          {busy ? "Sending…" : "Send notification"}
        </button>
        {note && <span className="text-sm text-ink/70">{note}</span>}
      </div>
    </div>
  );
}
