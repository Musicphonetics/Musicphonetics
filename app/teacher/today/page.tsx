"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { ScheduledClass, ClassUpdate, StudentStat } from "@/lib/supabase/types";
import { ATTENDANCE_LABEL } from "@/lib/attendance";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);
const dow = () => new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
const prettyDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default function TeacherToday() {
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledClass[]>([]);
  const [upcoming, setUpcoming] = useState<ClassUpdate[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setStudents([]); return; }
    const sb = getSupabase();
    const today = todayISO();
    loadRoster().then(({ rows }) => setStudents(rows));
    sb.from("scheduled_classes").select("*").gte("scheduled_date", today).order("scheduled_date").order("start_time")
      .then(({ data }) => setScheduled((data as ScheduledClass[]) ?? []));
    sb.from("class_updates").select("*").gte("next_class_date", today).order("next_class_date").limit(20)
      .then(({ data }) => setUpcoming((data as ClassUpdate[]) ?? []));
  }, []);

  const nameOf = useMemo(() => {
    const m: Record<string, { name: string; code: string | null; instrument: string | null }> = {};
    for (const s of students ?? []) m[s.student_id] = { name: s.name, code: s.student_code ?? null, instrument: s.instrument };
    return m;
  }, [students]);

  const today = todayISO();
  const todays = scheduled.filter((s) => s.scheduled_date === today);
  const later = scheduled.filter((s) => s.scheduled_date > today);
  // Upcoming next-class dates from class updates (dedupe by student, future only)
  const nextByStudent = new Map<string, string>();
  for (const c of upcoming) if (c.next_class_date && c.next_class_date >= today && !nextByStudent.has(c.student_id)) nextByStudent.set(c.student_id, c.next_class_date);

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Today's classes">
      {!students ? <Loading /> : (
        <div className="space-y-5">
          <p className="text-sm text-ink/60">{dow()}</p>

          <Section title={`Today (${todays.length})`}>
            {todays.length === 0 ? (
              <Empty text="No classes scheduled for today. Use Class Update to log one." />
            ) : todays.map((s) => <SchedCard key={s.id} s={s} info={nameOf[s.student_id]} />)}
          </Section>

          {later.length > 0 && (
            <Section title="Upcoming (scheduled)">
              {later.slice(0, 20).map((s) => <SchedCard key={s.id} s={s} info={nameOf[s.student_id]} />)}
            </Section>
          )}

          {nextByStudent.size > 0 && (
            <Section title="Next class per student">
              {[...nextByStudent.entries()].map(([sid, date]) => (
                <div key={sid} className="flex items-center justify-between rounded-2xl border border-hairline bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{nameOf[sid]?.name || "Student"}</p>
                    <p className="text-xs text-ink/60">{nameOf[sid]?.instrument || "-"}{nameOf[sid]?.code ? ` · ${nameOf[sid]?.code}` : ""}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#7A5E0F]">{prettyDate(date)}</span>
                </div>
              ))}
            </Section>
          )}

          <Link href="/teacher/class-update" className="flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-paper">
            + Log a class
          </Link>
        </div>
      )}
    </PortalShell>
  );
}

function SchedCard({ s, info }: { s: ScheduledClass; info?: { name: string; code: string | null; instrument: string | null } }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{info?.name || "Student"}</p>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", s.status === "scheduled" ? "bg-gold/15 text-[#7A5E0F]" : "bg-mist text-ink/60")}>{ATTENDANCE_LABEL[s.status] ?? s.status}</span>
      </div>
      <p className="mt-0.5 text-xs text-ink/60">
        {s.start_time?.slice(0, 5)}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""} · {s.mode || "—"}{s.location ? ` · ${s.location}` : ""}
        {info?.code ? ` · ${info.code}` : ""}
      </p>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">{title}</p><div className="space-y-2.5">{children}</div></div>;
}
function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-hairline bg-paper p-5 text-sm text-ink/55">{text}</p>;
}
