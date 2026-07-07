"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { OwnerTable, type Col } from "@/components/portal/OwnerTable";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import type { ClassUpdate, Student, Profile } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

function monthBounds(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const start = new Date(y, m - 1, 1).toISOString().slice(0, 10);
  const end = new Date(y, m, 1).toISOString().slice(0, 10); // exclusive
  return { start, end };
}
const thisMonth = () => new Date().toISOString().slice(0, 7);

interface Row extends Record<string, unknown> {
  date: string; teacher: string; student: string; instrument: string;
  status: string; taught: string; homework: string; response: string; parent: string; notes: string;
}

export default function OwnerReports() {
  const [ym, setYm] = useState(thisMonth());
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    setRows(null); setErr(null);
    const sb = getSupabase();
    const { start, end } = monthBounds(ym);
    (async () => {
      const [cRes, sRes, tRes] = await Promise.all([
        sb.from("class_updates").select("*").gte("class_date", start).lt("class_date", end).order("class_date"),
        sb.from("students").select("id,name,teacher_id,instrument,level"),
        sb.from("profiles").select("id,full_name").eq("role", "teacher"),
      ]);
      if (cRes.error) { setErr(cRes.error.message); setRows([]); return; }
      const sName = new Map((sRes.data as Student[] ?? []).map((s) => [s.id, s]));
      const tName = new Map((tRes.data as Profile[] ?? []).map((t) => [t.id, t.full_name || "-"]));
      setRows((cRes.data as ClassUpdate[] ?? []).map((c) => ({
        date: c.class_date,
        teacher: tName.get(c.teacher_id) ?? "-",
        student: sName.get(c.student_id)?.name ?? "-",
        instrument: sName.get(c.student_id)?.instrument ?? "-",
        status: c.class_status,
        taught: c.taught ?? "",
        homework: c.homework ?? "",
        response: c.student_response ?? "",
        parent: c.parent_feedback ?? "",
        notes: c.teacher_notes ?? "",
      })));
    })();
  }, [ym]);

  const summary = useMemo(() => {
    const r = rows ?? [];
    const byTeacher = new Map<string, number>();
    const students = new Set<string>();
    let completed = 0;
    for (const x of r) {
      byTeacher.set(x.teacher, (byTeacher.get(x.teacher) ?? 0) + 1);
      students.add(x.student);
      if (x.status === "Completed") completed++;
    }
    return { total: r.length, completed, teachers: byTeacher, students: students.size };
  }, [rows]);

  const cols: Col<Row>[] = [
    { key: "date", label: "Date" },
    { key: "teacher", label: "Teacher" },
    { key: "student", label: "Student" },
    { key: "instrument", label: "Instrument" },
    { key: "status", label: "Status" },
    { key: "taught", label: "What was taught" },
    { key: "homework", label: "Homework" },
    { key: "response", label: "Student response" },
    { key: "parent", label: "Parent feedback" },
    { key: "notes", label: "Teacher notes" },
  ];

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Monthly reports">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink/70">Month</label>
        <input type="month" value={ym} max={thisMonth()} onChange={(e) => setYm(e.target.value)}
          className="rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        <p className="text-sm text-ink/60">A full log of what every teacher taught, exportable to Excel/CSV.</p>
      </div>

      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!rows ? <Loading /> : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Classes logged" value={String(summary.total)} />
            <Kpi label="Completed" value={String(summary.completed)} />
            <Kpi label="Students taught" value={String(summary.students)} />
            <Kpi label="Active teachers" value={String(summary.teachers.size)} />
          </div>

          {summary.teachers.size > 0 && (
            <div className="mb-6 rounded-2xl border border-hairline bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-ink">Classes per teacher</p>
              <div className="flex flex-wrap gap-2">
                {[...summary.teachers.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => (
                  <span key={t} className="rounded-full border border-hairline bg-paper px-3 py-1 text-sm text-ink/80">
                    {t}: <b className="text-ink">{n}</b>
                  </span>
                ))}
              </div>
            </div>
          )}

          <OwnerTable rows={rows} cols={cols} searchKeys={["teacher", "student", "instrument", "taught"]}
            filename={`musicphonetics-report-${ym}`} title="the monthly log" />
        </>
      )}
    </PortalShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-2xl border border-hairline bg-white p-4")}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink/60">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
