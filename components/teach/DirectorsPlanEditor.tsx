"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { aiGeneratePlan, normalizePlan, type MonthlyPlan } from "@/lib/ai";
import { cn } from "@/lib/utils";

const thisMonth = () => new Date().toISOString().slice(0, 7);
const monthLabel = (m: string) =>
  new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// Director's Circle: one big monthly goal broken into 8 defined mentorship
// classes. The teacher can write rough notes and let AI draft the 8 classes,
// then edit freely. What is saved is exactly what the family sees.
export function DirectorsPlanEditor({
  studentId, studentName, instrument, level,
}: { studentId: string; studentName: string; instrument: string | null; level: string | null }) {
  const [month, setMonth] = useState(thisMonth());
  const [plan, setPlan] = useState<MonthlyPlan>(() => normalizePlan(null, thisMonth()));
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [gen, setGen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getSupabase().from("students").select("monthly_plan,goal_month").eq("id", studentId).single()
      .then(({ data, error }) => {
        if (error) {
          if (/column|does not exist|schema cache/i.test(error.message)) setNeedsMigration(true);
        } else {
          const row = data as { monthly_plan: unknown; goal_month: string | null };
          const m = row?.goal_month || thisMonth();
          setMonth(m);
          if (row?.monthly_plan) setPlan(normalizePlan(row.monthly_plan, m));
        }
        setLoaded(true);
      });
  }, [studentId]);

  async function generate() {
    if (!notes.trim() || gen) return;
    setGen(true); setErr(null); setMsg(null);
    try {
      const out = await aiGeneratePlan({
        notes, student_name: studentName, instrument, level, program: "Director's Circle",
      });
      setPlan((p) => ({ ...p, big_goal: out.big_goal, classes: out.classes }));
      setMsg("Draft ready — review, edit, then Save.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't generate the plan.");
    }
    setGen(false);
  }

  function setBig(v: string) { setPlan((p) => ({ ...p, big_goal: v })); setMsg(null); }
  function setClass(i: number, key: "title" | "focus", v: string) {
    setPlan((p) => ({ ...p, classes: p.classes.map((c, idx) => idx === i ? { ...c, [key]: v } : c) }));
    setMsg(null);
  }

  async function save() {
    setBusy(true); setErr(null); setMsg(null);
    const payload = {
      monthly_plan: { ...plan, month, updated_at: new Date().toISOString() },
      goal_month: month, goal_set_at: new Date().toISOString(),
    };
    const { error } = await getSupabase().from("students").update(payload).eq("id", studentId);
    setBusy(false);
    if (error) {
      if (/column|does not exist|schema cache/i.test(error.message)) setNeedsMigration(true);
      else setErr(error.message);
    } else setMsg("Saved. The family sees this in the Director's Circle portal.");
  }

  const fld = "w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

  return (
    <div className="mt-4 rounded-xl border border-gold/40 bg-white p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Director&apos;s Circle · monthly plan</p>
        <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">Premium</span>
      </div>

      {needsMigration ? (
        <p className="mt-2 text-xs leading-relaxed text-ink/60">Run <code className="rounded bg-mist px-1">supabase/directors_plan.sql</code> once in Supabase to enable the Director&apos;s Circle plan.</p>
      ) : !loaded ? (
        <p className="mt-2 text-xs text-ink/50">Loading…</p>
      ) : (
        <>
          <div className="mt-2.5 flex items-center gap-2">
            <label className="text-xs text-ink/60">Month</label>
            <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setMsg(null); }}
              className="rounded-lg border border-hairline bg-white px-2.5 py-1.5 text-xs text-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
          </div>

          {/* AI drafting */}
          <div className="mt-3 rounded-lg border border-dashed border-gold/50 bg-gold/[0.04] p-3">
            <p className="text-xs font-semibold text-ink/75">✨ Draft with AI</p>
            <p className="mt-0.5 text-[11px] text-ink/55">Write rough notes on this month&apos;s focus — AI turns it into one goal + 8 classes. You can edit everything after.</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder={`e.g. Build ${studentName.split(" ")[0] || "the student"}'s barre chords, work on a fingerstyle piece, prep a small performance by month end.`}
              className={cn(fld, "mt-2")} />
            <button onClick={generate} disabled={gen || !notes.trim()}
              className="mt-2 w-full rounded-lg bg-ink py-2 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-50">
              {gen ? "Generating…" : "Generate 8-class plan"}
            </button>
          </div>

          {/* The big goal */}
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-ink/70">One big goal for {monthLabel(month)}</span>
            <textarea value={plan.big_goal} onChange={(e) => setBig(e.target.value)} rows={2}
              placeholder="The single motivating goal for this month." className={cn(fld, "mt-1")} />
          </label>

          {/* 8 classes */}
          <p className="mt-3 text-xs font-semibold text-ink/70">The 8 mentorship classes</p>
          <div className="mt-1.5 space-y-2">
            {plan.classes.map((c, i) => (
              <div key={i} className="flex gap-2 rounded-lg border border-hairline p-2">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-xs font-bold text-[#7A5E0F]">{i + 1}</span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input value={c.title} onChange={(e) => setClass(i, "title", e.target.value)}
                    placeholder={`Class ${i + 1} title`} className={cn(fld, "py-1.5 font-medium")} />
                  <input value={c.focus} onChange={(e) => setClass(i, "focus", e.target.value)}
                    placeholder="What this class covers" className={cn(fld, "py-1.5 text-xs")} />
                </div>
              </div>
            ))}
          </div>

          {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          {msg && <p className="mt-2 text-xs font-semibold text-feature-green">{msg}</p>}
          <button onClick={save} disabled={busy}
            className="mt-3 w-full rounded-lg bg-gold py-2 text-sm font-semibold text-charcoal hover:brightness-105 disabled:opacity-50">
            {busy ? "Saving…" : "Save plan"}
          </button>
        </>
      )}
    </div>
  );
}
