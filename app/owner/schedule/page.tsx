"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";
import type { ScheduledClass } from "@/lib/supabase/types";
import { ATTENDANCE_LABEL } from "@/lib/attendance";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);
const prettyDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default function OwnerSchedule() {
  const [rows, setRows] = useState<ScheduledClass[] | null>(null);
  const [names, setNames] = useState<{ students: Record<string, string>; teachers: Record<string, string> }>({ students: {}, teachers: {} });
  const [teacher, setTeacher] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) { setRows([]); return; }
    getSupabase().from("scheduled_classes").select("*").order("scheduled_date", { ascending: false }).order("start_time")
      .then(({ data }) => setRows((data as ScheduledClass[]) ?? []));
    loadOwnerData().then((d) => setNames({
      students: Object.fromEntries(d.students.map((s) => [s.id, s.name])),
      teachers: Object.fromEntries(d.teachers.map((t) => [t.id, t.full_name || "Teacher"])),
    }));
  }, []);

  const teacherIds = useMemo(() => [...new Set((rows ?? []).map((r) => r.teacher_id))], [rows]);
  const filtered = (rows ?? []).filter((r) =>
    (!teacher || r.teacher_id === teacher) && (!status || r.status === status) && (!date || r.scheduled_date === date));

  const today = todayISO();
  const todays = (rows ?? []).filter((r) => r.scheduled_date === today);
  const sum = {
    today: todays.length,
    present: todays.filter((r) => r.status === "present").length,
    cancelled: todays.filter((r) => r.status.startsWith("cancelled")).length,
    rescheduled: todays.filter((r) => r.status === "rescheduled").length,
  };

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Schedule">
      {!rows ? <Loading /> : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Today's classes" value={String(sum.today)} />
            <Kpi label="Present today" value={String(sum.present)} />
            <Kpi label="Cancelled today" value={String(sum.cancelled)} />
            <Kpi label="Rescheduled today" value={String(sum.rescheduled)} />
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className={INP}>
              <option value="">All teachers</option>
              {teacherIds.map((id) => <option key={id} value={id}>{names.teachers[id] || "Teacher"}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={INP}>
              <option value="">All statuses</option>
              {Object.entries(ATTENDANCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INP} />
            {(teacher || status || date) && <button onClick={() => { setTeacher(""); setStatus(""); setDate(""); }} className="text-sm font-semibold text-[#7A5E0F]">Clear</button>}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No scheduled classes" hint="Classes teachers schedule from their Schedule page appear here." />
          ) : (
            <div className="space-y-2">
              {filtered.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-white p-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{names.students[r.student_id] || "Student"} <span className="text-ink/50">· {names.teachers[r.teacher_id] || "Teacher"}</span></p>
                    <p className="text-xs text-ink/60">{prettyDate(r.scheduled_date)} · {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)} · {r.mode || "—"}{r.location ? ` · ${r.location}` : ""}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    r.status === "scheduled" ? "bg-gold/15 text-[#7A5E0F]" : r.status === "present" ? "bg-feature-green/12 text-feature-green" : "bg-mist text-ink/60")}>
                    {ATTENDANCE_LABEL[r.status] ?? r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PortalShell>
  );
}

const INP = "rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-hairline bg-white p-4"><p className="text-[11px] font-medium uppercase tracking-wide text-ink/60">{label}</p><p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p></div>;
}
