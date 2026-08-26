"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { aiGeneratePlan, normalizePlan, type MonthlyPlan } from "@/lib/ai";
import { PLAN_LABEL, type Plan } from "@/lib/plan";
import { cn } from "@/lib/utils";

const thisMonth = () => new Date().toISOString().slice(0, 7);
const monthLabel = (m: string) =>
  new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// One-tap starters, fill the notes box so a teacher can plan a month in seconds.
// The AI expands these (with the song bank) into a full 8-class plan.
const STARTERS: { label: string; note: string }[] = [
  { label: "Absolute beginner", note: "Absolute beginner, first month. Build posture, clean notes and steady counting, and an easy first song by month end." },
  { label: "Bollywood songs", note: "Beginner–easy. Wants to learn popular Bollywood songs this month." },
  { label: "Rhythm & strumming", note: "Focus on rhythm and strumming/timing this month with one fun, rhythmic song." },
  { label: "Devotional / bhajan", note: "Devotional focus this month, learn a bhajan to play for the family." },
  { label: "Performance piece", note: "Prepare one performance piece to play confidently for the family by month end." },
  { label: "Trinity / exam prep", note: "Trinity exam preparation, scales/arpeggios, a set piece, sight-reading and aural, with a mock in class 7–8." },
];

// One big monthly goal broken into 8 defined classes, for ANY program. The
// teacher can write rough notes and let AI draft the 8 classes, then edit
// freely. Saving mirrors the big goal into monthly_goal so existing goal
// displays stay in sync. What is saved is exactly what the family sees.
export function MonthlyPlanEditor({
  studentId, studentName, instrument, level, plan,
}: { studentId: string; studentName: string; instrument: string | null; level: string | null; plan: Plan }) {
  const premium = plan === "directors";
  const [month, setMonth] = useState(thisMonth());
  const [planData, setPlanData] = useState<MonthlyPlan>(() => normalizePlan(null, thisMonth()));
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
          if (row?.monthly_plan) setPlanData(normalizePlan(row.monthly_plan, m));
        }
        setLoaded(true);
      });
  }, [studentId]);

  async function generate() {
    if (gen) return;
    if (!notes.trim()) { setErr("Tap a starter above or type a few words first."); return; }
    setGen(true); setErr(null); setMsg(null);
    try {
      const out = await aiGeneratePlan({
        notes, student_name: studentName, instrument, level, program: PLAN_LABEL[plan],
      });
      setPlanData((p) => ({ ...p, big_goal: out.big_goal, classes: out.classes }));
      setMsg("Draft ready, review, edit, then Save.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't generate the plan.");
    }
    setGen(false);
  }

  function setBig(v: string) { setPlanData((p) => ({ ...p, big_goal: v })); setMsg(null); }
  function setClass(i: number, key: "title" | "focus", v: string) {
    setPlanData((p) => ({ ...p, classes: p.classes.map((c, idx) => idx === i ? { ...c, [key]: v } : c) }));
    setMsg(null);
  }

  async function save() {
    setBusy(true); setErr(null); setMsg(null);
    const payload = {
      monthly_plan: { ...planData, month, updated_at: new Date().toISOString() },
      monthly_goal: planData.big_goal.trim() || null,  // keep the simple goal display in sync
      goal_month: month, goal_set_at: new Date().toISOString(),
    };
    const { error } = await getSupabase().from("students").update(payload).eq("id", studentId);
    setBusy(false);
    if (error) {
      if (/column|does not exist|schema cache/i.test(error.message)) setNeedsMigration(true);
      else setErr(error.message);
    } else setMsg("Saved. The family sees this in the student portal.");
  }

  const fld = "w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

  return (
    <div className={cn("mt-4 rounded-xl border bg-white p-3.5", premium ? "border-gold/40" : "border-hairline")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">
          {premium ? "Director's Circle · monthly plan" : `${PLAN_LABEL[plan]} · this month's plan`}
        </p>
        {premium && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">Premium</span>}
      </div>

      {needsMigration ? (
        <p className="mt-2 text-xs leading-relaxed text-ink/60">Run <code className="rounded bg-mist px-1">supabase/directors_plan.sql</code> once in Supabase to enable monthly plans.</p>
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
            <p className="mt-0.5 text-[11px] text-ink/55">Tap a starter or write a few rough words, even short is fine. AI turns it into one goal + 8 classes, with real songs, in {studentName.split(" ")[0] || "the student"}&apos;s name. You can edit everything after.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STARTERS.map((s) => (
                <button key={s.label} type="button" onClick={() => { setNotes(s.note); setMsg(null); }}
                  className="rounded-full border border-gold/40 bg-white px-2.5 py-1 text-[11px] font-medium text-ink/75 transition-colors hover:border-gold hover:bg-gold/10">
                  {s.label}
                </button>
              ))}
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder={`e.g. Build ${studentName.split(" ")[0] || "the student"}'s chord changes, start a new song, prep a small performance by month end.`}
              className={cn(fld, "mt-2")} />
            <button onClick={generate} disabled={gen}
              className="mt-2 w-full rounded-lg bg-ink py-2 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60">
              {gen ? "Generating…" : "Generate 8-class plan"}
            </button>
            {err && <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-xs leading-relaxed text-red-700">{err}</p>}
          </div>

          {/* The big goal */}
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-ink/70">One big goal for {monthLabel(month)}</span>
            <textarea value={planData.big_goal} onChange={(e) => setBig(e.target.value)} rows={2}
              placeholder="The single motivating goal for this month." className={cn(fld, "mt-1")} />
          </label>

          {/* 8 classes */}
          <p className="mt-3 text-xs font-semibold text-ink/70">The 8 classes</p>
          <div className="mt-1.5 space-y-2">
            {planData.classes.map((c, i) => (
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
