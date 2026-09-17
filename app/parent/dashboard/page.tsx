"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { DashboardBody } from "@/components/parent/DashboardBody";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, studentView, completedCount, type ParentData } from "@/lib/supabase/parent";
import { isValidCompleted } from "@/lib/attendance";
import { computeFoundation } from "@/lib/foundation";
import { studentPlan } from "@/lib/plan";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";

export default function ParentDashboard() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = () => loadParentData().then((d) => { setErr(d.error); setData(d); });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const view = useMemo(() => (data && student ? studentView(data, student) : null), [data, student]);
  const foundation = useMemo(() => {
    if (!data || !student) return null;
    return computeFoundation(completedCount(data, student.id), 1, false, studentPlan(student) !== "foundation");
  }, [data, student]);
  const pay = useMemo(() => (data && student ? data.payments.find((p) => p.student_id === student.id) ?? null : null), [data, student]);
  const pays = useMemo(() => (data && student ? data.payments.filter((p) => p.student_id === student.id) : []), [data, student]);
  const completedDates = useMemo(
    () => (data && student ? data.classes.filter((c) => c.student_id === student.id && isValidCompleted(c)).map((c) => c.class_date) : []),
    [data, student],
  );
  // The class to show learning notes for: the most recent attended one (so a
  // later cancellation doesn't hide the real last lesson), newest first.
  const lastClass = useMemo(() => {
    if (!data || !student) return null;
    const mine = [...data.classes.filter((c) => c.student_id === student.id)]
      .sort((a, b) => (b.class_date || "").localeCompare(a.class_date || ""));
    return mine.find(isValidCompleted) ?? mine[0] ?? null;
  }, [data, student]);

  const switcher = data
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Musicphonetics" subtitle="Student Portal" headerRight={switcher}>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp and we'll link your child's profile to your login." />
      ) : view && student && foundation ? (
        <DashboardBody student={student} view={view} foundation={foundation} pay={pay} pays={pays} completedDates={completedDates} lastClass={lastClass} />
      ) : <Loading />}
    </PortalShell>
  );
}
