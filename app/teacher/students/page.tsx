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
import { cn } from "@/lib/utils";

const PLANS: Plan[] = ["foundation", "main", "directors"];

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

  const filtered = (rows ?? []).filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

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
                    <p className="mt-0.5 text-xs text-ink/60">{s.instrument || "-"} · {s.level || "-"}</p>
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

function StudentDetail({ stat, onReport }: { stat: StudentStat; onReport: () => void }) {
  const [classes, setClasses] = useState<ClassUpdate[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    sb.from("class_updates").select("*").eq("student_id", stat.student_id).order("class_date", { ascending: false }).limit(8)
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

      <GoalEditor studentId={stat.student_id} feeQuoted={stat.fee_quoted} />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/60">Recent classes</p>
      {!classes ? <p className="mt-1 text-xs text-ink/50">Loading…</p> :
        classes.length === 0 ? <p className="mt-1 text-xs text-ink/50">No classes logged yet.</p> : (
        <ul className="mt-2 space-y-1.5">
          {classes.map((c) => (
            <li key={c.id} className="flex justify-between text-xs text-ink/75">
              <span>{c.class_date} · {c.class_status}</span>
              <span className="truncate pl-2 text-ink/55">{c.taught || ""}</span>
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

// Set the student's plan (batch) and this month's goal. Foundation shows the
// curriculum progress bar; Foundation + Main show this goal; Director's Circle
// shows neither. What you save here is what the family sees in the portal.
function GoalEditor({ studentId, feeQuoted }: { studentId: string; feeQuoted: number | null }) {
  const [plan, setPlan] = useState<Plan>("foundation");
  const [goal, setGoal] = useState("");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loaded, setLoaded] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getSupabase().from("students").select("plan,monthly_goal,goal_month").eq("id", studentId).single()
      .then(({ data, error }) => {
        if (error) {
          if (/column|does not exist|schema cache/i.test(error.message)) setNeedsMigration(true);
          setPlan(studentPlan({ plan: null, fee_quoted: feeQuoted }));
        } else {
          const row = data as { plan: string | null; monthly_goal: string | null; goal_month: string | null };
          setPlan(studentPlan({ plan: row?.plan, fee_quoted: feeQuoted }));
          if (row?.monthly_goal) setGoal(row.monthly_goal);
          if (row?.goal_month) setMonth(row.goal_month);
        }
        setLoaded(true);
      });
  }, [studentId, feeQuoted]);

  async function save() {
    setBusy(true); setErr(null); setMsg(null);
    const payload: Record<string, unknown> = { plan, goal_set_at: new Date().toISOString() };
    if (plan === "directors") { payload.monthly_goal = null; payload.goal_month = null; }
    else { payload.monthly_goal = goal.trim() || null; payload.goal_month = month; }
    const { error } = await getSupabase().from("students").update(payload).eq("id", studentId);
    setBusy(false);
    if (error) {
      if (/column|does not exist|schema cache/i.test(error.message)) { setNeedsMigration(true); setErr(null); }
      else setErr(error.message);
    } else setMsg("Saved. The family sees this in the student portal.");
  }

  return (
    <div className="mt-4 rounded-xl border border-hairline bg-white p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Plan &amp; this month&apos;s goal</p>
      {needsMigration ? (
        <p className="mt-2 text-xs leading-relaxed text-ink/60">Run <code className="rounded bg-mist px-1">supabase/student_plan_goals.sql</code> once in Supabase to enable plans &amp; monthly goals.</p>
      ) : !loaded ? (
        <p className="mt-2 text-xs text-ink/50">Loading…</p>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PLANS.map((p) => (
              <button key={p} type="button" onClick={() => { setPlan(p); setMsg(null); }}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  plan === p ? "border-ink bg-ink text-paper" : "border-hairline text-ink/70 hover:border-ink/40")}>
                {PLAN_LABEL[p]}
              </button>
            ))}
          </div>

          {plan === "directors" ? (
            <p className="mt-2.5 text-xs leading-relaxed text-ink/60">Director&apos;s Circle shows no progress bar and no monthly goal — a bespoke, personally-guided plan.</p>
          ) : (
            <>
              <div className="mt-2.5 flex items-center gap-2">
                <label className="text-xs text-ink/60">Month</label>
                <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setMsg(null); }}
                  className="rounded-lg border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
              </div>
              <textarea value={goal} onChange={(e) => { setGoal(e.target.value); setMsg(null); }} rows={2}
                placeholder="e.g. Play the C, G and Am chords cleanly and switch between them in time."
                className="mt-2 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
            </>
          )}

          {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          {msg && <p className="mt-2 text-xs font-semibold text-feature-green">{msg}</p>}
          <button onClick={save} disabled={busy}
            className="mt-2.5 w-full rounded-lg bg-gold py-2 text-sm font-semibold text-charcoal hover:brightness-105 disabled:opacity-50">
            {busy ? "Saving…" : "Save plan & goal"}
          </button>
        </>
      )}
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
