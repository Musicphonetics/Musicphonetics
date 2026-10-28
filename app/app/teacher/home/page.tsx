"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadRoster } from "@/lib/supabase/roster";
import { loadRecentLessons } from "@/lib/supabase/lessons";
import type { StudentStat, ClassUpdate } from "@/lib/supabase/types";
import { Loading, Icon } from "@/components/app/states";
import { Empty, ErrorBox, LessonItem, Metric } from "@/components/app/data";

export default function TeacherHome() {
  const [state, setState] = useState<{ loading: boolean; rows: StudentStat[]; lessons: ClassUpdate[]; error: string | null }>(
    { loading: true, rows: [], lessons: [], error: null });

  useEffect(() => {
    let active = true;
    Promise.all([loadRoster(), loadRecentLessons(6)]).then(([r, l]) => {
      if (active) setState({ loading: false, rows: r.rows, lessons: l.lessons, error: r.error || l.error });
    });
    return () => { active = false; };
  }, []);

  if (state.loading) return <Loading />;

  const names = new Map(state.rows.map((r) => [r.student_id, r.name]));
  const totalDone = state.rows.reduce((n, r) => n + r.classes_completed, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[1.7rem] font-semibold text-ink">Teaching</h1>
      {state.error && state.rows.length === 0 ? (
        <div className="mt-4"><ErrorBox msg={state.error} /></div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <Metric label="Students" value={state.rows.length} />
            <Metric label="Lessons done" value={totalDone} />
            <Metric label="Active" value={state.rows.filter((r) => r.status === "active").length} />
          </div>

          <div className="mt-4">
            <Link href="/app/teacher/students" className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4 shadow-card transition hover:border-gold/40">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-[#7A5E0F]"><Icon n="users" s={20} /></span>
              <span className="flex-1"><span className="block font-display text-[1rem] font-semibold text-ink">My students</span><span className="block text-[0.8rem] text-ink/55">Open a student to see their lesson history</span></span>
              <Icon n="chevron" s={16} c="text-ink/30" />
            </Link>
          </div>

          <h2 className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink/45">Recent lessons</h2>
          {state.lessons.length === 0 ? (
            <Empty icon="book" title="No lessons yet" hint="Lessons you record will appear here." />
          ) : (
            <div className="mt-3 space-y-2.5">
              {state.lessons.map((c) => (
                <div key={c.id}>
                  <p className="mb-1 ml-1 text-[0.72rem] font-medium text-ink/45">{names.get(c.student_id) ?? "Student"}</p>
                  <LessonItem c={c} showNotes />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
