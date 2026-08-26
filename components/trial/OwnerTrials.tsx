"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { Loading } from "@/components/portal/kit";

type Row = any;

const card = "rounded-2xl border border-hairline bg-white p-5 shadow-card";
const inp = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
const PATHS = ["Foundation", "Main Pathway", "Director's Circle"];
const MONTHLY: Record<string, string> = { Foundation: "₹10,000 / month", "Main Pathway": "₹15,000 / month", "Director's Circle": "From ₹2,500 / class" };

const STAGE_LABEL: Record<string, string> = {
  booked: "Booked", pre_assessed: "Profile done", trial_scheduled: "Trial booked",
  teacher_assigned: "Teacher assigned", trial_done: "Trial done", assessed: "Assessed",
  director_reviewed: "Reviewed", feedback_submitted: "Feedback in", recommended: "Recommended", enrolled: "Enrolled",
};

export function OwnerTrials() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [teachers, setTeachers] = useState<Row[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { client } = getSupabaseSafe();
    if (!client) return;
    const [{ data: t }, { data: ts }] = await Promise.all([
      client.rpc("mp_trial_list"),
      client.from("profiles").select("id,full_name").eq("role", "teacher").order("full_name"),
    ]);
    setRows((t as Row[]) || []);
    setTeachers((ts as Row[]) || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (open) return <Detail id={open} teachers={teachers} onBack={() => { setOpen(null); load(); }} />;
  if (!rows) return <Loading />;

  return (
    <div>
      <p className="mb-4 text-sm text-ink/60">{rows.length} trial{rows.length === 1 ? "" : "s"} in the funnel. Assign a teacher, review the assessment, and publish the family&rsquo;s recommendation.</p>
      <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs uppercase text-ink/50">
            <tr><th className="p-3">Student</th><th className="p-3">Trial</th><th className="p-3">Stage</th><th className="p-3">Rating</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-hairline">
                <td className="p-3"><div className="font-semibold text-ink">{r.student_name || "-"}</div><div className="text-xs text-ink/50">{r.instrument}{r.school ? ` · ${r.school}` : ""}</div></td>
                <td className="p-3 text-ink/70">{r.trial_datetime ? new Date(r.trial_datetime).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "-"}</td>
                <td className="p-3"><span className="rounded-full bg-gold/12 px-2.5 py-1 text-xs font-semibold text-[#7A5E0F]">{STAGE_LABEL[r.stage] || r.stage}</span></td>
                <td className="p-3">{r.trial_rating ? "★".repeat(r.trial_rating) : "-"}</td>
                <td className="p-3 text-right"><button onClick={() => setOpen(r.id)} className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-paper">Open</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink/50">No trials yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({ id, teachers, onBack }: { id: string; teachers: Row[]; onBack: () => void }) {
  const [row, setRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  // director review
  const [text, setText] = useState("");
  const [path, setPath] = useState("");
  const [instrument, setInstrument] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startWindow, setStartWindow] = useState("Within 7 days");
  const [monthly, setMonthly] = useState("");
  // enrolment
  const [classMode, setClassMode] = useState("Home");
  const [perMonth, setPerMonth] = useState("8");
  const [startDate, setStartDate] = useState("");
  const [enrolMsg, setEnrolMsg] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const reload = useCallback(() => {
    const { client } = getSupabaseSafe();
    client?.rpc("mp_trial_get_one", { p_id: id }).then(({ data }) => {
      setRow(data);
      const a = (data as Row)?.teacher_assessment;
      const dr = (data as Row)?.director_review;
      if (dr) { setText(dr.text || ""); setPath(dr.path || ""); setInstrument(dr.instrument || ""); setFrequency(dr.frequency || ""); setStartWindow(dr.start_window || "Within 7 days"); }
      else if (a) { setPath(a.recommended_path || ""); setInstrument(a.instrument_reco || ""); setFrequency(a.frequency || ""); }
      const rec = (data as Row)?.recommendation;
      if (rec?.monthly) setMonthly(rec.monthly);
    });
  }, [id]);
  useEffect(() => { reload(); }, [reload]);

  if (!row) return <Loading />;
  const pre = row.pre_assessment || {};
  const a = row.teacher_assessment;
  const songs = (row.dream_songs || []).map((d: Row) => d.title).filter(Boolean);

  const assign = async (teacherId: string) => {
    const { client } = getSupabaseSafe();
    await client?.rpc("mp_trial_assign", { p_id: id, p_teacher: teacherId });
    reload();
  };
  const publish = async () => {
    if (!path) { setMsg("Choose a recommended path."); return; }
    setBusy(true); setMsg("");
    const { client } = getSupabaseSafe();
    const payload = {
      director_review: { text, path, instrument, frequency, start_window: startWindow },
      recommendation: { path, monthly: monthly || MONTHLY[path] || "" },
      director_note: text,
    };
    const { error } = client ? await client.rpc("mp_trial_director_review", { p_id: id, p: payload }) : { error: { message: "No client" } };
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    reload();
  };
  const enrol = async () => {
    setEnrolling(true); setEnrolMsg("");
    const { client } = getSupabaseSafe();
    const { error } = client ? await client.rpc("mp_trial_enrol", { p_id: id, p: { class_mode: classMode, classes_per_month: perMonth, start_date: startDate, fee: monthly } }) : { error: { message: "No client" } };
    setEnrolling(false);
    if (error) { setEnrolMsg(error.message); return; }
    reload();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={onBack} className="text-sm font-semibold text-ink/60">← Back to funnel</button>

      <div className={card}>
        <h2 className="font-display text-xl font-bold text-ink">{row.student_name} · {row.instrument}</h2>
        <div className="mt-1 text-sm text-ink/55">{row.student_age ? `Age ${row.student_age}` : ""}{row.school ? ` · ${row.school}` : ""}{row.phone ? ` · ${row.phone}` : ""}</div>
        <div className="mt-3 grid gap-1.5 text-sm">
          {songs.length > 0 && <Info k="Dream songs" v={songs.join(", ")} />}
          {pre.favourite_artists && <Info k="Favourite artists" v={pre.favourite_artists} />}
          {pre.why && <Info k="Why learn" v={pre.why} />}
          {pre.parent_objective && <Info k="Parent objective" v={pre.parent_objective} />}
          {pre.schedule && <Info k="Schedule" v={pre.schedule} />}
          {pre.goal && <Info k="Goal" v={pre.goal} />}
          {row.trial_datetime && <Info k="Trial" v={new Date(row.trial_datetime).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} />}
        </div>
      </div>

      {/* Assign teacher */}
      <div className={card}>
        <h3 className="font-display text-lg font-bold text-ink">Assigned teacher</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {teachers.map((t) => (
            <button key={t.id} onClick={() => assign(t.id)}
              className={"rounded-full border px-3.5 py-2 text-sm font-semibold " + (row.assigned_teacher_id === t.id ? "border-gold bg-gold/20 text-[#7A5E0F]" : "border-hairline text-ink/60 hover:border-ink/40")}>{t.full_name}</button>
          ))}
          {teachers.length === 0 && <p className="text-sm text-ink/50">No teachers found.</p>}
        </div>
      </div>

      {/* Teacher assessment (read-only) */}
      <div className={card}>
        <h3 className="font-display text-lg font-bold text-ink">Teacher assessment</h3>
        {a ? (
          <div className="mt-3 space-y-1.5 text-sm">
            {a.level && <Info k="Level" v={a.level} />}
            <Info k="Ear / Rhythm / Coord / Interest" v={`${a.ear || "–"} / ${a.rhythm || "–"} / ${a.coordination || "–"} / ${a.interest || "–"}`} />
            {a.recommended_path && <Info k="Recommended path" v={a.recommended_path} />}
            {a.frequency && <Info k="Frequency" v={a.frequency} />}
            {a.instrument_reco && <Info k="Instrument" v={a.instrument_reco} />}
            {a.notes && <Info k="Notes" v={a.notes} />}
            {a.commercial && <div className="mt-2 rounded-xl bg-paper p-3 text-xs text-ink/70">
              <b>Internal:</b> interested {a.commercial.parent_interested || "–"} · owns instrument {a.commercial.instrument_owned || "–"} · follow-up {a.commercial.follow_up || "–"}{a.commercial.objection ? ` · objection: ${a.commercial.objection}` : ""}
            </div>}
          </div>
        ) : <p className="mt-2 text-sm text-ink/50">Not submitted yet. The teacher completes this after the trial class.</p>}
      </div>

      {/* Family feedback */}
      {row.feedback && row.feedback.length > 0 && (
        <div className={card}>
          <h3 className="font-display text-lg font-bold text-ink">Family feedback</h3>
          <ul className="mt-2 space-y-2">
            {row.feedback.map((f: Row, i: number) => (
              <li key={i} className="rounded-xl bg-paper p-3 text-sm text-ink/75">{f.rating ? "★".repeat(f.rating) + " " : ""}{f.text}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Director review, unlocks the pathway */}
      <div className={card + " border-gold/40"}>
        <h3 className="font-display text-lg font-bold text-ink">Director review &amp; recommendation</h3>
        <p className="mt-1 text-sm text-ink/55">Publishing this reveals the family&rsquo;s personalised pathway (after their feedback) and notifies them.</p>
        <div className="mt-4 space-y-4">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Personal message to the family</span>
            <textarea className={inp} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Based on the assessment and your child's goals, we recommend…" /></label>
          <Sel label="Recommended path" value={path} set={(v) => { setPath(v); setMonthly(MONTHLY[v] || ""); }} options={PATHS} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Starting instrument</span><input className={inp} value={instrument} onChange={(e) => setInstrument(e.target.value)} placeholder="e.g. Acoustic Guitar 38–40 inch" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Class frequency</span><input className={inp} value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g. 2 classes / week" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Suggested start</span><input className={inp} value={startWindow} onChange={(e) => setStartWindow(e.target.value)} /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Monthly fee (shown to family)</span><input className={inp} value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="₹10,000 / month" /></label>
          </div>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button onClick={publish} disabled={busy} className="w-full rounded-full bg-ink py-3.5 text-base font-semibold text-paper disabled:opacity-60">
            {busy ? "Publishing…" : "Publish recommendation to the family"}
          </button>
        </div>
      </div>

      {/* Enrolment, converts the trial account into the Student Portal */}
      <div className={card + " border-feature-green/40"}>
        <h3 className="font-display text-lg font-bold text-ink">Enrol &amp; convert to Student Portal</h3>
        {row.converted_student_id || row.stage === "enrolled" ? (
          <div className="mt-2 rounded-xl bg-feature-green/10 p-4 text-sm font-semibold text-feature-green">
            ✓ Enrolled. This family&rsquo;s login is now their full Student Portal, no second account, history preserved.
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink/55">Once payment is arranged, enrol here. Their trial login instantly becomes their Student Portal (same account).</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Sel label="Class mode" value={classMode} set={setClassMode} options={["Home", "Online", "Centre"]} />
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Classes / month</span><input className={inp} inputMode="numeric" value={perMonth} onChange={(e) => setPerMonth(e.target.value.replace(/\D/g, ""))} /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Start date</span><input className={inp} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Monthly fee</span><input className={inp} value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="₹10,000 / month" /></label>
            </div>
            {!row.assigned_teacher_id && <p className="mt-3 text-sm text-red-600">Assign a teacher above before enrolling.</p>}
            {enrolMsg && <p className="mt-3 text-sm text-red-600">{enrolMsg}</p>}
            <button onClick={enrol} disabled={enrolling || !row.assigned_teacher_id} className="mt-4 w-full rounded-full bg-feature-green py-3.5 text-base font-semibold text-white disabled:opacity-50">
              {enrolling ? "Enrolling…" : "Enrol & open Student Portal"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return <div><span className="text-ink/50">{k}: </span><span className="font-semibold text-ink">{v}</span></div>;
}
function Sel({ label, value, set, options }: { label: string; value: string; set: (v: string) => void; options: string[] }) {
  return (
    <div><span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap gap-2">{options.map((o) => (
        <button key={o} type="button" onClick={() => set(o)}
          className={"rounded-full border px-3.5 py-2 text-sm font-semibold " + (value === o ? "border-gold bg-gold/20 text-[#7A5E0F]" : "border-hairline text-ink/60 hover:border-ink/40")}>{o}</button>))}
      </div></div>
  );
}
