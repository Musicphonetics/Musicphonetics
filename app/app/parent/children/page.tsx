"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadParentData, studentView, type ParentData } from "@/lib/supabase/parent";
import type { Student } from "@/lib/supabase/types";
import { Loading, Icon } from "@/components/app/states";
import { Empty, ErrorBox, Unauthorized, LessonItem, Metric, fmtDate } from "@/components/app/data";

export default function Page() {
  return <Suspense fallback={<Loading />}><ChildrenInner /></Suspense>;
}

function ChildrenInner() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const router = useRouter();
  const [state, setState] = useState<{ loading: boolean; data: ParentData | null }>({ loading: true, data: null });

  useEffect(() => {
    let active = true;
    loadParentData().then((d) => { if (active) setState({ loading: false, data: d }); });
    return () => { active = false; };
  }, []);

  if (state.loading) return <Loading />;
  const d = state.data!;
  if (d.error && d.students.length === 0) return <ErrorBox msg={d.error} />;

  if (id) {
    // Detail: the id must be one of THIS family's children (loadParentData is
    // already scoped to parent_id = auth.uid()); anything else is unauthorised.
    const child = d.students.find((s) => s.id === id) ?? null;
    return <ChildDetail d={d} child={child} onBack={() => router.push("/app/parent/children")} />;
  }

  if (d.students.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-[1.7rem] font-semibold text-ink">Your children</h1>
        <Empty icon="children" title="No children linked yet" hint="Children added to your family account appear here." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[1.7rem] font-semibold text-ink">Your children</h1>
      <div className="mt-4 space-y-2.5">
        {d.students.map((s) => {
          const v = studentView(d, s);
          return (
            <button key={s.id} onClick={() => router.push(`/app/parent/children?id=${s.id}`)} className="w-full text-left">
              <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-3.5 shadow-card transition hover:border-gold/40">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm font-semibold text-[#7A5E0F]">
                  {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[1rem] font-semibold text-ink">{s.name}</p>
                  <p className="truncate text-[0.78rem] text-ink/55">{[s.instrument, v.teacherName].filter(Boolean).join(" · ")}</p>
                </div>
                <p className="shrink-0 text-[0.78rem] text-ink/50">{v.completed} done · {v.remaining} left</p>
                <Icon n="chevron" s={16} c="text-ink/25" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChildDetail({ d, child, onBack }: { d: ParentData; child: Student | null; onBack: () => void }) {
  const back = (
    <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink">
      <Icon n="chevron" s={16} c="rotate-180" /> All children
    </button>
  );
  if (!child) return <div className="mx-auto max-w-2xl">{back}<div className="mt-4"><Unauthorized /></div></div>;

  const v = studentView(d, child);
  const lessons = d.classes.filter((c) => c.student_id === child.id); // already sorted desc, parent-scoped

  return (
    <div className="mx-auto max-w-2xl">
      {back}
      <div className="mt-4 flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-lg font-semibold text-[#7A5E0F]">
          {child.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-ink">{child.name}</h1>
          <p className="text-[0.82rem] text-ink/55">{[child.instrument, `with ${v.teacherName}`].filter(Boolean).join(" · ")}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Metric label="Completed" value={v.completed} />
        <Metric label="Remaining" value={v.remaining} />
        <Metric label="Next class" value={<span className="text-sm">{v.nextClassDate ? fmtDate(v.nextClassDate) : "—"}</span>} />
      </div>

      <h2 className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink/45">Lesson updates</h2>
      {lessons.length === 0 ? (
        <Empty icon="book" title="No lessons recorded yet" hint="Updates from your teacher after each class will appear here." />
      ) : (
        <div className="mt-3 space-y-2.5">
          {lessons.map((c) => <LessonItem key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
