"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState, formatMoney } from "@/components/portal/kit";
import { ReportCardModal, type ReportStudent } from "@/components/portal/ReportCard";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { StudentStat, ClassUpdate, Payment } from "@/lib/supabase/types";
import { studentPlan, PLAN_LABEL, type Plan } from "@/lib/plan";
import { computeFoundation } from "@/lib/foundation";
import { FoundationCard } from "@/components/portal/FoundationCard";
import { MonthlyPlanEditor } from "@/components/teach/MonthlyPlanEditor";
import { StudentDetailsForm } from "@/components/teach/StudentDetailsForm";
import { cn } from "@/lib/utils";


export default function MyStudents() {
  const [rows, setRows] = useState<StudentStat[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportStudent | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadRoster().then(({ rows, error }) => { setRows(rows); setErr(error); });
  }, []);

  const filtered = (rows ?? []).filter((r) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return [r.name, r.student_code, r.instrument, r.level].filter(Boolean).join(" ").toLowerCase().includes(needle);
  });

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="My Students">
      {err && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load students: {err}
        </div>
      )}
      {!rows ? <Loading /> : rows.length === 0 ? (
        <EmptyState title="No students yet" hint="Add your first student to get started." />
      ) : (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…"
            className="mb-4 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s.student_id} className="overflow-hidden rounded-2xl border border-hairline bg-white">
                <button onClick={() => setOpenId(openId === s.student_id ? null : s.student_id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{s.name}</p>
                    <p className="mt-0.5 text-xs text-ink/60"><span className="font-mono">{s.student_code || "—"}</span> · {s.instrument || "-"} · {s.level || "-"}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      s.status === "active" ? "bg-feature-green/10 text-feature-green" : "bg-mist text-ink/60")}>{s.status}</span>
                    <p className="mt-1 text-xs text-ink/60">{s.classes_completed}/{(s.classes_per_month ?? 0)} classes</p>
                  </div>
                </button>
                {openId === s.student_id && (
                  <StudentDetail
                    stat={s}
                    onReport={() => setReport({ id: s.student_id, name: s.name, instrument: s.instrument, level: s.level, classes_per_month: s.classes_per_month })}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {report && <ReportCardModal student={report} teacherName="" onClose={() => setReport(null)} />}

      <Link href="/teacher/add-student" className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-ink text-2xl text-gold shadow-card-hover">+</Link>
    </PortalShell>
  );
}

const CINP = "rounded-lg border border-hairline bg-white px-2 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

function StudentDetail({ stat, onReport }: { stat: StudentStat; onReport: () => void }) {
  const [classes, setClasses] = useState<ClassUpdate[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [showAdmission, setShowAdmission] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [ev, setEv] = useState<{ class_date: string; class_status: string; taught: string }>({ class_date: "", class_status: "", taught: "" });
  const [clsMsg, setClsMsg] = useState<string | null>(null);

  function startEdit(c: ClassUpdate) {
    setClsMsg(null);
    setEditId(c.id);
    setEv({ class_date: (c.class_date || "").slice(0, 10), class_status: c.class_status || "Completed", taught: c.taught || "" });
  }
  async function saveClass(id: string) {
    const { error } = await getSupabase().from("class_updates")
      .update({ class_date: ev.class_date, class_status: ev.class_status, taught: ev.taught || null }).eq("id", id);
    if (error) { setClsMsg(error.message); return; }
    setClasses((prev) => prev && prev.map((c) => (c.id === id ? { ...c, class_date: ev.class_date, class_status: ev.class_status, taught: ev.taught } as ClassUpdate : c)));
    setEditId(null);
  }
  async function deleteClass(id: string) {
    const { error } = await getSupabase().from("class_updates").delete().eq("id", id);
    if (error) { setClsMsg(error.message); return; }
    setClasses((prev) => prev && prev.filter((c) => c.id !== id));
    setEditId(null);
  }

  useEffect(() => {
    const sb = getSupabase();
    sb.from("class_updates").select("*").eq("student_id", stat.student_id).order("class_date", { ascending: false }).limit(50)
      .then(({ data }) => setClasses((data as ClassUpdate[]) ?? []));
    sb.from("payments").select("*").eq("student_id", stat.student_id).order("payment_date", { ascending: false }).limit(8)
      .then(({ data }) => setPayments((data as Payment[]) ?? []));
  }, [stat.student_id]);

  return (
    <div className="border-t border-hairline bg-paper p-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Mini label="Completed" value={String(stat.classes_completed)} />
        <Mini label="Remaining" value={String(stat.classes_remaining)} />
        <Mini label="Paid" value={formatMoney(stat.total_paid)} />
      </div>
      {stat.classes_remaining <= 2 && stat.status === "active" && (
        <p className="mt-3 rounded-lg bg-gold/15 px-3 py-2 text-xs font-semibold text-[#7A5E0F]">Renewal due - {stat.classes_remaining} classes left.</p>
      )}

      <button onClick={onReport}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-[#0f131c]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Progress report card
      </button>

      {/* Full admission form — the detailed student/parent/demographic record */}
      <button onClick={() => setShowAdmission((v) => !v)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink/30">
        <span>Admission details {showAdmission ? "" : "· tap to fill"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("text-ink/50 transition-transform", showAdmission && "rotate-180")}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {showAdmission && <StudentDetailsForm studentId={stat.student_id} />}

      <GoalEditor studentId={stat.student_id} feeQuoted={stat.fee_quoted} studentName={stat.name} instrument={stat.instrument} level={stat.level} />

      <FoundationTeacherPanel studentId={stat.student_id} instrument={stat.instrument} completed={stat.classes_completed} feeQuoted={stat.fee_quoted} />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/60">Recent classes · tap Edit to fix</p>
      {clsMsg && <p className="mt-1 text-xs text-red-600">{clsMsg}</p>}
      {!classes ? <p className="mt-1 text-xs text-ink/50">Loading…</p> :
        classes.length === 0 ? <p className="mt-1 text-xs text-ink/50">No classes logged yet.</p> : (
        <ul className="mt-2 space-y-1.5">
          {classes.map((c) => (
            <li key={c.id} className="rounded-lg border border-hairline bg-white p-2">
              {editId === c.id ? (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <input type="date" value={ev.class_date} onChange={(e) => setEv({ ...ev, class_date: e.target.value })} className={CINP} />
                    <select value={ev.class_status} onChange={(e) => setEv({ ...ev, class_status: e.target.value })} className={CINP}>
                      {["Completed", "Cancelled", "Absent", "Rescheduled"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <input value={ev.taught} onChange={(e) => setEv({ ...ev, taught: e.target.value })} placeholder="What was covered" className={CINP + " w-full"} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveClass(c.id)} className="rounded-full bg-ink px-4 py-1.5 text-[11px] font-semibold text-paper">Save</button>
                    <button onClick={() => setEditId(null)} className="rounded-full border border-hairline px-4 py-1.5 text-[11px] font-semibold text-ink/70">Cancel</button>
                    <button onClick={() => deleteClass(c.id)} className="ml-auto text-[11px] font-semibold text-red-600">Delete</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="text-ink/75">{c.class_date} · {c.class_status}</span>
                    {c.taught && <span className="ml-2 text-ink/50">{c.taught}</span>}
                  </div>
                  <button onClick={() => startEdit(c)} className="shrink-0 font-semibold text-[#7A5E0F]">Edit</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/60">Recent payments</p>
      {!payments ? <p className="mt-1 text-xs text-ink/50">Loading…</p> :
        payments.length === 0 ? <p className="mt-1 text-xs text-ink/50">No payments yet.</p> : (
        <ul className="mt-2 space-y-1.5">
          {payments.map((p) => (
            <li key={p.id} className="flex justify-between text-xs text-ink/75">
              <span>{p.payment_date} · {p.payment_status}</span>
              <span className="font-semibold">{formatMoney(p.amount_paid)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The student's program (read-only, set by the office) + this month's plan:
// one big goal broken into 8 classes, for EVERY program, with AI drafting. What
// you save here is what the family sees in the portal.
function GoalEditor({ studentId, feeQuoted, studentName, instrument, level }: { studentId: string; feeQuoted: number | null; studentName: string; instrument: string | null; level: string | null }) {
  const [plan, setPlan] = useState<Plan>("foundation");
  const [loaded, setLoaded] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  useEffect(() => {
    getSupabase().from("students").select("plan").eq("id", studentId).single()
      .then(({ data, error }) => {
        if (error) {
          if (/column|does not exist|schema cache/i.test(error.message)) setNeedsMigration(true);
          setPlan(studentPlan({ plan: null, fee_quoted: feeQuoted }));
        } else {
          const row = data as { plan: string | null };
          setPlan(studentPlan({ plan: row?.plan, fee_quoted: feeQuoted }));
        }
        setLoaded(true);
      });
  }, [studentId, feeQuoted]);

  const planTone = { foundation: "bg-gold/15 text-[#7A5E0F]", main: "bg-forest/12 text-forest", directors: "bg-ink/10 text-ink/70" }[plan];

  if (needsMigration) {
    return (
      <div className="mt-4 rounded-xl border border-hairline bg-white p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Program &amp; this month&apos;s plan</p>
        <p className="mt-2 text-xs leading-relaxed text-ink/60">Run <code className="rounded bg-mist px-1">supabase/student_plan_goals.sql</code> once in Supabase to enable monthly plans.</p>
      </div>
    );
  }
  if (!loaded) return <p className="mt-4 text-xs text-ink/50">Loading…</p>;

  return (
    <div className="mt-4">
      {/* Program is READ-ONLY — set by the office at enrolment. */}
      <div className="flex items-center gap-2">
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", planTone)}>{PLAN_LABEL[plan]}</span>
        <span className="text-[10px] uppercase tracking-wide text-ink/40">Set by the office</span>
      </div>
      <MonthlyPlanEditor studentId={studentId} studentName={studentName} instrument={instrument} level={level} plan={plan} />
    </div>
  );
}

// Foundation-only: the operational progress card (derived from completed
// classes) + editors for the learning content the parent/student sees.
const fldCls = "mt-1 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
function FoundationTeacherPanel({ studentId, instrument, completed, feeQuoted }: { studentId: string; instrument: string | null; completed: number; feeQuoted: number | null }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [topic, setTopic] = useState("");
  const [milestone, setMilestone] = useState("");
  const [songs, setSongs] = useState<string[]>([]);
  const [songInput, setSongInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getSupabase().from("students").select("plan,current_topic,next_milestone,repertoire").eq("id", studentId).single()
      .then(({ data }) => {
        const row = data as { plan: string | null; current_topic: string | null; next_milestone: string | null; repertoire: string[] | null } | null;
        setPlan(studentPlan({ plan: row?.plan, fee_quoted: feeQuoted }));
        setTopic(row?.current_topic ?? "");
        setMilestone(row?.next_milestone ?? "");
        setSongs(Array.isArray(row?.repertoire) ? (row!.repertoire as string[]) : []);
        setLoaded(true);
      });
  }, [studentId, feeQuoted]);

  if (!loaded || plan !== "foundation") return null;
  const foundation = computeFoundation(completed, 1, false, false);

  const addSong = () => { const s = songInput.trim(); if (!s) return; setSongs((c) => [...c, s].slice(0, 40)); setSongInput(""); setMsg(null); };
  const removeSong = (i: number) => { setSongs((c) => c.filter((_, idx) => idx !== i)); setMsg(null); };
  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await getSupabase().from("students")
      .update({ current_topic: topic.trim() || null, next_milestone: milestone.trim() || null, repertoire: songs }).eq("id", studentId);
    setBusy(false);
    setMsg(error ? error.message : "Saved. The family sees this in the student portal.");
  }

  return (
    <div className="mt-4">
      <FoundationCard instrument={instrument} foundation={foundation} currentTopic={topic} songs={songs} nextMilestone={milestone} />
      <div className="mt-3 space-y-3 rounded-xl border border-hairline bg-white p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Update learning progress</p>
        <label className="block"><span className="text-xs text-ink/60">Now learning</span>
          <input value={topic} onChange={(e) => { setTopic(e.target.value); setMsg(null); }} placeholder="e.g. Playing with both hands" className={fldCls} /></label>
        <div>
          <span className="text-xs text-ink/60">Songs learned</span>
          {songs.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {songs.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs text-ink">
                  {s}<button type="button" onClick={() => removeSong(i)} className="text-ink/40 hover:text-red-600" aria-label={`Remove ${s}`}>×</button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-1.5 flex gap-2">
            <input value={songInput} onChange={(e) => setSongInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSong(); } }}
              placeholder="Add a song…" className={cn(fldCls, "flex-1")} />
            <button type="button" onClick={addSong} className="mt-1 shrink-0 rounded-lg border border-hairline px-3 text-xs font-semibold text-ink/70">Add</button>
          </div>
        </div>
        <label className="block"><span className="text-xs text-ink/60">Next milestone</span>
          <input value={milestone} onChange={(e) => { setMilestone(e.target.value); setMsg(null); }} placeholder="e.g. Play a complete song for my family" className={fldCls} /></label>
        {msg && <p className={cn("text-xs", msg.startsWith("Saved") ? "font-semibold text-feature-green" : "text-red-600")}>{msg}</p>}
        <button onClick={save} disabled={busy} className="w-full rounded-lg bg-gold py-2 text-sm font-semibold text-charcoal hover:brightness-105 disabled:opacity-50">
          {busy ? "Saving…" : "Save learning progress"}
        </button>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-2.5">
      <p className="font-display text-lg font-semibold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink/55">{label}</p>
    </div>
  );
}
