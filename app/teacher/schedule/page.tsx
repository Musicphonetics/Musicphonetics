"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, Toast } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { TeacherAvailability, TeacherTimeOff, ScheduledClass, StudentStat } from "@/lib/supabase/types";
import { ATTENDANCE_LABEL } from "@/lib/attendance";
import { logAudit, AUDIT } from "@/lib/audit";
import { cn } from "@/lib/utils";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const prettyDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const overlaps = (aS: string, aE: string, bS: string, bE: string) => aS < bE && bS < aE;

export default function TeacherSchedule() {
  const [uid, setUid] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentStat[]>([]);
  const [avail, setAvail] = useState<TeacherAvailability[] | null>(null);
  const [timeoff, setTimeoff] = useState<TeacherTimeOff[]>([]);
  const [sched, setSched] = useState<ScheduledClass[]>([]);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [edit, setEdit] = useState<{ id: string; date: string; start: string; end: string; mode: string; location: string } | null>(null);

  // availability form
  const [aw, setAw] = useState("1"); const [as1, setAs1] = useState("16:00"); const [ae, setAe] = useState("17:00"); const [am, setAm] = useState("Online");
  // schedule form
  const [ssid, setSsid] = useState(""); const [sdate, setSdate] = useState(todayISO()); const [sst, setSst] = useState("16:00"); const [sen, setSen] = useState("17:00"); const [smode, setSmode] = useState("Online"); const [sloc, setSloc] = useState("");
  const [scount, setScount] = useState("8"); const [filterStudent, setFilterStudent] = useState("");
  // time off form
  const [tS, setTS] = useState(todayISO()); const [tE, setTE] = useState(todayISO()); const [tR, setTR] = useState("");

  async function reload() {
    const sb = getSupabase();
    const [av, to, sc] = await Promise.all([
      sb.from("teacher_availability").select("*").order("weekday").order("start_time"),
      sb.from("teacher_time_off").select("*").order("start_date", { ascending: false }),
      sb.from("scheduled_classes").select("*").gte("scheduled_date", daysAgoISO(400)).order("scheduled_date").order("start_time"),
    ]);
    setAvail((av.data as TeacherAvailability[]) ?? []);
    setTimeoff((to.data as TeacherTimeOff[]) ?? []);
    setSched((sc.data as ScheduledClass[]) ?? []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAvail([]); return; }
    getSupabase().auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
    loadRoster().then(({ rows }) => setStudents(rows));
    reload();
  }, []);

  const nameOf = useMemo(() => Object.fromEntries(students.map((s) => [s.student_id, s.name])), [students]);

  async function addAvail() {
    if (!uid) return;
    const { error } = await getSupabase().from("teacher_availability").insert({ teacher_id: uid, weekday: Number(aw), start_time: as1, end_time: ae, mode: am, active: true });
    if (error) return setToast({ kind: "error", message: error.message });
    setToast({ kind: "success", message: "Availability added." }); reload();
  }
  async function delAvail(id: string) {
    await getSupabase().from("teacher_availability").delete().eq("id", id); reload();
  }

  // Plan a whole run of classes at once: pick a student + how many, and it
  // generates that many WEEKLY classes from the start date and adds them all
  // (they show up on the calendar automatically). Set the count to 1 for a
  // single class. Dates that clash with an existing class are skipped.
  async function addSched() {
    if (!uid) return;
    if (!ssid) return setToast({ kind: "error", message: "Pick a student." });
    if (sen <= sst) return setToast({ kind: "error", message: "End time must be after start." });
    const n = Math.max(1, Math.min(52, parseInt(scount || "1", 10) || 1));
    const base = new Date(sdate + "T00:00:00");
    const rows: Record<string, unknown>[] = [];
    let skipped = 0;
    for (let i = 0; i < n; i++) {
      const d = new Date(base); d.setDate(d.getDate() + i * 7);
      const iso = d.toLocaleDateString("en-CA");
      const clash = sched.some((c) => c.scheduled_date === iso && c.status === "scheduled" && overlaps(sst, sen, c.start_time.slice(0, 5), c.end_time.slice(0, 5)))
        || rows.some((r) => r.scheduled_date === iso);
      if (clash) { skipped++; continue; }
      rows.push({ teacher_id: uid, student_id: ssid, scheduled_date: iso, start_time: sst, end_time: sen, mode: smode, location: sloc || null, status: "scheduled", created_by: uid });
    }
    if (rows.length === 0) return setToast({ kind: "error", message: "Those dates all clash with existing classes." });
    const { error } = await getSupabase().from("scheduled_classes").insert(rows);
    if (error) return setToast({ kind: "error", message: error.message });
    const sname = students.find((s) => s.student_id === ssid)?.name || "the student";
    logAudit({ action: AUDIT.SCHEDULE_CHANGED, teacher_id: uid, student_id: ssid, entity_type: "scheduled_class", summary: `Scheduled ${rows.length} classes from ${sdate}` });
    setToast({ kind: "success", message: `Added ${rows.length} class${rows.length > 1 ? "es" : ""} for ${sname}${skipped ? ` (${skipped} skipped for clashes)` : ""}. They're on the calendar now.` });
    reload();
  }
  // Reschedule / fix a class the teacher entered with the wrong date or time.
  async function saveEdit() {
    if (!edit) return;
    if (edit.end <= edit.start) return setToast({ kind: "error", message: "End time must be after start." });
    const clash = sched.some((c) => c.id !== edit.id && c.scheduled_date === edit.date && c.status === "scheduled"
      && overlaps(edit.start, edit.end, c.start_time.slice(0, 5), c.end_time.slice(0, 5)));
    if (clash) return setToast({ kind: "error", message: "That overlaps another scheduled class." });
    const { error } = await getSupabase().from("scheduled_classes").update({
      scheduled_date: edit.date, start_time: edit.start, end_time: edit.end,
      mode: edit.mode, location: edit.location || null, status: "scheduled", updated_at: new Date().toISOString(),
    }).eq("id", edit.id);
    if (error) return setToast({ kind: "error", message: error.message });
    logAudit({ action: AUDIT.SCHEDULE_CHANGED, teacher_id: uid ?? undefined, entity_type: "scheduled_class", entity_id: edit.id, summary: `Rescheduled a class to ${edit.date}` });
    setToast({ kind: "success", message: "Class updated." });
    setEdit(null); reload();
  }
  async function cancelSched(c: ScheduledClass) {
    await getSupabase().from("scheduled_classes").update({ status: "cancelled_by_teacher", updated_at: new Date().toISOString() }).eq("id", c.id);
    logAudit({ action: AUDIT.SCHEDULE_CHANGED, teacher_id: c.teacher_id, student_id: c.student_id, entity_type: "scheduled_class", entity_id: c.id, summary: "Cancelled a scheduled class" });
    reload();
  }
  async function addTimeOff() {
    if (!uid) return;
    const { error } = await getSupabase().from("teacher_time_off").insert({ teacher_id: uid, start_date: tS, end_date: tE, reason: tR || null });
    if (error) return setToast({ kind: "error", message: error.message });
    setToast({ kind: "success", message: "Unavailable dates added." }); setTR(""); reload();
  }

  const today = todayISO();
  const visible = filterStudent ? sched.filter((c) => c.student_id === filterStudent) : sched;
  const upcoming = visible.filter((c) => c.scheduled_date >= today);
  const past = visible.filter((c) => c.scheduled_date < today).reverse();

  const renderRow = (c: ScheduledClass) => (
    <div key={c.id} className="rounded-2xl border border-hairline bg-white p-3.5">
      {edit?.id === c.id ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">{nameOf[c.student_id] || "Student"}</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} className={INP} />
            <select value={edit.mode} onChange={(e) => setEdit({ ...edit, mode: e.target.value })} className={INP}><option>Online</option><option>Home</option></select>
            <input type="time" value={edit.start} onChange={(e) => setEdit({ ...edit, start: e.target.value })} className={INP} />
            <input type="time" value={edit.end} onChange={(e) => setEdit({ ...edit, end: e.target.value })} className={INP} />
            <input value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} placeholder="Location (optional)" className={INP + " col-span-2"} />
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-paper">Save changes</button>
            <button onClick={() => setEdit(null)} className="rounded-full border border-hairline px-5 py-2 text-xs font-semibold text-ink/70">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{nameOf[c.student_id] || "Student"}</p>
            <p className="text-xs text-ink/60">{prettyDate(c.scheduled_date)} · {c.start_time.slice(0, 5)}–{c.end_time.slice(0, 5)} · {c.mode || "—"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button onClick={() => setEdit({ id: c.id, date: c.scheduled_date, start: c.start_time.slice(0, 5), end: c.end_time.slice(0, 5), mode: c.mode || "Online", location: c.location || "" })} className="text-xs font-semibold text-[#7A5E0F]">Edit</button>
            {c.status === "scheduled"
              ? <button onClick={() => cancelSched(c)} className="text-xs font-semibold text-red-600">Cancel</button>
              : <span className="text-xs font-semibold text-ink/50">{ATTENDANCE_LABEL[c.status] ?? c.status}</span>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Schedule">
      {!avail ? <Loading /> : (
        <div className="space-y-6">
          {/* Scheduled classes */}
          <section>
            {/* See a single student's whole run of classes at a glance. */}
            <div className="mb-3 flex items-center gap-2">
              <select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} className={INP + " flex-1"}>
                <option value="">All students ({sched.length} class{sched.length === 1 ? "" : "es"})</option>
                {students.map((s) => {
                  const n = sched.filter((c) => c.student_id === s.student_id).length;
                  return <option key={s.student_id} value={s.student_id}>{s.name} ({n})</option>;
                })}
              </select>
              {filterStudent && <button onClick={() => setFilterStudent("")} className="shrink-0 text-xs font-semibold text-[#7A5E0F]">Clear</button>}
            </div>

            <p className="mb-2 text-sm font-semibold text-ink">Upcoming classes{filterStudent ? ` · ${upcoming.length}` : ""}</p>
            <div className="space-y-2">
              {upcoming.length === 0 ? <Empty text="No upcoming classes scheduled." /> : upcoming.map(renderRow)}
            </div>

            {past.length > 0 && (
              <div className="mt-5">
                <p className="mb-1 text-sm font-semibold text-ink">Earlier classes</p>
                <p className="mb-2 text-xs text-ink/55">Added a wrong date? Tap Edit here to fix a past class.</p>
                <div className="space-y-2">{past.map(renderRow)}</div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-hairline bg-white p-4">
              <p className="text-sm font-semibold text-ink">Plan classes</p>
              <p className="mb-3 text-xs text-ink/55">Pick a student and how many classes. We create them weekly from the start date and add them straight to the calendar. Set the number to 1 for a single class.</p>
              <div className="space-y-2">
                <select value={ssid} onChange={(e) => setSsid(e.target.value)} className={INP + " w-full"}>
                  <option value="">Choose student…</option>
                  {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/50">Number of classes</span>
                    <input type="number" min={1} max={52} value={scount} onChange={(e) => setScount(e.target.value)} className={INP + " w-full"} /></label>
                  <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/50">First class date</span>
                    <input type="date" value={sdate} onChange={(e) => setSdate(e.target.value)} className={INP + " w-full"} /></label>
                  <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/50">Start</span>
                    <input type="time" value={sst} onChange={(e) => setSst(e.target.value)} className={INP + " w-full"} /></label>
                  <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/50">End</span>
                    <input type="time" value={sen} onChange={(e) => setSen(e.target.value)} className={INP + " w-full"} /></label>
                  <select value={smode} onChange={(e) => setSmode(e.target.value)} className={INP + " w-full"}><option>Online</option><option>Home</option></select>
                  <input value={sloc} onChange={(e) => setSloc(e.target.value)} placeholder="Location (optional)" className={INP + " w-full"} />
                </div>
              </div>
              <button onClick={addSched} className="mt-3 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-paper">
                Add {(parseInt(scount, 10) || 1) > 1 ? `${parseInt(scount, 10)} weekly classes` : "class"} to calendar
              </button>
            </div>
          </section>

          {/* Weekly availability */}
          <section>
            <p className="mb-2 text-sm font-semibold text-ink">Weekly availability</p>
            <div className="space-y-2">
              {avail.length === 0 ? <Empty text="No availability set yet." /> : avail.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-hairline bg-white p-3 text-sm">
                  <span className="text-ink/80">{WD[a.weekday]} · {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)} · {a.mode || "—"}</span>
                  <button onClick={() => delAvail(a.id)} className="text-xs font-semibold text-red-600">Remove</button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-hairline bg-white p-4">
              <select value={aw} onChange={(e) => setAw(e.target.value)} className={INP}>{WD.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
              <select value={am} onChange={(e) => setAm(e.target.value)} className={INP}><option>Online</option><option>Home</option><option>Either</option></select>
              <input type="time" value={as1} onChange={(e) => setAs1(e.target.value)} className={INP} />
              <input type="time" value={ae} onChange={(e) => setAe(e.target.value)} className={INP} />
              <button onClick={addAvail} className="col-span-2 rounded-full bg-ink py-2.5 text-sm font-semibold text-paper">Add availability</button>
            </div>
          </section>

          {/* Time off */}
          <section>
            <p className="mb-2 text-sm font-semibold text-ink">Unavailable dates</p>
            <div className="space-y-2">
              {timeoff.length === 0 ? <Empty text="No time off recorded." /> : timeoff.map((t) => (
                <div key={t.id} className="rounded-xl border border-hairline bg-white p-3 text-sm text-ink/80">
                  {prettyDate(t.start_date)} – {prettyDate(t.end_date)}{t.reason ? ` · ${t.reason}` : ""}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-hairline bg-white p-4">
              <input type="date" value={tS} onChange={(e) => setTS(e.target.value)} className={INP} />
              <input type="date" value={tE} onChange={(e) => setTE(e.target.value)} className={INP} />
              <input value={tR} onChange={(e) => setTR(e.target.value)} placeholder="Reason (optional)" className={cn(INP, "col-span-2")} />
              <button onClick={addTimeOff} className="col-span-2 rounded-full bg-ink py-2.5 text-sm font-semibold text-paper">Add unavailable dates</button>
            </div>
          </section>
        </div>
      )}
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}

const INP = "rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-hairline bg-paper p-4 text-sm text-ink/55">{text}</p>;
}
