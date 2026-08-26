"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { OwnerTable, type Col } from "@/components/portal/OwnerTable";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";
import { studentPlan, PLAN_LABEL, type Plan } from "@/lib/plan";

interface Row extends Record<string, unknown> {
  id: string; code: string; teacher_id: string; name: string; instrument: string; level: string; status: string;
  fee: number | null; days: string; parent: string; phone: string; email: string; plan: Plan;
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
        plan: studentPlan({ plan: (s as { plan?: string | null }).plan, fee_quoted: s.fee_quoted }),
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

  // Owner-only: set the student's commercial program. Teachers see this
  // read-only; only the office changes it here.
  async function setPlan(studentId: string, plan: Plan) {
    setBusyId(studentId); setErr(null);
    const { error } = await getSupabase().from("students").update({ plan }).eq("id", studentId);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setRows((prev) => prev && prev.map((r) => (r.id === studentId ? { ...r, plan } : r)));
    setSavedId(studentId);
    setTimeout(() => setSavedId((v) => (v === studentId ? null : v)), 2000);
  }

  // Owner override: the teacher confirms the fee, but the owner can change it.
  async function setFee(studentId: string, raw: string) {
    const digits = raw.replace(/[^\d]/g, "");
    const fee = digits ? Math.round(Number(digits)) : null;
    setBusyId(studentId); setErr(null);
    const { error } = await getSupabase().from("students").update({ fee_quoted: fee }).eq("id", studentId);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setRows((prev) => prev && prev.map((r) => (r.id === studentId ? { ...r, fee } : r)));
    setSavedId(studentId);
    setTimeout(() => setSavedId((v) => (v === studentId ? null : v)), 2000);
  }

  const cols: Col<Row>[] = [
    { key: "code", label: "Code", render: (r) => <span className="whitespace-nowrap font-mono text-xs">{r.code}</span> },
    { key: "name", label: "Student" },
    {
      key: "plan", label: "Program",
      csv: (r) => PLAN_LABEL[r.plan],
      render: (r) => (
        <select value={r.plan} disabled={busyId === r.id} onChange={(e) => setPlan(r.id, e.target.value as Plan)}
          className="min-w-[140px] rounded-lg border border-hairline bg-white px-2.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none disabled:opacity-50">
          {(["foundation", "main", "directors"] as Plan[]).map((p) => <option key={p} value={p}>{PLAN_LABEL[p]}</option>)}
        </select>
      ),
    },
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
    {
      key: "fee", label: "Fee / month", csv: (r) => r.fee ?? "",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink/40">₹</span>
          <input key={`${r.id}-${r.fee ?? ""}`} type="text" inputMode="numeric" defaultValue={r.fee ?? ""}
            disabled={busyId === r.id} placeholder="-"
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            onBlur={(e) => { const v = e.target.value.replace(/[^\d]/g, ""); if (v !== String(r.fee ?? "")) setFee(r.id, v); }}
            className="w-24 rounded-lg border border-hairline bg-white px-2.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none disabled:opacity-50" />
          {savedId === r.id && <span className="text-[11px] font-semibold text-feature-green">Saved</span>}
        </div>
      ),
    },
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
