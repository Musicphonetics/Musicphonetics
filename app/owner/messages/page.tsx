"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  loadDirectorMessages, saveDirectorMessage, setDirectorMessagePublished, deleteDirectorMessage,
  loadRecipients, type DirectorMessage, type DirectorAudience, type Recipient,
} from "@/lib/supabase/director";
import { cn } from "@/lib/utils";

type Mode = "announce" | "student" | "teacher";
const pretty = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function OwnerMessages() {
  const [rows, setRows] = useState<DirectorMessage[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [people, setPeople] = useState<{ students: Recipient[]; teachers: Recipient[] }>({ students: [], teachers: [] });

  const [mode, setMode] = useState<Mode>("announce");
  const [audience, setAudience] = useState<DirectorAudience>("parents"); // for announce mode
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function refresh() {
    const { rows, error } = await loadDirectorMessages();
    setRows(rows); setErr(error);
  }
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    refresh();
    loadRecipients().then(setPeople);
  }, []);

  const nameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of people.students) m["s:" + s.id] = s.name;
    for (const t of people.teachers) m["t:" + t.id] = t.name;
    return m;
  }, [people]);

  async function publish() {
    if (!body.trim()) { setNote("Write a message first."); return; }
    if (mode === "student" && !studentId) { setNote("Pick a student."); return; }
    if (mode === "teacher" && !teacherId) { setNote("Pick a teacher."); return; }
    setBusy(true); setNote(null);
    const payload =
      mode === "student" ? { audience: "parents" as DirectorAudience, title, body, target_student_id: studentId } :
      mode === "teacher" ? { audience: "teachers" as DirectorAudience, title, body, target_teacher_id: teacherId } :
      { audience, title, body };
    const { error } = await saveDirectorMessage(payload);
    setBusy(false);
    if (error) { setNote(error.message); return; }
    setTitle(""); setBody(""); setNote("Message sent ✓");
    refresh();
  }
  const toggle = async (m: DirectorMessage) => { await setDirectorMessagePublished(m.id, !m.is_published); refresh(); };
  const remove = async (id: string) => { await deleteDirectorMessage(id); refresh(); };

  function targetLabel(m: DirectorMessage) {
    if (m.target_student_id) return `To ${nameById["s:" + m.target_student_id] || "a student"}'s parent`;
    if (m.target_teacher_id) return `To ${nameById["t:" + m.target_teacher_id] || "a teacher"}`;
    return m.audience === "all" ? "Everyone" : m.audience === "teachers" ? "All teachers" : "All parents";
  }

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Director's messages">
      <p className="-mt-2 mb-5 max-w-2xl text-sm text-ink/60">
        Write a personal note to one student&apos;s parent or to one teacher, or a broadcast to
        everyone. It appears at the top of their portal, signed by you.
      </p>

      {/* Composer */}
      <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">Send to</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {([
            { key: "student", label: "A specific student", hint: "Only their parent sees it" },
            { key: "teacher", label: "A specific teacher", hint: "Only that teacher sees it" },
            { key: "announce", label: "Announcement", hint: "Everyone / all parents / all teachers" },
          ] as { key: Mode; label: string; hint: string }[]).map((o) => (
            <button key={o.key} type="button" onClick={() => { setMode(o.key); setNote(null); }}
              className={cn("rounded-xl border p-3 text-left transition-colors",
                mode === o.key ? "border-gold bg-gold/10" : "border-hairline hover:border-ink/30")}>
              <span className="block text-sm font-semibold text-ink">{o.label}</span>
              <span className="block text-xs text-ink/55">{o.hint}</span>
            </button>
          ))}
        </div>

        {/* recipient picker */}
        {mode === "student" && (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Student</span>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={SELECT}>
              <option value="">Select a student…</option>
              {people.students.map((s) => <option key={s.id} value={s.id}>{s.name}{s.sub ? `, ${s.sub}` : ""}</option>)}
            </select>
            {people.students.length === 0 && <span className="mt-1 block text-xs text-ink/50">No students found yet.</span>}
          </label>
        )}
        {mode === "teacher" && (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Teacher</span>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={SELECT}>
              <option value="">Select a teacher…</option>
              {people.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {people.teachers.length === 0 && <span className="mt-1 block text-xs text-ink/50">No teachers found yet.</span>}
          </label>
        )}
        {mode === "announce" && (
          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Audience</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {([
                { key: "parents", label: "All parents & students" },
                { key: "teachers", label: "All teachers" },
                { key: "all", label: "Everyone" },
              ] as { key: DirectorAudience; label: string }[]).map((a) => (
                <button key={a.key} type="button" onClick={() => setAudience(a.key)}
                  className={cn("rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    audience === a.key ? "border-gold bg-gold/10 text-ink" : "border-hairline text-ink/70 hover:border-ink/30")}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Title <span className="font-normal text-ink/45">(optional)</span></span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            placeholder="e.g. Well done this month · Fees reminder · A quick word" className={SELECT} />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Your message</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5}
            placeholder="Write from the heart. Press Enter for a new paragraph." className={SELECT} />
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={publish} disabled={busy}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60">
            {busy ? "Sending…" : "Send message"}
          </button>
          {note && <span className="text-sm text-ink/70">{note}</span>}
        </div>
      </div>

      {/* Existing */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Sent messages</p>
        {err && <div className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}, have you run the director_messages.sql migration?</div>}
        {!rows ? <Loading /> : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hairline bg-paper p-6 text-sm text-ink/55">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((m) => (
              <div key={m.id} className="rounded-2xl border border-hairline bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    m.target_teacher_id ? "bg-gold/15 text-[#7A5E0F]"
                      : m.target_student_id ? "bg-feature-green/15 text-feature-green"
                      : "bg-ink/10 text-ink/70")}>
                    {targetLabel(m)}
                  </span>
                  <span className="text-xs text-ink/50">{pretty(m.created_at)}</span>
                  {!m.is_published && <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/50">Hidden</span>}
                </div>
                {m.title && <p className="mt-2 font-display text-base font-semibold text-ink">{m.title}</p>}
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink/75">{m.body}</p>
                <div className="mt-3 flex gap-4 text-sm font-semibold">
                  <button onClick={() => toggle(m)} className="text-[#7A5E0F] hover:underline">{m.is_published ? "Hide" : "Publish"}</button>
                  <button onClick={() => remove(m.id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

const SELECT = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
