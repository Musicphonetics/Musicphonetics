"use client";

import { printDoc } from "@/lib/print";
import type { StudentReport } from "@/lib/supabase/types";
import { PLAN_LABEL, type Plan } from "@/lib/plan";

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

// Printable curated monthly report (teacher-written, owner-published).
export function MonthlyReportDoc({
  report: r, studentName, studentCode, teacherName,
}: { report: StudentReport; studentName: string; studentCode?: string | null; teacherName?: string | null }) {
  const domId = `report-doc-${r.id}`;
  const plan = (r.plan as Plan) || null;
  return (
    <div className="mx-auto max-w-2xl">
      <div id={domId} className="rounded-2xl border border-hairline bg-white p-7 shadow-card sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-ink">MUSICPHONETICS</p>
            <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A5E0F]">Monthly Progress Report</p>
            <p className="mt-1 text-xs text-ink/65">{monthLabel(r.report_month)}</p>
          </div>
          <div className="text-right text-[11px] leading-relaxed text-ink/70">
            <p>Student: <span className="font-semibold text-ink">{studentName}</span></p>
            {studentCode && <p>Code: <span className="font-mono font-semibold text-ink">{studentCode}</span></p>}
            {teacherName && <p>Teacher: <span className="font-semibold text-ink">{teacherName}</span></p>}
          </div>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-3">
          {plan && <F label="Plan" value={PLAN_LABEL[plan]} />}
          {r.instrument && <F label="Instrument" value={r.instrument} />}
          <F label="Classes" value={`${r.classes_completed ?? 0}${r.classes_scheduled != null ? ` / ${r.classes_scheduled}` : ""} completed`} />
          {r.attendance_percent != null && <F label="Attendance" value={`${r.attendance_percent}%`} />}
          {r.homework_completion && <F label="Homework" value={r.homework_completion} />}
        </div>

        <Block title="Topics covered" body={r.topics_covered} />
        <Block title="Skills improved" body={r.skills_improved} />
        <Block title="Teacher's comments" body={r.teacher_comments} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Panel title="This month's goal" body={r.current_goal} />
          <Panel title="Goal outcome" body={r.goal_outcome} />
          <Panel title="Next month's goal" body={r.next_goal} />
          <Panel title="Areas needing attention" body={r.attention_areas} />
        </div>
        {r.director_note && (
          <div className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.06] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A5E0F]">A note from the Director</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{r.director_note}</p>
          </div>
        )}

        <div className="mt-6 border-t border-hairline pt-4">
          <p className="font-display text-sm font-semibold text-[#7A5E0F]">Abhishek Kumar</p>
          <p className="text-xs text-ink/60">Founder &amp; Director, Musicphonetics</p>
        </div>
      </div>

      <div className="no-print mt-5 flex justify-center">
        <button onClick={() => printDoc(domId)} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-[#0f131c]">
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/55">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
function Block({ title, body }: { title: string; body: string | null }) {
  if (!body?.trim()) return null;
  return (
    <div className="mt-5">
      <h3 className="mb-1.5 font-display text-base font-semibold text-ink">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{body}</p>
    </div>
  );
}
function Panel({ title, body }: { title: string; body: string | null }) {
  if (!body?.trim()) return null;
  return (
    <div className="rounded-xl border border-hairline bg-paper p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink/80">{body}</p>
    </div>
  );
}
