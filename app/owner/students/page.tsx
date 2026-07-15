"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney } from "@/components/portal/kit";
import { OwnerTable, type Col } from "@/components/portal/OwnerTable";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";

interface Row extends Record<string, unknown> {
  id: string; code: string; teacher_id: string; name: string; instrument: string; level: string; status: string;
  fee: number | null; days: string; parent: string; phone: string; email: string;
}
interface TeacherOpt { id: string; name: string }

export default function OwnerStudents() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [teachers, setTeachers] = useState<TeacherOpt[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadOwnerData().then((d) => {
      setErr(d.error);
      setTeachers(d.teachers.map((t) => ({ id: t.id, name: t.full_name || "Unnamed teacher" })));
      setRows(d.students.map((s) => ({
        id: s.id, code: s.student_code ?? "-", teacher_id: s.teacher_id ?? "",
        name: s.name, instrument: s.instrument ?? "-", level: s.level ?? "-", status: s.status,
        fee: s.fee_quoted, days: s.class_day ?? "-", parent: s.parent_name ?? "-", phone: s.parent_phone ?? "-",
        email: s.parent_email ?? "-",
      })));
    });
  }, []);

  async function assign(studentId: string, teacherId: string) {
    setErr(null);
    setBusyId(studentId);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: studentId, teacher_id: teacherId || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setRows((prev) => prev && prev.map((r) => (r.id === studentId ? { ...r, teacher_id: teacherId } : r)));
        setSavedId(studentId);
        setTimeout(() => setSavedId((v) => (v === studentId ? null : v)), 2000);
      } else {
        setErr(data.error || "Could not assign the teacher.");
      }
    } catch {
      setErr("Could not reach the server. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const cols: Col<Row>[] = [
    { key: "code", label: "Code", render: (r) => <span className="whitespace-nowrap font-mono text-xs">{r.code}</span> },
    { key: "name", label: "Student" },
    {
      key: "teacher_id", label: "Teacher",
      csv: (r) => teachers.find((t) => t.id === r.teacher_id)?.name ?? "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <select
            value={teachers.some((t) => t.id === r.teacher_id) ? r.teacher_id : ""}
            disabled={busyId === r.id}
            onChange={(e) => assign(r.id, e.target.value)}
            className="min-w-[150px] rounded-lg border border-hairline bg-white px-2.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none disabled:opacity-50"
          >
            <option value="">Assign a teacher…</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {busyId === r.id && <span className="text-xs text-ink/50">Saving…</span>}
          {savedId === r.id && <span className="text-xs font-semibold text-feature-green">Assigned</span>}
        </div>
      ),
    },
    { key: "instrument", label: "Instrument" },
    { key: "level", label: "Level" },
    { key: "status", label: "Status" },
    { key: "fee", label: "Fee", render: (r) => (r.fee ? formatMoney(r.fee) : "-"), csv: (r) => r.fee ?? "" },
    { key: "days", label: "Days" },
    { key: "parent", label: "Parent" },
    { key: "phone", label: "Phone" },
  ];

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Students">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {teachers.length === 0 && rows && rows.length > 0 && (
        <div className="mb-4 rounded-xl border border-gold/40 bg-gold/[0.06] p-3 text-sm text-ink/70">
          No teacher logins yet. Add a teacher first, then you can assign students to them here.
        </div>
      )}
      {!rows ? <Loading /> : (
        <OwnerTable rows={rows} cols={cols} searchKeys={["name", "code", "parent", "phone", "email", "instrument"]} filename="students" title="students" />
      )}
    </PortalShell>
  );
}
