"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { ClassUpdate } from "@/lib/supabase/types";
import { buildReport, type ProgressReport } from "@/lib/report";
import { printDoc } from "@/lib/print";

export interface ReportStudent {
  id: string;
  name: string;
  instrument: string | null;
  level: string | null;
  classes_per_month: number | null;
}

const pretty = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

// Presentational, printable report card.
export function ReportCard({ student, teacherName, report }: {
  student: ReportStudent; teacherName: string; report: ProgressReport;
}) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const perMonth = student.classes_per_month ?? 8;

  return (
    <div id="report-doc" className="rounded-3xl border border-hairline bg-white p-6 shadow-card sm:p-9">
      {/* Letterhead */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-5">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Musicphonetics</p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[#7A5E0F]">Student Progress Report</p>
        </div>
        <p className="text-xs text-ink/60">Issued: {today}</p>
      </div>

      {/* Student summary */}
      <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <F label="Student" value={student.name} />
        <F label="Teacher" value={teacherName || "-"} />
        <F label="Instrument" value={student.instrument || "-"} />
        <F label="Level" value={student.level || "-"} />
        <F label="Learning since" value={pretty(report.firstClass)} />
        <F label="Latest class" value={pretty(report.lastClass)} />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Classes completed" value={String(report.totalCompleted)} />
        <Stat label="Report cards earned" value={String(report.cyclesCompleted)} hint="every 8 classes" />
        <Stat label="Into current set" value={`${report.classesIntoCycle}/8`} />
        <Stat label="Months" value={String(report.months.length)} />
      </div>

      {report.latestProgress && (
        <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A5E0F]">Where the progress has reached</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/85">{report.latestProgress}</p>
        </div>
      )}

      {/* Cycle milestones */}
      {report.cycles.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 font-display text-base font-semibold text-ink">Milestones</h3>
          <div className="flex flex-wrap gap-2">
            {report.cycles.map((c) => (
              <span key={c.cycle} className="rounded-full border border-hairline bg-paper px-3 py-1 text-xs text-ink/75">
                Report {c.cycle} · {pretty(c.from)} – {pretty(c.to)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Monthly journey - keeps adding month over month */}
      <h3 className="mb-1 mt-7 font-display text-base font-semibold text-ink">Month-by-month</h3>
      {report.months.length === 0 ? (
        <p className="text-sm text-ink/55">No completed classes recorded yet.</p>
      ) : (
        <div className="space-y-5">
          {report.months.map((m) => (
            <div key={m.key} className="rounded-2xl border border-hairline p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-ink">{m.label}</p>
                <p className="text-xs text-ink/55">{m.classes.length} class{m.classes.length === 1 ? "" : "es"}</p>
              </div>
              <ul className="mt-3 space-y-2.5">
                {m.classes.map((e, i) => (
                  <li key={`${m.key}-${i}`} className="border-l-2 border-gold/40 pl-3 text-sm">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink/45">{pretty(e.date)}</p>
                    {e.taught && <p className="text-ink/85"><span className="font-medium text-ink">Taught:</span> {e.taught}</p>}
                    {e.homework && <p className="text-ink/70"><span className="font-medium text-ink">Homework:</span> {e.homework}</p>}
                    {e.response && <p className="text-ink/70"><span className="font-medium text-ink">Response:</span> {e.response}</p>}
                    {!e.taught && !e.homework && !e.response && <p className="text-ink/45">Class completed.</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-7 border-t border-hairline pt-5 text-sm text-ink/70">
        <p>Shared monthly with the family. {perMonth} classes make one teaching cycle; a new report card is earned every {8} classes.</p>
        <p className="mt-4 font-display text-sm font-semibold text-[#7A5E0F]">Musicphonetics · {teacherName || "Faculty"}</p>
      </div>
    </div>
  );
}

// Loads a student's full class history and shows the report card in an overlay.
export function ReportCardModal({ student, teacherName, onClose }: {
  student: ReportStudent; teacherName: string; onClose: () => void;
}) {
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getSupabase()
      .from("class_updates").select("*").eq("student_id", student.id).order("class_date")
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setReport(buildReport((data as ClassUpdate[]) ?? []));
      });
  }, [student.id]);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto my-6 max-w-2xl">
        <div className="no-print mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-paper">{student.name} · report card</p>
          <div className="flex gap-2">
            <button onClick={() => printDoc("report-doc")} disabled={!report}
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-deep-gold disabled:opacity-50">Print / Save PDF</button>
            <button onClick={onClose} className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-paper hover:border-white">Close</button>
          </div>
        </div>
        {err && <div className="no-print mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
        {!report ? (
          <div className="rounded-3xl border border-hairline bg-white p-10 text-center text-ink/50">Building the report…</div>
        ) : (
          <ReportCard student={student} teacherName={teacherName} report={report} />
        )}
      </div>
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-paper p-3 text-center">
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink/55">{label}</p>
      {hint && <p className="text-[10px] text-ink/40">{hint}</p>}
    </div>
  );
}
