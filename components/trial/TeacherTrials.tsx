"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { Loading } from "@/components/portal/kit";

type Row = any;

const card = "rounded-2xl border border-hairline bg-white p-5 shadow-card";
const inp = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
const PATHS = ["Foundation", "Main Pathway", "Director's Circle"];
const LEVELS = ["Absolute beginner", "Beginner", "Elementary", "Intermediate"];
const FREQ = ["1 class / week", "2 classes / week", "3 classes / week"];

export function TeacherTrials() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState<Row | null>(null);

  const load = useCallback(async () => {
    const { client } = getSupabaseSafe();
    if (!client) return;
    const { data } = await client.rpc("mp_trial_teacher_list");
    setRows((data as Row[]) || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (open) return <AssessDetail id={open.id} onBack={() => { setOpen(null); load(); }} />;
  if (!rows) return <Loading />;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Trial assessments</h1>
      {rows.length === 0 && <div className={card}><p className="text-sm text-ink/60">No trials assigned to you yet. When the office assigns you a trial, it appears here with the student&rsquo;s profile.</p></div>}
      {rows.map((r) => (
        <button key={r.id} onClick={() => setOpen(r)} className={card + " flex w-full items-center gap-4 text-left"}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/12 text-lg">🎸</span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-ink">{r.student_name || "Student"} · {r.instrument}</div>
            <div className="text-sm text-ink/55">{r.trial_datetime ? new Date(r.trial_datetime).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "Slot to be set"}</div>
          </div>
          <span className={"shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold " + (r.has_assessment ? "bg-feature-green/10 text-feature-green" : "bg-gold text-ink")}>
            {r.has_assessment ? "Assessed ✓" : "Assess"}
          </span>
        </button>
      ))}
    </div>
  );
}

function AssessDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [row, setRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // assessment fields
  const [summary, setSummary] = useState("");
  const [level, setLevel] = useState("");
  const [ear, setEar] = useState(0);
  const [rhythm, setRhythm] = useState(0);
  const [coord, setCoord] = useState(0);
  const [interest, setInterest] = useState(0);
  const [path, setPath] = useState("");
  const [instReco, setInstReco] = useState("");
  const [freq, setFreq] = useState("");
  const [notes, setNotes] = useState("");
  // internal / commercial
  const [parentInterested, setParentInterested] = useState("");
  const [instrumentOwned, setInstrumentOwned] = useState("");
  const [objection, setObjection] = useState("");
  const [followUp, setFollowUp] = useState("");

  useEffect(() => {
    const { client } = getSupabaseSafe();
    client?.rpc("mp_trial_get_one", { p_id: id }).then(({ data }) => {
      setRow(data);
      const a = (data as Row)?.teacher_assessment;
      if (a) {
        setSummary(a.summary || ""); setLevel(a.level || ""); setEar(a.ear || 0); setRhythm(a.rhythm || 0);
        setCoord(a.coordination || 0); setInterest(a.interest || 0); setPath(a.recommended_path || "");
        setInstReco(a.instrument_reco || ""); setFreq(a.frequency || ""); setNotes(a.notes || "");
        setParentInterested(a.commercial?.parent_interested || ""); setInstrumentOwned(a.commercial?.instrument_owned || "");
        setObjection(a.commercial?.objection || ""); setFollowUp(a.commercial?.follow_up || "");
      }
    });
  }, [id]);

  if (!row) return <Loading />;
  const pre = row.pre_assessment || {};
  const songs = (row.dream_songs || []).map((d: Row) => d.title).filter(Boolean);

  const submit = async () => {
    setBusy(true); setMsg("");
    const { client } = getSupabaseSafe();
    const payload = {
      summary, level, ear, rhythm, coordination: coord, interest,
      recommended_path: path, instrument_reco: instReco, frequency: freq, notes,
      commercial: { parent_interested: parentInterested, instrument_owned: instrumentOwned, objection, follow_up: followUp },
    };
    const { error } = client ? await client.rpc("mp_trial_teacher_assessment", { p_id: id, p: payload }) : { error: { message: "No client" } };
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    onBack();
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm font-semibold text-ink/60">← Back to trials</button>

      {/* Student profile the teacher walks in with */}
      <div className={card}>
        <h2 className="font-display text-xl font-bold text-ink">{row.student_name} · {row.instrument}</h2>
        <div className="mt-1 text-sm text-ink/55">{row.student_age ? `Age ${row.student_age}` : ""}{row.school ? ` · ${row.school}` : ""}</div>
        <div className="mt-3 grid gap-1.5 text-sm">
          {songs.length > 0 && <Info k="Dream songs" v={songs.join(", ")} />}
          {pre.favourite_artists && <Info k="Favourite artists" v={pre.favourite_artists} />}
          {pre.why && <Info k="Why they want to learn" v={pre.why} />}
          {pre.parent_objective && <Info k="Parent's objective" v={pre.parent_objective} />}
          {pre.schedule && <Info k="Preferred schedule" v={pre.schedule} />}
          {pre.owns_instrument && <Info k="Owns an instrument" v={pre.owns_instrument} />}
          {pre.goal && <Info k="Main goal" v={pre.goal} />}
        </div>
      </div>

      {/* Assessment */}
      <div className={card + " space-y-5"}>
        <h3 className="font-display text-lg font-bold text-ink">Trial assessment</h3>
        <Sel label="Current level" value={level} set={setLevel} options={LEVELS} />
        <Rate label="Musical ear" value={ear} set={setEar} />
        <Rate label="Rhythm" value={rhythm} set={setRhythm} />
        <Rate label="Coordination" value={coord} set={setCoord} />
        <Rate label="Interest & attitude" value={interest} set={setInterest} />
        <Sel label="Recommended path" value={path} set={setPath} options={PATHS} />
        <Sel label="Class frequency" value={freq} set={setFreq} options={FREQ} />
        <Txt label="Instrument recommendation" value={instReco} set={setInstReco} placeholder="e.g. 38-40 inch acoustic; borrow for first classes if needed" />
        <Txt label="Teacher notes" value={notes} set={setNotes} placeholder="Responded well to… needs work on… suggested practice…" area />
        <Txt label="One-line summary (shown to the family)" value={summary} set={setSummary} placeholder="A warm, honest one-liner about the student." />
      </div>

      {/* Internal commercial notes */}
      <div className={card + " space-y-4 border-dashed"}>
        <div className="flex items-center gap-2"><span className="text-lg">🔒</span><h3 className="font-display text-lg font-bold text-ink">Internal notes <span className="text-sm font-normal text-ink/50">(never shown to family)</span></h3></div>
        <Sel label="Parent interested?" value={parentInterested} set={setParentInterested} options={["Very", "Somewhat", "Unsure", "No"]} />
        <Sel label="Instrument owned?" value={instrumentOwned} set={setInstrumentOwned} options={["Yes", "No", "Needs guidance"]} />
        <Txt label="Objection / concern" value={objection} set={setObjection} placeholder="Any hesitation to address before enrolment." />
        <Sel label="Follow-up needed?" value={followUp} set={setFollowUp} options={["Yes — soon", "Yes — later", "No"]} />
      </div>

      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button onClick={submit} disabled={busy} className="w-full rounded-full bg-ink py-3.5 text-base font-semibold text-paper disabled:opacity-60">
        {busy ? "Saving…" : "Submit assessment"}
      </button>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return <div><span className="text-ink/50">{k}: </span><span className="font-semibold text-ink">{v}</span></div>;
}
function Txt({ label, value, set, placeholder, area }: { label: string; value: string; set: (v: string) => void; placeholder?: string; area?: boolean }) {
  return (
    <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {area ? <textarea className={inp} rows={3} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />
        : <input className={inp} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />}</label>
  );
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
function Rate({ label, value, set }: { label: string; value: number; set: (v: number) => void }) {
  return (
    <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-ink">{label}</span><span className="text-sm font-bold text-[#7A5E0F]">{value || "–"}/10</span></div>
      <div className="flex gap-1">{Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" onClick={() => set(n)}
          className={"h-8 flex-1 rounded-md text-xs font-bold " + (n <= value ? "bg-gold text-ink" : "bg-ink/[0.06] text-ink/40")}>{n}</button>))}
      </div></div>
  );
}
