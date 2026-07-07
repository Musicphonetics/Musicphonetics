"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney } from "@/components/portal/kit";
import { OwnerTable, type Col } from "@/components/portal/OwnerTable";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadOwnerData, rollupTeachers, type TeacherRollup } from "@/lib/supabase/owner";

export default function OwnerTeachers() {
  const [rows, setRows] = useState<TeacherRollup[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadOwnerData().then((d) => { setErr(d.error); setRows(rollupTeachers(d)); });
  }, []);

  const cols: Col<TeacherRollup & Record<string, unknown>>[] = [
    { key: "name", label: "Teacher" },
    { key: "status", label: "Status" },
    { key: "students", label: "Students", render: (r) => `${r.students}/20`, csv: (r) => r.students },
    { key: "activeStudents", label: "Active" },
    { key: "revenue", label: "Revenue", render: (r) => formatMoney(r.revenue), csv: (r) => r.revenue },
    { key: "teacherShare", label: "Teacher 70%", render: (r) => formatMoney(r.teacherShare), csv: (r) => r.teacherShare },
    { key: "classesLogged", label: "Classes logged" },
  ];

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Teachers">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!rows ? <Loading /> : (
        <OwnerTable rows={rows as (TeacherRollup & Record<string, unknown>)[]} cols={cols}
          searchKeys={["name", "status"]} filename="teachers" title="teachers" />
      )}
    </PortalShell>
  );
}
