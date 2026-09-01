"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { WeeklySlot } from "@/lib/supabase/types";
import { DOW, WEEK_ORDER, prettyTime, slotsSummary } from "@/lib/planner";
import { cn } from "@/lib/utils";

const MODES = ["Online", "Home", "Studio"];

// Set a student's recurring weekly schedule (days + time) and their weekly
// target. Saved onto the student, so it fills the calendar each week and drives
// the planner's done / target tracker.
export function WeeklyScheduleEditor({
  studentId, initialSlots, initialTarget, defaultMode, onSaved,
}: {
  studentId: string;
  initialSlots?: WeeklySlot[] | null;
  initialTarget?: number | null;
  defaultMode?: string | null;
  onSaved?: (slots: WeeklySlot[], target: number) => void;
}) {
  const [slots, setSlots] = useState<WeeklySlot[]>(initialSlots ?? []);
  const [target, setTarget] = useState<number>(initialTarget ?? 2);
  const [day, setDay] = useState<number>(1);
  const [time, setTime] = useState("17:00");
  const [mode, setMode] = useState<string>(defaultMode || "Online");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const addSlot = () => {
    if (slots.some((s) => s.day === day && s.time === time)) return;
    setSlots([...slots, { day, time, mode }].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || a.time.localeCompare(b.time)));
    setMsg(null);
  };
  const removeSlot = (i: number) => { setSlots(slots.filter((_, k) => k !== i)); setMsg(null); };

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const { data, error } = await getSupabase().from("students").update({ weekly_slots: slots, weekly_target: target }).eq("id", studentId).select("id");
      if (error) {
        setMsg({ ok: false, text: /column|schema cache|weekly_slots/i.test(error.message) ? "Run supabase/teacher_weekly_planner.sql to enable schedules." : error.message });
      } else if (!data || data.length === 0) {
        setMsg({ ok: false, text: "Couldn't save (no rows updated). Run supabase/student_update_policy.sql so teachers can edit their students." });
      } else {
        setMsg({ ok: true, text: "Schedule saved." });
        onSaved?.(slots, target);
      }
    } catch {
      setMsg({ ok: false, text: "Couldn't reach the server. Try again." });
    }
    setBusy(false);
  }

  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-ink">Weekly schedule</p>
        {slotsSummary(slots) && <span className="text-xs text-ink/55">{slotsSummary(slots)}</span>}
      </div>
      <p className="mt-0.5 text-xs text-ink/55">Set the usual days and time. It fills the calendar every week and drives the planner.</p>

      {/* target */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-ink/70">Classes a week</span>
        <div className="flex overflow-hidden rounded-full border border-hairline">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setTarget(n)}
              className={cn("px-3 py-1 text-sm", target === n ? "bg-gold text-ink font-semibold" : "text-ink/60 hover:bg-paper")}>{n}</button>
          ))}
        </div>
      </div>

      {/* current slots */}
      {slots.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {slots.map((s, i) => (
            <span key={`${s.day}-${s.time}-${i}`} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs text-ink/75">
              {DOW[s.day]} {prettyTime(s.time)}{s.mode ? ` · ${s.mode}` : ""}
              <button onClick={() => removeSlot(i)} aria-label="Remove" className="text-ink/40 hover:text-red-600">✕</button>
            </span>
          ))}
        </div>
      )}

      {/* add slot */}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-[11px] font-medium text-ink/60">Day
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="mt-1 rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm text-ink">
            {WEEK_ORDER.map((d) => <option key={d} value={d}>{DOW[d]}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-[11px] font-medium text-ink/60">Time
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm text-ink" />
        </label>
        <label className="flex flex-col text-[11px] font-medium text-ink/60">Mode
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1 rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm text-ink">
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <button onClick={addSlot} className="rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm font-semibold text-[#7A5E0F]">+ Add</button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button onClick={save} disabled={busy} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50">{busy ? "Saving…" : "Save schedule"}</button>
        {msg && <span className={cn("text-xs", msg.ok ? "text-feature-green" : "text-red-600")}>{msg.text}</span>}
      </div>
    </div>
  );
}
