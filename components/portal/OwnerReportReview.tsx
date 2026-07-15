"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";
import { MonthlyReportDoc } from "@/components/portal/MonthlyReportDoc";
import type { StudentReport } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface Info { name: string; code: string | null; parent_id: string | null }

// Owner reviews teacher-submitted monthly reports and publishes them. Publishing
// makes the report visible to the family and notifies them.
export function OwnerReportReview() {
  const [reports, setReports] = useState<StudentReport[] | null>(null);
  const [info, setInfo] = useState<Record<string, Info>>({});
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<StudentReport | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    const [{ data }, owner] = await Promise.all([
      getSupabase().from("student_reports").select("*").in("status", ["submitted", "published"]).order("report_month", { ascending: false }),
      loadOwnerData(),
    ]);
    const im: Record<string, Info> = {};
    for (const s of owner.students) im[s.id] = { name: s.name, code: s.student_code ?? null, parent_id: s.parent_id ?? null };
    const tn: Record<string, string> = {};
    for (const t of owner.teachers) tn[t.id] = t.full_name || "Teacher";
    setInfo(im); setTeacherNames(tn);
    setReports((data as StudentReport[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function publish(r: StudentReport) {
    setBusyId(r.id); setNote(null);
    // Publishing is a sensitive action: it goes through the owner-only
    // mp_publish_report function, which also notifies the family and writes an
    // authoritative (server-side) audit entry.
    const { error } = await getSupabase().rpc("mp_publish_report", { p_report_id: r.id });
    if (error) { setBusyId(null); setNote(error.message); return; }
    setBusyId(null);
    load();
  }

  const submitted = (reports ?? []).filter((r) => r.status === "submitted");
  const published = (reports ?? []).filter((r) => r.status === "published");

  if (!reports) return null;
  if (reports.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-hairline bg-white p-5">
      <p className="font-display text-lg font-semibold text-ink">Monthly report cards</p>
      {note && <p className="mt-1 text-sm text-red-600">{note}</p>}

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Awaiting your review ({submitted.length})</p>
      {submitted.length === 0 ? <p className="mt-1 text-sm text-ink/55">Nothing to review.</p> : (
        <div className="mt-2 space-y-2">
          {submitted.map((r) => (
            <Row key={r.id} r={r} info={info[r.student_id]} teacher={teacherNames[r.teacher_id]} onPreview={() => setPreview(r)}
              action={<button disabled={busyId === r.id} onClick={() => publish(r)}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-paper disabled:opacity-50">{busyId === r.id ? "Publishing…" : "Publish"}</button>} />
          ))}
        </div>
      )}

      {published.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/55">Published ({published.length})</p>
          <div className="mt-2 space-y-2">
            {published.map((r) => (
              <Row key={r.id} r={r} info={info[r.student_id]} teacher={teacherNames[r.teacher_id]} onPreview={() => setPreview(r)}
                action={<span className="text-xs font-semibold text-feature-green">Live</span>} />
            ))}
          </div>
        </>
      )}

      {preview && (
        <div className="fixed inset-0 z-[70] grid place-items-start overflow-y-auto bg-charcoal/50 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl py-6">
            <div className="mb-3 flex justify-end"><button onClick={() => setPreview(null)} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink shadow">Close</button></div>
            <MonthlyReportDoc report={preview} studentName={info[preview.student_id]?.name || "Student"} studentCode={info[preview.student_id]?.code} teacherName={teacherNames[preview.teacher_id]} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ r, info, teacher, onPreview, action }: { r: StudentReport; info?: Info; teacher?: string; onPreview: () => void; action: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-paper p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{info?.name || "Student"} <span className="ml-1 font-mono text-xs text-ink/50">{info?.code || ""}</span></p>
        <p className="text-xs text-ink/60">{r.report_month} · {teacher || "Teacher"}{info?.parent_id ? "" : " · no family login yet"}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onPreview} className={cn("text-xs font-semibold text-[#7A5E0F]")}>Preview</button>
        {action}
      </div>
    </div>
  );
}
