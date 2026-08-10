"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { Loading } from "@/components/portal/kit";
import { useTrial, STAGES, ORDER, EVENTS, firstNameOf, type TrialSession } from "./shared";

export function TrialJourney() {
  const { session: s, loading, reload } = useTrial();
  if (loading) return <Loading />;
  const stageIdx = s ? (ORDER[s.stage] ?? 0) : 0;
  const preDone = !!(s?.pre_assessment && Object.keys(s.pre_assessment).length > 0) || stageIdx >= 1;
  const first = firstNameOf(s) || "you";

  return (
    <div className="space-y-6">
      {!preDone && <PreAssessment session={s} onSaved={reload} />}

      {/* Full journey */}
      <div className="rounded-3xl border border-hairline bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-bold text-ink">Your full journey</h2>
        <ol className="mt-4 space-y-1.5">
          {STAGES.map((st, i) => {
            const done = i < stageIdx, current = i === stageIdx;
            return (
              <li key={st.key} className={"flex items-center gap-3 rounded-2xl px-3 py-3 " + (current ? "bg-gold/10 ring-1 ring-gold/40" : "")}>
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold " +
                  (done ? "bg-gold text-ink" : current ? "bg-gold/25 text-[#7A5E0F]" : "bg-ink/[0.05] text-ink/40")}>
                  {done ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={"block text-sm font-bold " + (done || current ? "text-ink" : "text-ink/45")}>{st.label}</span>
                  <span className="block text-xs text-ink/50">{st.sub}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Recommendation */}
      <div>
        <h2 className="mb-3 px-1 font-display text-lg font-bold text-ink">Your personalised pathway</h2>
        {s?.director_review || s?.recommendation ? (
          <div className="rounded-3xl border border-gold/40 bg-gold/[0.06] p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7A5E0F]">Reviewed by the Director</p>
            {s?.director_review?.text && <p className="mt-2 leading-relaxed text-ink/80">{s.director_review.text}</p>}
            <div className="mt-4 grid gap-2 text-sm">
              {s?.director_review?.path && <Row k="Recommended path" v={s.director_review.path} />}
              {s?.director_review?.instrument && <Row k="Starting instrument" v={s.director_review.instrument} />}
              {s?.director_review?.frequency && <Row k="Class frequency" v={s.director_review.frequency} />}
              {s?.director_review?.start_window && <Row k="Suggested start" v={s.director_review.start_window} />}
            </div>
            {s?.recommendation?.path && (
              <Link href="/pay" className="mt-5 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">
                Start my journey — {s.recommendation.path}{s.recommendation.monthly ? ` · ${s.recommendation.monthly}` : ""} →
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-hairline bg-white/60 p-8 text-center shadow-card">
            <div className="text-3xl">🔒</div>
            <p className="mt-3 font-bold text-ink">Unlocks after your assessment</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink/55">
              Your teacher will assess {first} in the trial class, then the Director personally reviews and recommends your pathway. No guesswork — a real, human recommendation.
            </p>
          </div>
        )}
      </div>

      {(s?.director_note || s?.teacher_summary) && (
        <div className="rounded-3xl border border-hairline bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7A5E0F]">A note from your mentor</p>
          <p className="mt-2 leading-relaxed text-ink/80">{s.director_note || s.teacher_summary}</p>
        </div>
      )}

      {/* Events */}
      <div>
        <h2 className="mb-3 px-1 font-display text-lg font-bold text-ink">What&rsquo;s happening at Musicphonetics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {EVENTS.map((e) => (
            <div key={e.t} className="flex items-start gap-3 rounded-2xl border border-hairline bg-white p-4 shadow-card">
              <span className="text-2xl">{e.icon}</span>
              <div><div className="font-bold text-ink">{e.t}</div><div className="text-sm text-ink/55">{e.d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 border-b border-hairline py-1.5"><span className="text-ink/55">{k}</span><span className="font-bold text-ink">{v}</span></div>;
}

const inp = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

function PreAssessment({ session, onSaved }: { session: TrialSession | null; onSaved: () => void }) {
  const [songs, setSongs] = useState<{ title: string; lang: string }[]>(
    session?.dream_songs?.length ? session.dream_songs.map((d) => ({ title: d.title, lang: d.lang || "" })) : [{ title: "", lang: "" }, { title: "", lang: "" }]
  );
  const [artists, setArtists] = useState("");
  const [why, setWhy] = useState("");
  const [objective, setObjective] = useState("");
  const [schedule, setSchedule] = useState("");
  const [owns, setOwns] = useState("");
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const filled = [songs.some((x) => x.title.trim()), artists, why, objective, schedule, owns, goal].filter(Boolean).length;
  const pct = Math.round((filled / 7) * 100);

  const save = async () => {
    setBusy(true); setErr("");
    const { client } = getSupabaseSafe();
    if (!client) { setErr("Not configured."); setBusy(false); return; }
    const { error } = await client.rpc("mp_trial_pre_assessment", {
      p: {
        dream_songs: songs.filter((x) => x.title.trim()),
        pre_assessment: { favourite_artists: artists, why, parent_objective: objective, schedule, owns_instrument: owns, goal },
      },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-card">
      <div className="bg-gold/[0.08] p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A5E0F]">Step 2 · Pre-Assessment</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Let&rsquo;s get to know {firstNameOf(session) || "you"}</h2>
        <p className="mt-1 text-sm text-ink/60">The more you share, the more personal your trial. This helps us design the perfect learning path.</p>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-ink/60"><span>Assessment progress</span><span>{pct}% complete</span></div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Which 2 songs do you dream of playing? <span className="font-normal text-ink/45">(Hindi or English)</span></label>
          {songs.map((s, i) => (
            <div key={i} className="mt-2">
              <input className={inp} placeholder={i === 0 ? "e.g. Country Roads, Tum Hi Ho…" : "Second song (optional)"}
                value={s.title} onChange={(e) => setSongs((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <div className="mt-1.5 flex gap-2">
                {["English", "Hindi"].map((l) => (
                  <button key={l} type="button" onClick={() => setSongs((p) => p.map((x, j) => (j === i ? { ...x, lang: x.lang === l ? "" : l } : x)))}
                    className={"rounded-full border px-3 py-1 text-xs font-semibold " + (s.lang === l ? "border-gold bg-gold/20 text-[#7A5E0F]" : "border-hairline text-ink/50")}>{l}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Text label="Favourite artists or bands" value={artists} set={setArtists} placeholder="Who do you love listening to?" />
        <Text label="Why do you want to learn?" value={why} set={setWhy} placeholder="Your reason, in your words." area />
        <Text label="As a parent, what's your objective?" hint="(if learning for a child)" value={objective} set={setObjective} placeholder="What would make this worth it?" />

        <Pills label="Preferred schedule" value={schedule} set={setSchedule} options={["Weekday evenings", "Weekday daytime", "Weekends", "Flexible"]} />
        <Pills label="Do you already own an instrument?" value={owns} set={setOwns} options={["Yes", "No", "Not sure"]} />
        <Pills label="Your main goal" value={goal} set={setGoal} options={["Play for fun", "Learn properly", "Exams / grades", "Perform on stage"]} />

        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={save} disabled={busy} className="w-full rounded-full bg-ink py-3.5 text-base font-semibold text-paper disabled:opacity-60">
          {busy ? "Saving…" : "Submit my pre-assessment"}
        </button>
        <p className="text-center text-xs text-ink/45">This helps us design the perfect learning path for {firstNameOf(session) || "you"}.</p>
      </div>
    </div>
  );
}

function Text({ label, hint, value, set, placeholder, area }: { label: string; hint?: string; value: string; set: (v: string) => void; placeholder?: string; area?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label} {hint && <span className="font-normal text-ink/45">{hint}</span>}</span>
      {area ? <textarea className={inp} rows={2} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />
        : <input className={inp} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />}
    </label>
  );
}

function Pills({ label, value, set, options }: { label: string; value: string; set: (v: string) => void; options: string[] }) {
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => set(o)}
            className={"rounded-full border px-3.5 py-2 text-sm font-semibold " + (value === o ? "border-gold bg-gold/20 text-[#7A5E0F]" : "border-hairline text-ink/60 hover:border-ink/40")}>{o}</button>
        ))}
      </div>
    </div>
  );
}
