"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState, formatMoney } from "@/components/portal/kit";
import { ReportCardModal, type ReportStudent } from "@/components/portal/ReportCard";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { StudentStat, ClassUpdate, Payment, SettledChapterJSON } from "@/lib/supabase/types";
import { studentPlan, PLAN_LABEL, type Plan } from "@/lib/plan";
import { computeSetProgress } from "@/lib/fees";
import { chaptersOf, isActiveDate, inChapter, chapterRange } from "@/lib/settlement";
import { computeFoundation } from "@/lib/foundation";
import { FoundationCard } from "@/components/portal/FoundationCard";
import { MonthlyPlanEditor } from "@/components/teach/MonthlyPlanEditor";
import { StudentDetailsForm } from "@/components/teach/StudentDetailsForm";
import { WeeklyScheduleEditor } from "@/components/teach/WeeklyScheduleEditor";
import { StudentClassCycles } from "@/components/teach/StudentClassCycles";
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
                    <p className="mt-0.5 text-xs text-ink/60"><span className="font-mono">{s.student_code || "-"}</span> · {s.instrument || "-"} · {s.level || "-"}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      s.status === "active" ? "bg-feature-green/10 text-feature-green" : "bg-mist text-ink/60")}>{s.status}</span>
                    {(() => {
                      const sp = computeSetProgress(s.classes_completed, s.classes_per_month, s.classes_purchased);
                      return <p className="mt-1 text-xs text-ink/60">{sp.currentDone}/{sp.perSet} · Set {sp.currentSet}{sp.paidSets > 1 ? ` of ${sp.paidSets}` : ""}</p>;
                    })()}
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

type DetailTab = "overview" | "classes" | "payments" | "details";
const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "classes", label: "Classes" },
  { id: "payments", label: "Payments" },
  { id: "details", label: "Details" },
];

