"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { DashboardBody } from "@/components/parent/DashboardBody";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, studentView, completedCount, type ParentData } from "@/lib/supabase/parent";
import { loadDirectorMessage, type DirectorMessage } from "@/lib/supabase/director";
import { computeFoundation } from "@/lib/foundation";
import { cn } from "@/lib/utils";

const isFoundation = (fee: number | null) => (fee ?? 8000) < 12000;
const firstName = (n: string) => n.split(" ")[0];

export default function ParentDashboard() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [menu, setMenu] = useState(false);
  const [directorMsg, setDirectorMsg] = useState<DirectorMessage | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadParentData().then((d) => { setErr(d.error); setData(d); });
    loadDirectorMessage("parents").then(setDirectorMsg);
  }, []);

  const student = data?.students[idx] ?? null;
  const view = useMemo(() => (data && student ? studentView(data, student) : null), [data, student]);
  const foundation = useMemo(() => {
    if (!data || !student) return null;
    return computeFoundation(completedCount(data, student.id), 1, false, !isFoundation(student.fee_quoted));
  }, [data, student]);
  const pay = useMemo(() => (data && student ? data.payments.find((p) => p.student_id === student.id) ?? null : null), [data, student]);

  const childMenu = student && data ? (
    <div className="relative">
      <button type="button" onClick={() => data.students.length > 1 && setMenu((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5"
        aria-haspopup={data.students.length > 1} aria-expanded={menu}>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/50 bg-gold/15 font-display text-sm font-bold text-gold">
          {firstName(student.name).charAt(0)}
        </span>
        <span className="max-w-[6rem] truncate text-sm font-semibold text-paper">{firstName(student.name)}</span>
        {data.students.length > 1 && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-paper/60"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>
      {menu && data.students.length > 1 && (
        <div className="absolute right-0 top-11 z-40 w-44 overflow-hidden rounded-2xl border border-white/10 bg-onyx-1 shadow-xl">
          {data.students.map((s, i) => (
            <button key={s.id} onClick={() => { setIdx(i); setMenu(false); }}
              className={cn("flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm", i === idx ? "bg-white/5 text-gold" : "text-paper/80 hover:bg-white/5")}>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gold/15 text-xs font-bold text-gold">{firstName(s.name).charAt(0)}</span>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} theme="night" title="Musicphonetics" subtitle="Parent Portal" headerRight={childMenu}>
      {err && <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{err}</div>}
      {!data ? <Loading dark /> : data.students.length === 0 ? (
        <EmptyState dark title="No student linked yet" hint="Message us on WhatsApp and we'll link your child's profile to your login." />
      ) : view && student && foundation ? (
        <DashboardBody student={student} view={view} foundation={foundation} pay={pay}
          directorMessage={directorMsg ? { title: directorMsg.title, body: directorMsg.body, date: directorMsg.created_at } : null} />
      ) : <Loading dark />}
    </PortalShell>
  );
}
