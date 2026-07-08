"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney } from "@/components/portal/kit";
import { OwnerTable, type Col } from "@/components/portal/OwnerTable";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";

interface Row extends Record<string, unknown> {
  date: string; student: string; teacher: string; amount: number;
  teacher70: number; company30: number; status: string; bill: string;
}

export default function OwnerPayments() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadOwnerData().then((d) => {
      setErr(d.error);
      const tName = new Map(d.teachers.map((t) => [t.id, t.full_name || "-"]));
      const sName = new Map(d.students.map((s) => [s.id, s.name]));
      setRows(d.payments.map((p) => ({
        date: p.payment_date, student: sName.get(p.student_id) ?? "-", teacher: tName.get(p.teacher_id) ?? "-",
        amount: p.amount_paid, teacher70: p.teacher_share, company30: p.company_share,
        status: p.payment_status, bill: p.cashfree_bill_no ?? "-",
      })));
    });
  }, []);

  const cols: Col<Row>[] = [
    { key: "date", label: "Date" },
    { key: "student", label: "Student" },
    { key: "teacher", label: "Teacher" },
    { key: "amount", label: "Amount", render: (r) => formatMoney(r.amount), csv: (r) => r.amount },
    { key: "teacher70", label: "Teacher 70%", render: (r) => formatMoney(r.teacher70), csv: (r) => r.teacher70 },
    { key: "company30", label: "Company 30%", render: (r) => formatMoney(r.company30), csv: (r) => r.company30 },
    { key: "status", label: "Status" },
    { key: "bill", label: "Payment reference" },
  ];

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Payments">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!rows ? <Loading /> : (
        <OwnerTable rows={rows} cols={cols} searchKeys={["student", "teacher", "bill", "status"]} filename="payments" title="payments" />
      )}
    </PortalShell>
  );
}
