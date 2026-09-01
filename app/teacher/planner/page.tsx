"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import { isValidCompleted } from "@/lib/attendance";
import type { StudentStat, ClassUpdate } from "@/lib/supabase/types";
import { weekStartMonday, weekDatesISO, weekRangeLabel, slotsSummary, standing, STANDING_META, DOW } from "@/lib/planner";
import { cn } from "@/lib/utils";

type Row = StudentStat & { doneThisWeek: number; target: number; stand: ReturnType<typeof standing> };

export default function TeacherPlanner() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const start = useMemo(() => weekStartMonday(), []);
  const todayDow = new Date().getDay();

  useEffect(() => {
    if (!isSupabaseConfigured()) { setRows([]); return; }
    (async () => {
      const { rows: roster, error } = await loadRoster();
      if (error) { setErr(error); setRows([]); return; }
      const active = roster.filter((s) => s.status === "active");
      const week = weekDatesISO(start);
      // Count classes done this week per student.
      const { data: cls } = await getSupabase()
        .from("class_updates")
        .select("student_id,class_date,class_status,attendance_status,counts_toward_cycle")
        .gte("class_date", week[0]).lte("class_date", week[6]);
      const done = new Map<string, number>();
      for (const c of (cls as Pick<ClassUpdate, "student_id" | "class_status" | "attendance_status" | "counts_toward_cycle">[]) ?? []) {
        if (isValidCompleted(c)) done.set(c.student_id, (done.get(c.student_id) ?? 0) + 1);
      }
      const out: Row[] = active.map((s) => {
        const target = s.weekly_target ?? 2;
        const d = done.get(s.student_id) ?? 0;
        return { ...s, doneThisWeek: d, target, stand: standing(d, target, todayDow) };
      });
      // Neediest first: not started, then behind, then the rest.
      const rank = { none: 0, behind: 1, ontrack: 2, ahead: 3 };
      out.sort((a, b) => rank[a.stand] - rank[b.stand] || a.name.localeCompare(b.name));
      setRows(out);
    })();
  }, [start, todayDow]);

  const summary = useMemo(() => {
    const r = rows ?? [];
    return {
      total: r.length,
      none: r.filter((x) => x.stand === "none").length,
      behind: r.filter((x) => x.stand === "behind").length,
      ok: r.filter((x) => x.stand === "ontrack" || x.stand === "ahead").length,
      unscheduled: r.filter((x) => !(x.weekly_slots && x.weekly_slots.length)).length,
    };
  }, [rows]);

  // Mid-week nudge (Wednesday onward): who has had nothing yet, who is ahead.
  const alerted = (rows ?? []).filter((x) => x.stand === "none");
  const ahead = (rows ?? []).filter((x) => x.doneThisWeek >= x.target).slice(0, 2);
  const showAlert = todayDow === 0 || todayDow >= 3; // Wed..Sun

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Weekly planner" subtitle={weekRangeLabel(start)}>
      {rows === null ? <Loading /> : (
        <>
          {/* summary */}
          <section className="grid grid-cols-3 gap-3">
            {[["Students", summary.total], ["On track", summary.ok], ["Need a class", summary.none + summary.behind]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-hairline bg-white p-4 text-center">
                <p className="font-display text-2xl font-bold text-ink">{v}</p>
                <p className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-ink/50">{k}</p>
              </div>
            ))}
          </section>

          {err && <p className="mt-4 rounded-xl bg-red-500/[0.07] px-3 py-2 text-sm text-red-700">{err}</p>}

          {/* mid-week alert */}
          {showAlert && alerted.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-50 p-4">
              <p className="flex items-center gap-2 font-semibold text-amber-800">
                <span aria-hidden="true">⏰</span> It&apos;s {DOW[todayDow]}. {alerted.length} {alerted.length === 1 ? "student has" : "students have"} no class yet this week.
              </p>
              <p className="mt-1 text-sm text-amber-800/90">
                Still to start: <b>{alerted.map((s) => s.name).join(", ")}</b>.
                {ahead.length > 0 && <> Meanwhile {ahead.map((s) => `${s.name} (${s.doneThisWeek})`).join(" and ")} {ahead.length === 1 ? "is" : "are"} on track.</>}
              </p>
            </div>
          )}

          {/* target reminder */}
          <p className="mt-4 text-sm text-ink/60">Aim for at least <b className="text-ink">2 classes a week</b> per student{summary.unscheduled > 0 && <>, and set a weekly schedule for the {summary.unscheduled} without one</>}.</p>

          {/* the board */}
          {rows.length === 0 ? (
            <div className="mt-6"><EmptyState title="No active students yet" hint="Add students to plan their week." /></div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {rows.map((s) => {
                const meta = STANDING_META[s.stand];
                const sched = slotsSummary(s.weekly_slots);
                const remaining = Math.max(s.target - s.doneThisWeek, 0);
                return (
                  <div key={s.student_id} className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} title={meta.label} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[15px] font-semibold text-ink">{s.name}</p>
                      <p className="truncate text-xs text-ink/55">
                        {s.instrument || "Music"}
                        {sched ? ` · ${sched}` : " · no schedule set"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg font-bold leading-none text-ink">{s.doneThisWeek}<span className="text-sm font-normal text-ink/45"> / {s.target}</span></p>
                      <p className={cn("text-[0.7rem] font-semibold", meta.text)}>{s.stand === "ahead" ? "Ahead" : s.stand === "ontrack" ? "On track" : remaining === s.target ? "Not started" : `${remaining} to go`}</p>
                    </div>
                    <Link href="/teacher/class-update" className="shrink-0 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-[#7A5E0F]">Mark</Link>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-ink/50">
            Set each student&apos;s weekly days &amp; time in <Link href="/teacher/students" className="font-semibold text-[#7A5E0F]">Students</Link>. It fills the <Link href="/teacher/calendar" className="font-semibold text-[#7A5E0F]">Calendar</Link> automatically.
          </p>
        </>
      )}
    </PortalShell>
  );
}
