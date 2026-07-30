"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { DashboardBody } from "@/components/parent/DashboardBody";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, studentView, completedCount, type ParentData } from "@/lib/supabase/parent";
import { loadReadableMessages, pickParentMessage, type DirectorMessage } from "@/lib/supabase/director";
import { computeFoundation } from "@/lib/foundation";
import { studentPlan } from "@/lib/plan";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";

export default function ParentDashboard() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [directorRows, setDirectorRows] = useState<DirectorMessage[]>([]);

  const reload = () => loadParentData().then((d) => { setErr(d.error); setData(d); });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
    loadReadableMessages().then(setDirectorRows);
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const view = useMemo(() => (data && student ? studentView(data, student) : null), [data, student]);
  const foundation = useMemo(() => {
    if (!data || !student) return null;
    return computeFoundation(completedCount(data, student.id), 1, false, studentPlan(student) !== "foundation");
  }, [data, student]);
  const pay = useMemo(() => (data && student ? data.payments.find((p) => p.student_id === student.id) ?? null : null), [data, student]);
  const directorMsg = useMemo(() => (student ? pickParentMessage(directorRows, student.id) : null), [directorRows, student]);

  const switcher = data && data.students.length > 0
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Musicphonetics" subtitle="Student Portal" headerRight={switcher}>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp and we'll link your child's profile to your login." />
      ) : view && student && foundation ? (
        <DashboardBody student={student} view={view} foundation={foundation} pay={pay}
          directorMessage={directorMsg ? { title: directorMsg.title, body: directorMsg.body, date: directorMsg.created_at } : null} />
      ) : <Loading />}
    </PortalShell>
  );
}
