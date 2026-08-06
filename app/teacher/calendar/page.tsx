"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { CalendarView, type CalEvent } from "@/components/portal/CalendarView";
import { CalendarSubscribe } from "@/components/portal/CalendarSubscribe";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

const isoDays = (n: number) => new Date(Date.now() + n * 86400000).toLocaleDateString("en-CA");
const isMissing = (m?: string) => !!m && /relation|does not exist|schema cache|column/i.test(m);

export default function TeacherCalendar() {
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setEvents([]); return; }
    (async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setEvents([]); return; }
      const from = isoDays(-90), to = isoDays(180);

      const [prof, cls, evs, logs, studs] = await Promise.all([
        sb.from("profiles").select("calendar_token").eq("id", user.id).maybeSingle(),
        sb.from("scheduled_classes").select("*").gte("scheduled_date", from).lte("scheduled_date", to),
        sb.from("calendar_events").select("*").gte("event_date", from).lte("event_date", to),
        sb.from("class_updates").select("*").gte("class_date", from).lte("class_date", to),
        sb.from("students").select("id,name"),
      ]);

      setToken((prof.data as { calendar_token?: string } | null)?.calendar_token ?? null);
      const sName: Record<string, string> = Object.fromEntries(((studs.data as { id: string; name: string }[]) ?? []).map((s) => [s.id, s.name]));

      const out: CalEvent[] = [];
      for (const c of (cls.data as Record<string, string>[]) ?? []) {
        out.push({
          id: `c-${c.id}`, date: c.scheduled_date, start: c.start_time, end: c.end_time,
          title: sName[c.student_id] || "Class", sub: [c.mode, c.location].filter(Boolean).join(" · "),
          kind: "class", cancelled: String(c.status || "").startsWith("cancelled"),
        });
      }
      if (!isMissing(evs.error?.message)) {
        for (const e of (evs.data as Record<string, string>[]) ?? []) {
          out.push({ id: `e-${e.id}`, date: e.event_date, start: e.start_time, end: e.end_time, title: e.title, sub: e.location || undefined, kind: "event" });
        }
      }
      // Logged classes (Recent classes) also show on the calendar and stay in
      // sync as they're edited.
      for (const u of (logs.data as Record<string, string>[]) ?? []) {
        out.push({
          id: `u-${u.id}`, date: u.class_date, start: u.scheduled_start || null, end: u.scheduled_end || null,
          title: sName[u.student_id] || "Class", sub: [u.class_status, u.taught].filter(Boolean).join(" · ") || undefined,
          kind: "class", cancelled: /cancel|no-show/i.test(u.class_status || ""),
        });
      }
      setEvents(out);
    })();
  }, []);

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Calendar">
      {!events ? <Loading /> : (
        <div className="space-y-5">
          <CalendarSubscribe token={token} who="your" />
          <CalendarView events={events} initialView="month" />
          <div className="flex flex-wrap items-center gap-4 text-xs text-ink/55">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> Class</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-forest" /> Event / note from the office</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ink/30" /> Cancelled</span>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
