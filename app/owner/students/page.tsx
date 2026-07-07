"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney } from "@/components/portal/kit";
import { OwnerTable, type Col } from "@/components/portal/OwnerTable";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";

interface Row extends Record<string, unknown> {
  name: string; teacher: string; instrument: string; level: string; status: string;
  fee: number | null; days: string; parent: string; phone: string;
}

export default function OwnerStudents() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadOwnerData().then((d) => {
      setErr(d.error);
      const tName = new Map(d.teachers.map((t) => [t.id, t.full_name || "—"]));
      setRows(d.students.map((s) => ({
        name: s.name, teacher: tName.get(s.teacher_id) ?? "—",
        instrument: s.instrument ?? "—", level: s.level ?? "—", status: s.status,
        fee: s.fee_quoted, days: s.class_day ?? "—", parent: s.parent_name ?? "—", phone: s.parent_phone ?? "—",
      })));
    });
  }, []);

  const cols: Col<Row>[] = [
    { key: "name", label: "Student" },
    { key: "teacher", label: "Teacher" },
    { key: "instrument", label: "Instrument" },
    { key: "level", label: "Level" },
    { key: "status", label: "Status" },
    { key: "fee", label: "Fee", render: (r) => (r.fee ? formatMoney(r.fee) : "—"), csv: (r) => r.fee ?? "" },
    { key: "days", label: "Days" },
    { key: "parent", label: "Parent" },
    { key: "phone", label: "Phone" },
  ];

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Students">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!rows ? <Loading /> : (
        <OwnerTable rows={rows} cols={cols} searchKeys={["name", "teacher", "instrument", "phone"]} filename="students" title="students" />
      )}
    </PortalShell>
  );
}
