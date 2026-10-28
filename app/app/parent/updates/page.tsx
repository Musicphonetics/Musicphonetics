"use client";

import { useEffect, useState } from "react";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import { Loading } from "@/components/app/states";
import { Empty, ErrorBox, LessonItem } from "@/components/app/data";

export default function ParentUpdates() {
  const [state, setState] = useState<{ loading: boolean; data: ParentData | null }>({ loading: true, data: null });

  useEffect(() => {
    let active = true;
    loadParentData().then((d) => { if (active) setState({ loading: false, data: d }); });
    return () => { active = false; };
  }, []);

  if (state.loading) return <Loading />;
  const d = state.data!;
  if (d.error && d.classes.length === 0) return <ErrorBox msg={d.error} />;

  const names = new Map(d.students.map((s) => [s.id, s.name]));
  const multi = d.students.length > 1;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[1.7rem] font-semibold text-ink">Updates</h1>
      <p className="mt-1 text-[0.9rem] text-ink/55">Lesson updates from your teacher, newest first.</p>

      {d.classes.length === 0 ? (
        <Empty icon="bell" title="No updates yet" hint="After each class, your teacher’s update will appear here." />
      ) : (
        <div className="mt-4 space-y-2.5">
          {d.classes.map((c) => (
            <div key={c.id}>
              {multi && <p className="mb-1 ml-1 text-[0.72rem] font-medium text-ink/45">{names.get(c.student_id) ?? "Your child"}</p>}
              <LessonItem c={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