function StudentDetail({ stat, onReport }: { stat: StudentStat; onReport: () => void }) {
  const [classes, setClasses] = useState<ClassUpdate[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [tab, setTab] = useState<DetailTab>("overview");
  // Settled chapters (local so the view updates the moment they change).
  const [chapters, setChapters] = useState<SettledChapterJSON[]>(() => chaptersOf(stat));

  useEffect(() => {
    const sb = getSupabase();
    sb.from("class_updates").select("*").eq("student_id", stat.student_id).order("class_date", { ascending: false }).limit(1000)
      .then(({ data }) => setClasses((data as ClassUpdate[]) ?? []));
    sb.from("payments").select("*").eq("student_id", stat.student_id).order("payment_date", { ascending: false }).limit(200)
      .then(({ data }) => setPayments((data as Payment[]) ?? []));
  }, [stat.student_id]);

  // Active = not inside any settled chapter. Each chapter also keeps its own
  // classes & payments, so Guitar and History account separately.
  const activeClasses = (classes ?? []).filter((c) => isActiveDate(c.class_date, chapters));
  const activePays = (payments ?? []).filter((p) => isActiveDate(p.payment_date, chapters));
  const activePaidTotal = activePays.filter((p) => /received/i.test(p.payment_status)).reduce((a, p) => a + (p.amount_paid ?? 0), 0);
  const hasChapters = chapters.length > 0;

  return (
    <div className="border-t border-hairline bg-paper p-4">
      {/* Tabs: classes / details / payments kept separate for a cleaner read. */}
      <div className="mb-4 flex gap-1 rounded-xl bg-ink/[0.05] p-1">
        {DETAIL_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
              tab === t.id ? "bg-white text-ink shadow-card" : "text-ink/55 hover:text-ink")}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <SetProgressCard stat={stat} />
          {hasChapters && <p className="mt-2 text-[11px] text-ink/50">{chapters.length} settled chapter{chapters.length === 1 ? "" : "s"} set aside · progress shown is the current account.</p>}
          <button onClick={onReport}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-[#0f131c]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M9 3h6M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Progress report card
          </button>
          <GoalEditor studentId={stat.student_id} feeQuoted={stat.fee_quoted} studentName={stat.name} instrument={stat.instrument} level={stat.level} />
          <FoundationTeacherPanel studentId={stat.student_id} instrument={stat.instrument} completed={stat.classes_completed} feeQuoted={stat.fee_quoted} />
        </div>
      )}

      {tab === "classes" && (
        <div className="space-y-4">
          <ChaptersEditor studentId={stat.student_id} instrument={stat.instrument} chapters={chapters} onChange={setChapters} />
          {chapters.map((ch, i) => (
            <SettledChapterCard
              key={`${ch.label}-${ch.from}-${ch.to}-${i}`}
              chapter={ch}
              classes={(classes ?? []).filter((c) => inChapter(c.class_date, ch))}
              payments={(payments ?? []).filter((p) => inChapter(p.payment_date, ch))}
            />
          ))}
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">{hasChapters ? "Current account · by cycle" : "Classes by cycle"}</p>
              <span className="text-[11px] text-ink/45">{classes ? `${activeClasses.length} ${hasChapters ? "current" : "logged"}` : ""}</span>
            </div>
            {!classes || !payments ? <p className="text-xs text-ink/50">Loading…</p> : (
              <StudentClassCycles
                classes={activeClasses}
                setClasses={setClasses}
                payments={activePays}
                feeQuoted={stat.fee_quoted}
                classesPerMonth={stat.classes_per_month}
              />
            )}
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Payments · each buys a set of {stat.classes_per_month ?? 8}</p>
          {!payments ? <p className="mt-2 text-xs text-ink/50">Loading…</p> :
            payments.length === 0 ? <p className="mt-2 text-xs text-ink/50">No payments yet.</p> : (
            <>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-hairline bg-white px-3.5 py-3">
                <span className="text-xs text-ink/60">{hasChapters ? "Received · current account" : "Total received"}</span>
                <span className="font-display text-lg font-bold text-ink">{formatMoney(hasChapters ? activePaidTotal : stat.total_paid)}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {activePays.map((p) => {
                  const per = (stat.fee_quoted ?? 0) > 0 ? Math.round((Number(p.amount_paid) / (stat.fee_quoted as number)) * (stat.classes_per_month ?? 8)) : null;
                  return (
                    <li key={p.id} className="flex items-center justify-between rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-ink/75">
                      <span>{p.payment_date} · <span className={cn(p.payment_status === "Received" ? "text-emerald-600" : "text-ink/50")}>{p.payment_status}</span></span>
                      <span className="flex items-center gap-2">
                        {per ? <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">+{per} classes</span> : null}
                        <span className="font-semibold text-ink">{formatMoney(p.amount_paid)}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              {chapters.map((ch, i) => {
                const chapPays = (payments ?? []).filter((p) => inChapter(p.payment_date, ch));
                if (chapPays.length === 0 && ch.amount == null) return null;
                const rows = chapPays.filter((p) => /received/i.test(p.payment_status)).reduce((a, p) => a + (p.amount_paid ?? 0), 0);
                const total = ch.amount != null ? ch.amount : rows;
                return (
                  <div key={`p-${ch.label}-${i}`} className="mt-4">
                    <p className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-ink/45">
                      <span>{ch.label} · {chapterRange(ch)} · settled</span>
                      <span>{formatMoney(total)}</span>
                    </p>
                    {chapPays.length > 0 && (
                      <ul className="mt-2 space-y-1.5 opacity-80">
                        {chapPays.map((p) => (
                          <li key={p.id} className="flex items-center justify-between rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-ink/70">
                            <span>{p.payment_date} · {p.payment_status}</span>
                            <span className="font-semibold text-ink">{formatMoney(p.amount_paid)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {tab === "details" && (
        <div>
          {/* Admission details, shows a saved summary with a small Edit button. */}
          <StudentDetailsForm studentId={stat.student_id} />
          {/* Recurring weekly schedule, fills the calendar and drives the planner. */}
          <div className="mt-4">
            <WeeklyScheduleEditor
              studentId={stat.student_id}
              initialSlots={stat.weekly_slots}
              initialTarget={stat.weekly_target}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// The set-progress summary card (how far into the current paid set of 8).
function SetProgressCard({ stat }: { stat: StudentStat }) {
  const sp = computeSetProgress(stat.classes_completed, stat.classes_per_month, stat.classes_purchased);
  const advanceSets = Math.max(0, sp.paidSets - sp.currentSet);
  const pct = Math.round((sp.currentDone / sp.perSet) * 100);
  // Classes taught but nothing paid for the current account → fee due now.
  const unpaid = stat.status === "active" && (stat.total_paid ?? 0) <= 0 && stat.classes_completed > 0;
  const fee = stat.fee_quoted ?? 0;
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold leading-none text-ink">{sp.currentDone}<span className="text-xl text-ink/35">/{sp.perSet}</span></span>
          <span className="text-sm text-ink/55">this set</span>
        </div>
        {unpaid
          ? <span className="rounded-full bg-red-500/12 px-3 py-1 text-[11px] font-semibold text-red-600">Fee due</span>
          : sp.allComplete
            ? <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink">Renewal due</span>
            : sp.remainingInSet <= 2
              ? <span className="rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold text-[#7A5E0F]">Renew soon</span>
              : <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[11px] font-semibold text-emerald-700">On track</span>}
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.07]">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-[#C6A02E] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-ink/60">
        {unpaid
          ? <><b className="text-red-600">{fee > 0 ? `${formatMoney(fee)} due` : "Fee due"}</b> · {sp.currentDone} class{sp.currentDone === 1 ? "" : "es"} taught, no payment recorded yet. Record it when received.</>
          : sp.allComplete
            ? <>All paid classes complete, record a payment to start the next set.</>
            : <><b className="text-ink">{sp.remainingInSet}</b> class{sp.remainingInSet === 1 ? "" : "es"} left in this set · {formatMoney(stat.total_paid)} paid</>}
      </p>

      {advanceSets > 0 && (
        <p className="mt-2.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700">
          ✓ Advance paid, next {advanceSets * sp.perSet} classes already covered
        </p>
      )}
      {sp.completedSets > 0 && (
        <p className="mt-2.5 text-[11px] text-ink/45">{sp.completedSets} earlier set{sp.completedSets === 1 ? "" : "s"} of {sp.perSet} completed</p>
      )}
    </div>
  );
}

// Settled chapters editor: carve the timeline into labelled, dated chapters
// (e.g. a History stretch between two Guitar stretches). Each chapter's classes
// & payments account on their own; the rest is the current, active account.
function ChaptersEditor({ studentId, instrument, chapters, onChange }: {
  studentId: string; instrument: string | null; chapters: SettledChapterJSON[];
  onChange: (next: SettledChapterJSON[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("History");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isMissing = (m: string) => /settlements/i.test(m) && /(column|does not exist|schema cache)/i.test(m);
  const suggestions = Array.from(new Set([instrument?.trim() || "Music", "History"]));

  async function persist(next: SettledChapterJSON[]) {
    setBusy(true); setMsg(null);
    const { error } = await getSupabase().from("students").update({ settlements: next }).eq("id", studentId);
    setBusy(false);
    if (error) { setMsg(isMissing(error.message) ? "Run supabase/class_subject_and_settlement.sql once in Supabase to enable settled chapters." : error.message); return false; }
    onChange(next);
    return true;
  }

  async function add() {
    if (!from && !to) { setMsg("Pick a start and/or finish date."); return; }
    const amt = amount ? Number(amount) : null;
    const next = [...chapters, { label: label.trim() || "Settled", from: from || null, to: to || null, amount: amt, note: note.trim() || null }]
      .sort((a, b) => (a.from || a.to || "").localeCompare(b.from || b.to || ""));
    if (await persist(next)) { setAdding(false); setFrom(""); setTo(""); setAmount(""); setNote(""); setLabel("History"); }
  }
  async function remove(i: number) {
    await persist(chapters.filter((_, idx) => idx !== i));
  }

  const cin = "w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Settled chapters</p>
        {!adding && <button onClick={() => setAdding(true)} className="text-xs font-semibold text-[#7A5E0F]">+ Add a chapter</button>}
      </div>
      <p className="mt-0.5 text-xs text-ink/55">Carve out a dated stretch on a different subject/fee (e.g. History). Its classes &amp; payments account on their own; the rest stays the current account.</p>

      {chapters.length > 0 && (
        <ul className="mt-3 space-y-2">
          {chapters.map((ch, i) => (
            <li key={`${ch.label}-${ch.from}-${ch.to}-${i}`} className="flex items-center justify-between gap-2 rounded-xl border border-hairline bg-mist/40 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{ch.label} <span className="font-normal text-ink/55">· {chapterRange(ch)}</span></p>
                <p className="mt-0.5 text-xs text-ink/55">{ch.amount != null ? `${formatMoney(ch.amount)} settled` : "settled"}{ch.note ? ` · ${ch.note}` : ""}</p>
              </div>
              <button onClick={() => remove(i)} disabled={busy} className="shrink-0 text-xs font-semibold text-red-600">Remove</button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="mt-3 space-y-3 rounded-xl border border-gold/40 bg-white p-3">
          <div>
            <span className="text-xs font-medium text-ink/60">Subject / label</span>
            <div className="mt-1.5 mb-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => setLabel(s)}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    label === s ? "border-gold bg-gold text-ink" : "border-hairline bg-white text-ink/70 hover:border-gold/50")}>{s}</button>
              ))}
            </div>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. History" className={cin} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-medium text-ink/60">Started on</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={cn(cin, "mt-1")} /></label>
            <label className="block"><span className="text-xs font-medium text-ink/60">Finished on</span>
              <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={cn(cin, "mt-1")} /></label>
          </div>
          <label className="block"><span className="text-xs font-medium text-ink/60">Amount settled for this period (₹)</span>
            <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 24000" className={cn(cin, "mt-1")} /></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional) — e.g. 8k + 16k, full SST prep, settled in person" className={cin} />
          {msg && <p className="text-xs text-red-600">{msg}</p>}
          <div className="flex gap-2">
            <button onClick={add} disabled={busy} className="flex-1 rounded-full bg-gold py-2.5 text-sm font-semibold text-ink hover:brightness-105 disabled:opacity-50">{busy ? "Saving…" : "Add chapter"}</button>
            <button onClick={() => { setAdding(false); setMsg(null); }} className="rounded-full border border-hairline px-4 py-2.5 text-sm font-semibold text-ink/70">Cancel</button>
          </div>
        </div>
      )}
      {!adding && msg && <p className="mt-2 text-xs text-red-600">{msg}</p>}
    </div>
  );
}

const shortDay = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// A quiet, collapsible summary of one settled chapter (its classes & payments).
function SettledChapterCard({ chapter, classes, payments }: { chapter: SettledChapterJSON; classes: ClassUpdate[]; payments: Payment[] }) {
  const [open, setOpen] = useState(false);
  const done = classes.filter((c) => c.class_status === "Completed").length;
  const rowsReceived = payments.filter((p) => /received/i.test(p.payment_status)).reduce((a, p) => a + (p.amount_paid ?? 0), 0);
  const settled = chapter.amount != null ? chapter.amount : rowsReceived;
  if (classes.length === 0 && payments.length === 0 && chapter.amount == null) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-mist/40">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink/80">{chapter.label} · {chapterRange(chapter)}</p>
          <p className="mt-0.5 text-xs text-ink/55">{settled > 0 ? `${formatMoney(settled)} settled` : "settled"}{done > 0 ? ` · ${done} classes` : ""}{chapter.note ? ` · ${chapter.note}` : ""}</p>
        </div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("shrink-0 text-ink/40 transition-transform", open && "rotate-180")}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="border-t border-hairline bg-white/60">
          {payments.length > 0 && (
            <ul className="divide-y divide-hairline/60">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2 text-xs text-ink/70">
                  <span>Payment · {shortDay(p.payment_date)} · {p.payment_status}</span>
                  <span className="font-semibold text-ink">{formatMoney(p.amount_paid)}</span>
                </li>
              ))}
            </ul>
          )}
          {classes.length > 0 && (
            <ul className="divide-y divide-hairline/60 border-t border-hairline/60">
              {classes.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-2 text-xs text-ink/70">
                  <span>{shortDay(c.class_date)} · {c.class_status}{c.subject ? ` · ${c.subject}` : ""}</span>
                  {c.taught && <span className="truncate text-ink/45">{c.taught}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}


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
      {/* Program is READ-ONLY, set by the office at enrolment. */}
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

