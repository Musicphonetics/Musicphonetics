"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney } from "@/components/portal/kit";
import { ReportCardModal, type ReportStudent } from "@/components/portal/ReportCard";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadOwnerData, type OwnerData } from "@/lib/supabase/owner";
import { cn } from "@/lib/utils";

export default function OwnerTeachers() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null); // selected teacher id
  const [q, setQ] = useState("");
  const [report, setReport] = useState<{ student: ReportStudent; teacherName: string } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadOwnerData().then((d) => { setErr(d.error); setData(d); });
  }, []);

  // Completed classes per student (for report-card counts).
  const completed = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of data?.classes ?? []) if (c.class_status === "Completed") m.set(c.student_id, (m.get(c.student_id) ?? 0) + 1);
    return m;
  }, [data]);

  const teachers = useMemo(() => {
    const list = (data?.teachers ?? []).map((t) => {
      const students = (data?.students ?? []).filter((s) => s.teacher_id === t.id);
      const pays = (data?.payments ?? []).filter((p) => p.teacher_id === t.id);
      return {
        t,
        students,
        activeStudents: students.filter((s) => s.status === "active").length,
        revenue: pays.reduce((a, p) => a + (p.amount_paid ?? 0), 0),
        classesLogged: (data?.classes ?? []).filter((c) => c.teacher_id === t.id).length,
      };
    });
    const needle = q.trim().toLowerCase();
    return needle ? list.filter((x) => (x.t.full_name ?? "").toLowerCase().includes(needle)) : list;
  }, [data, q]);

  const selected = teachers.find((x) => x.t.id === sel) || null;

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Teachers">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : selected ? (
        /* ---- Drill-down: one teacher and their students ---- */
        <div>
          <button onClick={() => setSel(null)} className="mb-4 text-sm font-semibold text-ink/70 hover:text-ink">← All teachers</button>
          <div className="mb-5 rounded-2xl border border-hairline bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{selected.t.full_name || "(unnamed)"}</h2>
                <p className="mt-0.5 text-sm text-ink/60">
                  {selected.t.email || selected.t.phone || "-"} · {(selected.t.instruments ?? []).join(", ") || "no instruments listed"}
                </p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold",
                selected.t.status === "active" ? "bg-feature-green/10 text-feature-green" : "bg-mist text-ink/60")}>{selected.t.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Kpi label="Students" value={String(selected.students.length)} />
              <Kpi label="Active" value={String(selected.activeStudents)} />
              <Kpi label="Classes logged" value={String(selected.classesLogged)} />
              <Kpi label="Revenue" value={formatMoney(selected.revenue)} />
            </div>
          </div>

          <p className="mb-2 text-sm font-semibold text-ink">Students</p>
          {selected.students.length === 0 ? (
            <p className="rounded-2xl border border-hairline bg-white p-6 text-center text-sm text-ink/55">No students assigned yet.</p>
          ) : (
            <div className="space-y-2.5">
              {selected.students.map((s) => {
                const done = completed.get(s.id) ?? 0;
                return (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-white p-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{s.name}</p>
                      <p className="mt-0.5 text-xs text-ink/60">{s.instrument || "-"} · {s.level || "-"} · {s.status}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">{done} <span className="text-xs font-normal text-ink/55">classes</span></p>
                        <p className="text-[11px] text-ink/50">{Math.floor(done / 8)} report card{Math.floor(done / 8) === 1 ? "" : "s"}</p>
                      </div>
                      <button
                        onClick={() => setReport({ student: { id: s.id, name: s.name, instrument: s.instrument, level: s.level, classes_per_month: s.classes_per_month }, teacherName: selected.t.full_name || "" })}
                        className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-ink">
                        Report card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ---- Teacher list ---- */
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teachers…"
            className="mb-4 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((x) => (
              <button key={x.t.id} onClick={() => setSel(x.t.id)}
                className="rounded-2xl border border-hairline bg-white p-5 text-left transition-shadow hover:shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-ink">{x.t.full_name || "(unnamed)"}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    x.t.status === "active" ? "bg-feature-green/10 text-feature-green" : "bg-mist text-ink/60")}>{x.t.status}</span>
                </div>
                <p className="mt-1 truncate text-xs text-ink/55">{(x.t.instruments ?? []).join(", ") || "-"}</p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-ink/70"><b className="text-ink">{x.students.length}</b> students</span>
                  <span className="text-ink/70"><b className="text-ink">{x.classesLogged}</b> classes</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-[#7A5E0F]">View students &amp; reports →</p>
              </button>
            ))}
          </div>
        </>
      )}

      {report && <ReportCardModal student={report.student} teacherName={report.teacherName} onClose={() => setReport(null)} />}
    </PortalShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper p-3 text-center">
      <p className="font-display text-lg font-semibold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink/55">{label}</p>
    </div>
  );
}
