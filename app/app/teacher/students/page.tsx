"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadRoster } from "@/lib/supabase/roster";
import { loadTeacherStudent, type TeacherStudent } from "@/lib/supabase/lessons";
import type { StudentStat } from "@/lib/supabase/types";
import { Icon, Loading } from "@/components/app/states";
import { Empty, ErrorBox, Unauthorized, LessonItem, Metric } from "@/components/app/data";

export default function Page() {
  return <Suspense fallback={<Loading />}><StudentsInner /></Suspense>;
}

function StudentsInner() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const router = useRouter();
  return id
    ? <StudentDetail id={id} onBack={() => router.push("/app/teacher/students")} />
    : <Roster onOpen={(sid) => router.push(`/app/teacher/students?id=${sid}`)} />;
}

/* ---------------------------------------------------------------- roster --- */
function Roster({ onOpen }: { onOpen: (id: string) => void }) {
  const [state, setState] = useState<{ loading: boolean; rows: StudentStat[]; error: string | null }>({ loading: true, rows: [], error: null });
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    loadRoster().then((r) => { if (active) setState({ loading: false, rows: r.rows, error: r.error }); });
    return () => { active = false; };
  }, []);

  if (state.loading) return <Loading />;
  if (state.error && state.rows.length === 0) return <ErrorBox msg={state.error} />;

  const rows = q.trim()
    ? state.rows.filter((r) => `${r.name} ${r.instrument ?? ""} ${r.student_code ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()))
    : state.rows;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[1.7rem] font-semibold text-ink">My students</h1>
      <p className="mt-1 text-[0.9rem] text-ink/55">Only the students assigned to you.</p>

      {state.rows.length > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2.5">
          <Icon n="search" s={17} c="text-ink/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, instrument or code"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40" aria-label="Search students" />
        </div>
      )}

      {state.rows.length === 0 ? (
        <Empty icon="users" title="No students yet" hint="Students assigned to you will appear here." />
      ) : rows.length === 0 ? (
        <Empty icon="search" title="No matches" hint="Try a different search." />
      ) : (
        <div className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <button key={r.student_id} onClick={() => onOpen(r.student_id)} className="w-full text-left">
              <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-3.5 shadow-card transition hover:border-gold/40">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm font-semibold text-[#7A5E0F]">
                  {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[1rem] font-semibold text-ink">{r.name}</p>
                  <p className="truncate text-[0.78rem] text-ink/55">
                    {[r.instrument, r.level].filter(Boolean).join(" · ") || "—"}
                    {r.student_code ? ` · ${r.student_code}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[0.82rem] font-semibold text-ink">{r.classes_completed}<span className="text-ink/40"> done</span></p>
                  <p className="text-[0.7rem] text-ink/45">{r.classes_remaining} left</p>
                </div>
                <Icon n="chevron" s={16} c="text-ink/25" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- detail --- */
function StudentDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [res, setRes] = useState<{ loading: boolean; data: TeacherStudent | null }>({ loading: true, data: null });

  useEffect(() => {
    let active = true;
    setRes({ loading: true, data: null });
    loadTeacherStudent(id).then((d) => { if (active) setRes({ loading: false, data: d }); });
    return () => { active = false; };
  }, [id]);

  const back = (
    <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink">
      <Icon n="chevron" s={16} c="rotate-180" /> All students
    </button>
  );

  if (res.loading) return <div className="mx-auto max-w-2xl">{back}<div className="mt-6"><Loading /></div></div>;
  const d = res.data!;
  if (!d.ok) {
    return <div className="mx-auto max-w-2xl">{back}<div className="mt-4">{d.error ? <ErrorBox msg={d.error} /> : <Unauthorized />}</div></div>;
  }

  const s = d.student;
  return (
    <div className="mx-auto max-w-2xl">
      {back}
      <div className="mt-4 flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-lg font-semibold text-[#7A5E0F]">
          {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-ink">{s.name}</h1>
          <p className="text-[0.82rem] text-ink/55">{[s.instrument, s.level].filter(Boolean).join(" · ") || "—"}{s.student_code ? ` · ${s.student_code}` : ""}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Metric label="Lessons" value={d.lessons.length} />
        <Metric label="Status" value={<span className="text-base capitalize">{s.status}</span>} />
        <Metric label="Per month" value={s.classes_per_month ?? "—"} />
      </div>

      <h2 className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink/45">Lesson history</h2>
      {d.error && <div className="mt-2"><ErrorBox msg={d.error} /></div>}
      {d.lessons.length === 0 ? (
        <Empty icon="book" title="No lessons recorded yet" hint="Lessons you record for this student will appear here." />
      ) : (
        <div className="mt-3 space-y-2.5">
          {d.lessons.map((c) => <LessonItem key={c.id} c={c} showNotes />)}
        </div>
      )}
    </div>
  );
}
