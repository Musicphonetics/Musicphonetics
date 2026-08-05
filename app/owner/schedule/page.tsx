"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { CalendarView, type CalEvent } from "@/components/portal/CalendarView";
import { CalendarSubscribe } from "@/components/portal/CalendarSubscribe";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";
import type { ScheduledClass } from "@/lib/supabase/types";
import { ATTENDANCE_LABEL } from "@/lib/attendance";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toLocaleDateString("en-CA");
const prettyDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const isMissing = (m?: string) => !!m && /relation|does not exist|schema cache|column/i.test(m);

interface Opt { id: string; name: string }
interface EventRow { id: string; teacher_id: string; title: string; event_date: string; start_time: string | null; end_time: string | null; location: string | null }

export default function OwnerSchedule() {
  const [rows, setRows] = useState<ScheduledClass[] | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [teachersList, setTeachersList] = useState<Opt[]>([]);
  const [studentsList, setStudentsList] = useState<Opt[]>([]);
  const [names, setNames] = useState<{ students: Record<string, string>; teachers: Record<string, string> }>({ students: {}, teachers: {} });
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [teacher, setTeacher] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  async function loadAll() {
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    const [sc, ev, prof] = await Promise.all([
      sb.from("scheduled_classes").select("*").order("scheduled_date", { ascending: false }).order("start_time"),
      sb.from("calendar_events").select("*").order("event_date", { ascending: false }),
      user ? sb.from("profiles").select("calendar_token").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setRows((sc.data as ScheduledClass[]) ?? []);
    if (!isMissing(ev.error?.message)) setEvents((ev.data as EventRow[]) ?? []);
    setToken((prof.data as { calendar_token?: string } | null)?.calendar_token ?? null);
    const d = await loadOwnerData();
    setTeachersList(d.teachers.map((t) => ({ id: t.id, name: t.full_name || "Teacher" })));
    setStudentsList(d.students.map((s) => ({ id: s.id, name: s.name })));
    setNames({
      students: Object.fromEntries(d.students.map((s) => [s.id, s.name])),
      teachers: Object.fromEntries(d.teachers.map((t) => [t.id, t.full_name || "Teacher"])),
    });
  }

  useEffect(() => { if (!isSupabaseConfigured()) { setRows([]); return; } loadAll(); }, []);

  const calEvents: CalEvent[] = useMemo(() => {
    const out: CalEvent[] = [];
    for (const r of rows ?? []) out.push({
      id: `c-${r.id}`, date: r.scheduled_date, start: r.start_time, end: r.end_time,
      title: names.students[r.student_id] || "Class", sub: names.teachers[r.teacher_id] || "Teacher",
      kind: "class", cancelled: String(r.status || "").startsWith("cancelled"),
    });
    for (const e of events) out.push({
      id: `e-${e.id}`, date: e.event_date, start: e.start_time, end: e.end_time,
      title: e.title, sub: names.teachers[e.teacher_id] || "Teacher", kind: "event",
    });
    return out;
  }, [rows, events, names]);

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

          <div className="mb-5"><CalendarSubscribe token={token} who="every teacher's" /></div>

          <AddToCalendar teachers={teachersList} students={studentsList} onDone={loadAll} />

          <div className="mb-4 mt-6 inline-flex rounded-full border border-hairline bg-white p-1">
            {(["calendar", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={cn("rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition", view === v ? "bg-ink text-paper" : "text-ink/60 hover:text-ink")}>
                {v}
              </button>
            ))}
          </div>

          {view === "calendar" ? (
            <CalendarView events={calEvents} initialView="month" />
          ) : (
            <>
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
                <EmptyState title="No scheduled classes" hint="Classes teachers schedule, and anything you add above, appear here." />
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
        </>
      )}
    </PortalShell>
  );
}

// Owner-only: drop a class or a free-form event into any teacher's calendar.
function AddToCalendar({ teachers, students, onDone }: { teachers: Opt[]; students: Opt[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"class" | "event">("event");
  const [tId, setTId] = useState("");
  const [sId, setSId] = useState("");
  const [title, setTitle] = useState("");
  const [d, setD] = useState(todayISO());
  const [st, setSt] = useState("16:00");
  const [en, setEn] = useState("17:00");
  const [mode, setMode] = useState("Online");
  const [loc, setLoc] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setMsg(null);
    if (!tId) { setMsg({ ok: false, text: "Pick a teacher." }); return; }
    if (kind === "class" && !sId) { setMsg({ ok: false, text: "Pick a student for a class." }); return; }
    if (kind === "event" && !title.trim()) { setMsg({ ok: false, text: "Give the event a title." }); return; }
    setBusy(true);
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    const created_by = user?.id ?? null;
    const err = kind === "class"
      ? (await sb.from("scheduled_classes").insert({ teacher_id: tId, student_id: sId, scheduled_date: d, start_time: st, end_time: en, mode, location: loc || null, status: "scheduled", created_by })).error
      : (await sb.from("calendar_events").insert({ teacher_id: tId, title: title.trim(), event_date: d, start_time: st, end_time: en, location: loc || null, created_by })).error;
    setBusy(false);
    if (err) { setMsg({ ok: false, text: isMissing(err.message) ? "Run supabase/calendar_feed.sql first to enable events." : err.message }); return; }
    setMsg({ ok: true, text: `Added to ${teachers.find((t) => t.id === tId)?.name || "the teacher"}'s calendar.` });
    setTitle(""); setSId("");
    onDone();
  }

  return (
    <div className="rounded-2xl border border-hairline bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Add to a teacher&apos;s calendar</p>
          <p className="mt-0.5 text-sm text-ink/60">Schedule a class, or drop in a meeting/note. It shows in their portal and syncs to their phone.</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="shrink-0 rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-mist">
          {open ? "Close" : "New +"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="inline-flex rounded-full border border-hairline p-1">
            {(["event", "class"] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)}
                className={cn("rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition", kind === k ? "bg-ink text-paper" : "text-ink/60 hover:text-ink")}>
                {k === "event" ? "Event / note" : "Class"}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LBL}>Teacher</span>
              <select value={tId} onChange={(e) => setTId(e.target.value)} className={INP + " w-full"}>
                <option value="">Choose a teacher…</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            {kind === "class" ? (
              <label className="block">
                <span className={LBL}>Student</span>
                <select value={sId} onChange={(e) => setSId(e.target.value)} className={INP + " w-full"}>
                  <option value="">Choose a student…</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
            ) : (
              <label className="block">
                <span className={LBL}>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Team meeting, reminder…" className={INP + " w-full"} />
              </label>
            )}
            <label className="block"><span className={LBL}>Date</span><input type="date" value={d} onChange={(e) => setD(e.target.value)} className={INP + " w-full"} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className={LBL}>Start</span><input type="time" value={st} onChange={(e) => setSt(e.target.value)} className={INP + " w-full"} /></label>
              <label className="block"><span className={LBL}>End</span><input type="time" value={en} onChange={(e) => setEn(e.target.value)} className={INP + " w-full"} /></label>
            </div>
            {kind === "class" && (
              <label className="block"><span className={LBL}>Mode</span>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className={INP + " w-full"}>
                  <option>Online</option><option>At home</option><option>At studio</option>
                </select>
              </label>
            )}
            <label className="block"><span className={LBL}>Location {kind === "event" ? "" : "(optional)"}</span><input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Optional" className={INP + " w-full"} /></label>
          </div>

          {msg && <p className={cn("rounded-lg border p-2.5 text-sm", msg.ok ? "border-feature-green/30 bg-feature-green/10 text-feature-green" : "border-red-300 bg-red-50 text-red-700")}>{msg.text}</p>}
          <button onClick={save} disabled={busy} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-[#0f131c] disabled:opacity-50">
            {busy ? "Adding…" : "Add to calendar"}
          </button>
        </div>
      )}
    </div>
  );
}

const INP = "rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
const LBL = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/55";
function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-hairline bg-white p-4"><p className="text-[11px] font-medium uppercase tracking-wide text-ink/60">{label}</p><p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p></div>;
}
