"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { DOW, DOW_FULL, WEEK_ORDER } from "@/lib/planner";
import {
  buildPlan, groupByWeek, recommendWeekdays, requiredPerWeek, prettyDate, addDays, todayISO,
} from "@/lib/attackplan";
import type { StudentStat, WeeklySlot } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const daysLabel = (wd: number[]) =>
  [...wd].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => DOW[d]).join(", ") || "no days";

// A completion planner: enter a block of classes + when to finish + the days you
// can teach, and it lays out the exact class dates and the finish date, flagging
// if the pace won't clear a deadline and what pace would.
export function AttackPlanner({ students }: { students: StudentStat[] }) {
  const [studentId, setStudentId] = useState<string>("custom");
  const [classes, setClasses] = useState<string>("16");
  const [startISO, setStartISO] = useState<string>(() => addDays(todayISO(), 1));
  const [deadlineISO, setDeadlineISO] = useState<string>("");
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);
  const [time, setTime] = useState<string>("17:00");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const student = students.find((s) => s.student_id === studentId) || null;

  // Picking a student prefills the block size, their teaching days and time.
  function pickStudent(id: string) {
    setStudentId(id);
    setSaveMsg(null);
    const s = students.find((x) => x.student_id === id);
    if (!s) return;
    const remaining = s.classes_remaining > 0 ? s.classes_remaining : (s.classes_per_month || 8);
    setClasses(String(remaining));
    const slots = (s.weekly_slots ?? []).filter((sl) => sl && typeof sl.day === "number");
    if (slots.length) {
      setWeekdays([...new Set(slots.map((sl) => sl.day))]);
      if (slots[0].time) setTime(slots[0].time);
    }
  }

  function toggleDay(d: number) {
    setSaveMsg(null);
    setWeekdays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  const n = Math.max(0, Math.floor(Number(classes) || 0));
  const plan = useMemo(
    () => buildPlan(n, startISO, weekdays, deadlineISO || null),
    [n, startISO, weekdays, deadlineISO],
  );
  const weeks = useMemo(() => groupByWeek(plan.items), [plan.items]);

  // If a deadline is set and the current pace misses it, what pace clears it.
  const suggestedPerWeek = deadlineISO && n > 0 ? requiredPerWeek(n, startISO, deadlineISO) : null;
  const suggestionWorks = suggestedPerWeek != null
    && buildPlan(n, startISO, recommendWeekdays(suggestedPerWeek), deadlineISO || null).onTime === true;
  const needsFaster = plan.onTime === false;

  function applySuggested() {
    if (!suggestedPerWeek) return;
    setWeekdays(recommendWeekdays(suggestedPerWeek));
    setSaveMsg(null);
  }

  async function saveToSchedule() {
    if (!student) return;
    setSaveMsg(null);
    const slots: WeeklySlot[] = [...weekdays].sort().map((d) => ({ day: d, time }));
    const { error } = await getSupabase().from("students")
      .update({ weekly_slots: slots, weekly_target: weekdays.length }).eq("id", student.student_id);
    setSaveMsg(error ? error.message : `Saved. ${student.name.split(" ")[0]}'s week is now ${daysLabel(weekdays)} — it fills the calendar and planner.`);
  }

  function copyPlan() {
    const head = `${n} classes · ${weekdays.length}/week (${daysLabel(weekdays)}) · finishes ${prettyDate(plan.finishISO)}`;
    const lines = plan.items.map((it) => `${it.n}. ${prettyDate(it.dateISO)}`);
    const text = [student ? `${student.name} — attack plan` : "Attack plan", head, "", ...lines].join("\n");
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }, () => {});
  }

  const cin = "w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-hairline bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Plan a block of classes</p>
        <p className="mt-1 text-xs text-ink/55">Tell it how many classes and by when — it lays out the days.</p>

        {students.length > 0 && (
          <label className="mt-3 block">
            <span className="text-xs font-medium text-ink/60">Student</span>
            <select value={studentId} onChange={(e) => pickStudent(e.target.value)} className={cn(cin, "mt-1")}>
              <option value="custom">Custom (just numbers)</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.name}{s.classes_remaining > 0 ? ` · ${s.classes_remaining} left` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Classes to finish</span>
            <input value={classes} inputMode="numeric" onChange={(e) => { setClasses(e.target.value.replace(/[^\d]/g, "")); setSaveMsg(null); }} className={cn(cin, "mt-1")} placeholder="16" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Class time</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={cn(cin, "mt-1")} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Start from</span>
            <input type="date" value={startISO} onChange={(e) => { setStartISO(e.target.value); setSaveMsg(null); }} className={cn(cin, "mt-1")} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Finish by <span className="text-ink/40">(optional)</span></span>
            <input type="date" value={deadlineISO} min={startISO} onChange={(e) => { setDeadlineISO(e.target.value); setSaveMsg(null); }} className={cn(cin, "mt-1")} />
          </label>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink/60">Class days ({weekdays.length}/week)</span>
            {suggestedPerWeek && (
              <button onClick={applySuggested} className="text-xs font-semibold text-[#7A5E0F]">Suggest for my deadline →</button>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {WEEK_ORDER.map((d) => {
              const on = weekdays.includes(d);
              return (
                <button key={d} onClick={() => toggleDay(d)} title={DOW_FULL[d]}
                  className={cn("h-9 w-11 rounded-lg text-xs font-semibold transition-colors",
                    on ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/60 hover:border-ink/30")}>
                  {DOW[d]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verdict */}
      {n === 0 || weekdays.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-paper p-5 text-center text-sm text-ink/55">
          Enter a class count and pick at least one class day to see the plan.
        </div>
      ) : (
        <>
          <div className={cn("rounded-2xl border p-5 shadow-card",
            needsFaster ? "border-amber-400/50 bg-amber-50" : "border-hairline bg-white")}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">Here&apos;s your plan</p>
            <p className="mt-1.5 font-display text-2xl font-bold text-ink">
              {n} classes · {weekdays.length}/week
            </p>
            <p className="mt-0.5 text-sm text-ink/70">{daysLabel(weekdays)}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-ink/[0.05] px-3 py-1.5 font-medium text-ink">
                Finishes <b>{prettyDate(plan.finishISO)}</b>
              </span>
              <span className="rounded-lg bg-ink/[0.05] px-3 py-1.5 font-medium text-ink/70">~{plan.weeks} week{plan.weeks === 1 ? "" : "s"}</span>
            </div>

            {plan.onTime === true && plan.slackDays != null && (
              <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700">
                ✓ On time — {plan.slackDays === 0 ? "finishes exactly on the deadline" : `${plan.slackDays} day${plan.slackDays === 1 ? "" : "s"} to spare`}.
              </p>
            )}
            {needsFaster && (
              <div className="mt-3 rounded-lg bg-amber-100/70 px-3 py-2.5 text-sm text-amber-900">
                <p className="font-semibold">Too slow — {Math.abs(plan.slackDays ?? 0)} day{Math.abs(plan.slackDays ?? 0) === 1 ? "" : "s"} past your deadline.</p>
                {suggestedPerWeek && suggestionWorks ? (
                  <p className="mt-0.5">
                    Go <b>{suggestedPerWeek}/week</b> ({daysLabel(recommendWeekdays(suggestedPerWeek))}) to finish in time.{" "}
                    <button onClick={applySuggested} className="font-semibold underline">Use it</button>
                  </p>
                ) : (
                  <p className="mt-0.5">Even daily classes won&apos;t clear this deadline — start earlier or move the finish date.</p>
                )}
              </div>
            )}
            {!plan.feasible && (
              <p className="mt-3 text-sm text-red-600">That&apos;s more classes than fit — add more class days.</p>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={copyPlan} className="flex-1 rounded-full border border-hairline bg-white py-2.5 text-sm font-semibold text-ink/80 hover:border-ink/40">
                {copied ? "Copied ✓" : "Copy plan"}
              </button>
              {student && (
                <button onClick={saveToSchedule} className="flex-1 rounded-full bg-gold py-2.5 text-sm font-semibold text-ink hover:brightness-105">
                  Save to {student.name.split(" ")[0]}&apos;s week
                </button>
              )}
            </div>
            {saveMsg && <p className={cn("mt-2 text-xs", saveMsg.startsWith("Saved") ? "font-semibold text-emerald-700" : "text-red-600")}>{saveMsg}</p>}
          </div>

          {/* Week-by-week dates */}
          <div className="space-y-3">
            {weeks.map((w, i) => (
              <div key={w.label} className="overflow-hidden rounded-2xl border border-hairline bg-white">
                <div className="flex items-center justify-between border-b border-hairline bg-paper/60 px-4 py-2.5">
                  <p className="text-sm font-semibold text-ink">Week {i + 1}</p>
                  <p className="text-xs text-ink/55">{w.label} · {w.items.length} class{w.items.length === 1 ? "" : "es"}</p>
                </div>
                <ul className="divide-y divide-hairline/70">
                  {w.items.map((it) => (
                    <li key={it.n} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-bold text-[#7A5E0F]">{it.n}</span>
                      <span className="text-ink/80">{prettyDate(it.dateISO)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
