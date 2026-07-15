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
const prettyDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const overlaps = (aS: string, aE: string, bS: string, bE: string) => aS < bE && bS < aE;

export default function TeacherSchedule() {
  const [uid, setUid] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentStat[]>([]);
  const [avail, setAvail] = useState<TeacherAvailability[] | null>(null);
  const [timeoff, setTimeoff] = useState<TeacherTimeOff[]>([]);
  const [sched, setSched] = useState<ScheduledClass[]>([]);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  // availability form
  const [aw, setAw] = useState("1"); const [as1, setAs1] = useState("16:00"); const [ae, setAe] = useState("17:00"); const [am, setAm] = useState("Online");
  // schedule form
  const [ssid, setSsid] = useState(""); const [sdate, setSdate] = useState(todayISO()); const [sst, setSst] = useState("16:00"); const [sen, setSen] = useState("17:00"); const [smode, setSmode] = useState("Online"); const [sloc, setSloc] = useState("");
  // time off form
  const [tS, setTS] = useState(todayISO()); const [tE, setTE] = useState(todayISO()); const [tR, setTR] = useState("");

  async function reload() {
    const sb = getSupabase();
    const [av, to, sc] = await Promise.all([
      sb.from("teacher_availability").select("*").order("weekday").order("start_time"),
      sb.from("teacher_time_off").select("*").order("start_date", { ascending: false }),
      sb.from("scheduled_classes").select("*").gte("scheduled_date", todayISO()).order("scheduled_date").order("start_time"),
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

  async function addSched() {
    if (!uid) return;
    if (!ssid) return setToast({ kind: "error", message: "Pick a student." });
    if (sen <= sst) return setToast({ kind: "error", message: "End time must be after start." });
    // Conflict check: no overlapping active class for this teacher on the same day.
    const clash = sched.some((c) => c.scheduled_date === sdate && c.status === "scheduled" && overlaps(sst, sen, c.start_time.slice(0, 5), c.end_time.slice(0, 5)));
    if (clash) return setToast({ kind: "error", message: "That overlaps another scheduled class." });
    const { error } = await getSupabase().from("scheduled_classes").insert({
      teacher_id: uid, student_id: ssid, scheduled_date: sdate, start_time: sst, end_time: sen, mode: smode, location: sloc || null, status: "scheduled", created_by: uid,
    });
    if (error) return setToast({ kind: "error", message: error.message });
    logAudit({ action: AUDIT.SCHEDULE_CHANGED, teacher_id: uid, student_id: ssid, entity_type: "scheduled_class", summary: `Scheduled a class on ${sdate}` });
    setToast({ kind: "success", message: "Class scheduled." }); reload();
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

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Schedule">
      {!avail ? <Loading /> : (
        <div className="space-y-6">
          {/* Scheduled classes */}
          <section>
            <p className="mb-2 text-sm font-semibold text-ink">Upcoming classes</p>
            <div className="space-y-2">
              {sched.length === 0 ? <Empty text="No upcoming classes scheduled." /> : sched.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-2xl border border-hairline bg-white p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{nameOf[c.student_id] || "Student"}</p>
                    <p className="text-xs text-ink/60">{prettyDate(c.scheduled_date)} · {c.start_time.slice(0, 5)}–{c.end_time.slice(0, 5)} · {c.mode || "—"}</p>
                  </div>
                  {c.status === "scheduled"
                    ? <button onClick={() => cancelSched(c)} className="text-xs font-semibold text-red-600">Cancel</button>
                    : <span className="text-xs font-semibold text-ink/50">{ATTENDANCE_LABEL[c.status] ?? c.status}</span>}
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-hairline bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Schedule a class</p>
              <div className="grid grid-cols-2 gap-2">
                <select value={ssid} onChange={(e) => setSsid(e.target.value)} className={INP}>
                  <option value="">Student…</option>
                  {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
                </select>
                <input type="date" value={sdate} min={todayISO()} onChange={(e) => setSdate(e.target.value)} className={INP} />
                <input type="time" value={sst} onChange={(e) => setSst(e.target.value)} className={INP} />
                <input type="time" value={sen} onChange={(e) => setSen(e.target.value)} className={INP} />
                <select value={smode} onChange={(e) => setSmode(e.target.value)} className={INP}><option>Online</option><option>Home</option></select>
                <input value={sloc} onChange={(e) => setSloc(e.target.value)} placeholder="Location (optional)" className={INP} />
              </div>
              <button onClick={addSched} className="mt-3 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-paper">Add to schedule</button>
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
