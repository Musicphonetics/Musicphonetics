"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { ReportCard } from "@/components/portal/ReportCard";
import { MonthlyReportDoc } from "@/components/portal/MonthlyReportDoc";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import type { StudentReport } from "@/lib/supabase/types";
import { buildReport } from "@/lib/report";
import { printDoc } from "@/lib/print";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";

export default function ParentReports() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [published, setPublished] = useState<StudentReport[]>([]);

  const reload = () => loadParentData().then((d) => { setErr(d.error); setData(d); });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
    // Curated, owner-published monthly reports (RLS: only this family's, published).
    getSupabase().from("student_reports").select("*").eq("status", "published").order("report_month", { ascending: false })
      .then(({ data }) => setPublished((data as StudentReport[]) ?? []));
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const studentReports = useMemo(() => published.filter((r) => r.student_id === student?.id), [published, student]);
  const report = useMemo(() => {
    if (!data || !student) return null;
    return buildReport(data.classes.filter((c) => c.student_id === student.id));
  }, [data, student]);
  const switcher = data && data.students.length > 0
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Progress report" headerRight={switcher}>
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : student && report ? (
        <div className="space-y-4">
          {/* Curated monthly reports published by the office */}
          {studentReports.length > 0 && (
            <div className="space-y-4">
              {studentReports.map((r) => (
                <MonthlyReportDoc key={r.id} report={r} studentName={student.name} studentCode={student.student_code}
                  teacherName={data.teachers[student.teacher_id] || "Your teacher"} />
              ))}
              <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink/45">Live snapshot</p>
            </div>
          )}

          {report.totalCompleted === 0 ? (
            <EmptyState title="No report yet" hint="Your child's progress report builds automatically as classes are completed." />
          ) : (
            <>
              <ReportCard
                student={{ id: student.id, name: student.name, instrument: student.instrument, level: student.level, classes_per_month: student.classes_per_month }}
                teacherName={data.teachers[student.teacher_id] || "Your teacher"}
                report={report}
              />
              <div className="flex justify-center">
                <button onClick={() => printDoc("report-doc")}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
                  Print / Save as PDF
                </button>
              </div>
            </>
          )}
        </div>
      ) : <Loading />}
    </PortalShell>
  );
}
