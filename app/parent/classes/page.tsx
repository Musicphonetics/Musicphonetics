"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";
import { ParentClassCycles } from "@/components/parent/ParentClassCycles";

export default function ParentClasses() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = () => loadParentData().then((d) => { setErr(d.error); setData(d); });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const classes = useMemo(
    () => (data && student ? data.classes.filter((c) => c.student_id === student.id) : []),
    [data, student]
  );
  const pays = useMemo(
    () => (data && student ? data.payments.filter((p) => p.student_id === student.id) : []),
    [data, student]
  );
  const switcher = data
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Class updates" headerRight={switcher}>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : classes.length === 0 ? (
        <EmptyState title="No classes logged yet" hint="Every class update your teacher writes will appear here." />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-ink/60">
            Classes are grouped by the payment that paid for them, so you can see each cycle&apos;s payment, how many
            classes happened, and when. Tap a cycle to open it.
          </p>
          {student && (
            <ParentClassCycles
              classes={classes}
              payments={pays}
              feeQuoted={student.fee_quoted}
              classesPerMonth={student.classes_per_month}
            />
          )}
        </div>
      )}
    </PortalShell>
  );
}
