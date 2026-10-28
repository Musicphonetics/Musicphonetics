"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadParentData, studentView, type ParentData } from "@/lib/supabase/parent";
import { Loading, Icon } from "@/components/app/states";
import { Empty, ErrorBox, fmtDate } from "@/components/app/data";

export default function ParentHome() {
  const [state, setState] = useState<{ loading: boolean; data: ParentData | null }>({ loading: true, data: null });

  useEffect(() => {
    let active = true;
    loadParentData().then((d) => { if (active) setState({ loading: false, data: d }); });
    return () => { active = false; };
  }, []);

  if (state.loading) return <Loading />;
  const d = state.data!;
  if (d.error && d.students.length === 0) return <ErrorBox msg={d.error} />;

  if (d.students.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-[1.7rem] font-semibold text-ink">Family</h1>
        <Empty icon="children" title="No children linked yet" hint="When a child is added to your family account, their learning will appear here." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[1.7rem] font-semibold text-ink">Family</h1>
      <p className="mt-1 text-[0.9rem] text-ink/55">Your {d.students.length === 1 ? "child's" : "children's"} learning at a glance.</p>

      <div className="mt-4 space-y-3">
        {d.students.map((s) => {
          const v = studentView(d, s);
          return (
            <Link key={s.id} href={`/app/parent/children?id=${s.id}`} className="block rounded-2xl border border-hairline bg-white p-4 shadow-card transition hover:border-gold/40">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm font-semibold text-[#7A5E0F]">
                  {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[1.05rem] font-semibold text-ink">{s.name}</p>
                  <p className="truncate text-[0.78rem] text-ink/55">{[s.instrument, v.teacherName].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[0.82rem] font-semibold text-ink">{v.completed}<span className="text-ink/40"> done</span></p>
                  <p className="text-[0.7rem] text-ink/45">{v.remaining} left</p>
                </div>
              </div>

              {v.latest ? (
                <div className="mt-3 rounded-xl bg-mist/50 p-3">
                  <p className="text-[0.72rem] font-medium text-ink/45">Last class · {fmtDate(v.latest.class_date)}</p>
                  {v.latest.taught && <p className="mt-0.5 line-clamp-2 text-[0.86rem] text-ink/80">{v.latest.taught}</p>}
                  {v.latest.homework && <p className="mt-1 text-[0.78rem] text-ink/55">Homework set</p>}
                </div>
              ) : (
                <p className="mt-3 text-[0.82rem] text-ink/45">No lessons recorded yet.</p>
              )}

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[0.76rem] text-ink/45">{v.nextClassDate ? `Next class ${fmtDate(v.nextClassDate)}` : " "}</span>
                <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[#7A5E0F]">View learning <Icon n="chevron" s={14} /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
