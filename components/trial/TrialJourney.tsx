"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { Loading } from "@/components/portal/kit";
import { useTrial, STAGES, currentStep, EVENTS, firstNameOf, type TrialSession } from "./shared";

export function TrialJourney() {
  const { session: s, loading, reload } = useTrial();
  if (loading) return <Loading />;
  return <TrialJourneyView s={s} reload={reload} />;
}

export function TrialJourneyView({ s, reload }: { s: TrialSession | null; reload: () => void }) {
  const cur = currentStep(s);
  const stage = s?.stage || "booked";
  const profileDone = stage !== "booked";
  const scheduled = !!s?.trial_datetime;
  const completed = !!s?.trial_completed_at;
  const feedbackDone = !!s?.trial_rating;

  return (
    <div className="space-y-6">
      {/* Journey overview */}
      <div className="rounded-3xl border border-hairline bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Your journey</h2>
          <span className="text-sm font-semibold text-[#7A5E0F]">Step {Math.min(cur + 1, STAGES.length)} of {STAGES.length}</span>
        </div>
        <ol className="mt-4 space-y-1.5">
          {STAGES.map((st, i) => {
            const done = i < cur, current = i === cur;
            return (
              <li key={st.key} className={"flex items-center gap-3 rounded-2xl px-3 py-2.5 " + (current ? "bg-gold/10 ring-1 ring-gold/40" : "")}>
                <span className={"grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold " +
                  (done ? "bg-gold text-ink" : current ? "bg-gold/25 text-[#7A5E0F]" : "bg-ink/[0.05] text-ink/40")}>{done ? "✓" : i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className={"block text-sm font-bold " + (done || current ? "text-ink" : "text-ink/45")}>{st.label}</span>
                  <span className="block text-xs text-ink/50">{done ? "Completed" : st.sub}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Progressive action, driven by the family's own data */}
      {!profileDone && <ProfileBuilder session={s} onSaved={reload} />}
      {profileDone && !scheduled && <BookingCalendar onBooked={reload} />}
      {scheduled && <ConfirmationCard session={s} completed={completed} />}
      {completed && !feedbackDone && <FeedbackCard onSaved={reload} />}
      {feedbackDone && <PathwayCard session={s} />}

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

const inp = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 border-b border-hairline py-1.5 last:border-0"><span className="text-ink/55">{k}</span><span className="font-bold text-ink">{v}</span></div>;
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

// ---------- Step 2: Build Your Profile ----------
function ProfileBuilder({ session, onSaved }: { session: TrialSession | null; onSaved: () => void }) {
  const [name, setName] = useState(session?.student_name || "");
  const [age, setAge] = useState(session?.student_age || "");
  const [school, setSchool] = useState(session?.school || "");
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

  const fields = [name, age, school, songs.some((x) => x.title.trim()), artists, why, objective, schedule, owns, goal];
  const pct = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  const save = async () => {
    if (!name.trim()) { setErr("Please add the student's name."); return; }
    setBusy(true); setErr("");
    const { client } = getSupabaseSafe();
    if (!client) { setErr("Not configured."); setBusy(false); return; }
    const { error } = await client.rpc("mp_trial_pre_assessment", {
      p: {
        student_name: name, student_age: age, school,
        dream_songs: songs.filter((x) => x.title.trim()),
        pre_assessment: { favourite_artists: artists, why, parent_objective: objective, schedule, owns_instrument: owns, goal, school },
      },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-card">
      <div className="bg-gold/[0.08] p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A5E0F]">Step 2 · Build Your Profile</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Let&rsquo;s get to know {firstNameOf(session) || "the student"}</h2>
        <p className="mt-1 text-sm text-ink/60">This builds the student profile your teacher and the Director will use. The more you share, the more personal your trial.</p>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-ink/60"><span>Profile progress</span><span>{pct}% complete</span></div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Student&rsquo;s name</span>
            <input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">School / College <span className="font-normal text-ink/45">(optional)</span></span>
            <input className={inp} value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School or college name" /></label>
        </div>
        <Pills label="Age group" value={age} set={setAge} options={["4-7", "8-12", "13-17", "18+"]} />

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

        <TextF label="Favourite artists or bands" value={artists} set={setArtists} placeholder="Who do you love listening to?" />
        <TextF label="Why do you want to learn?" value={why} set={setWhy} placeholder="Your reason, in your words." area />
        <TextF label="As a parent, what's your objective?" hint="(if learning for a child)" value={objective} set={setObjective} placeholder="What would make this worth it?" />
        <Pills label="Preferred schedule" value={schedule} set={setSchedule} options={["Weekday evenings", "Weekday daytime", "Weekends", "Flexible"]} />
        <Pills label="Do you already own an instrument?" value={owns} set={setOwns} options={["Yes", "No", "Not sure"]} />
        <Pills label="Main goal" value={goal} set={setGoal} options={["Play for fun", "Learn properly", "Exams / grades", "Perform on stage"]} />

        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={save} disabled={busy} className="w-full rounded-full bg-ink py-3.5 text-base font-semibold text-paper disabled:opacity-60">
          {busy ? "Saving…" : "Save profile & book my trial →"}
        </button>
      </div>
    </div>
  );
}

function TextF({ label, hint, value, set, placeholder, area }: { label: string; hint?: string; value: string; set: (v: string) => void; placeholder?: string; area?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label} {hint && <span className="font-normal text-ink/45">{hint}</span>}</span>
      {area ? <textarea className={inp} rows={2} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />
        : <input className={inp} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />}
    </label>
  );
}

// ---------- Step 3: Book Your Trial (instant) ----------
const SLOTS = [
  { label: "10:00 AM", h: 10 }, { label: "11:00 AM", h: 11 }, { label: "12:00 PM", h: 12 },
  { label: "4:00 PM", h: 16 }, { label: "5:00 PM", h: 17 }, { label: "6:00 PM", h: 18 }, { label: "7:00 PM", h: 19 },
];
function nextDays(n: number) {
  const out: Date[] = [];
  const d = new Date(); d.setHours(0, 0, 0, 0);
  for (let i = 1; i <= n; i++) { const x = new Date(d); x.setDate(d.getDate() + i); out.push(x); }
  return out;
}
function BookingCalendar({ onBooked }: { onBooked: () => void }) {
  const days = nextDays(14);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<{ label: string; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const confirm = async () => {
    if (!day || !slot) { setErr("Pick a date and a time."); return; }
    setBusy(true); setErr("");
    const when = new Date(day); when.setHours(slot.h, 0, 0, 0);
    const { client } = getSupabaseSafe();
    if (!client) { setErr("Not configured."); setBusy(false); return; }
    const { error } = await client.rpc("mp_trial_book_slot", { p_datetime: when.toISOString() });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onBooked();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-card">
      <div className="bg-gold/[0.08] p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A5E0F]">Step 3 · Book Your Trial</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Choose your trial date &amp; time</h2>
        <p className="mt-1 text-sm text-ink/60">Pick a slot that suits you. It&rsquo;s confirmed instantly — no waiting, no back-and-forth.</p>
      </div>
      <div className="p-6">
        <p className="mb-2 text-sm font-semibold text-ink">Select a date</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((d) => {
            const active = day && d.toDateString() === day.toDateString();
            return (
              <button key={d.toISOString()} onClick={() => setDay(d)}
                className={"flex shrink-0 flex-col items-center rounded-2xl border px-3.5 py-2.5 " + (active ? "border-gold bg-gold/15" : "border-hairline")}>
                <span className="text-[11px] font-semibold uppercase text-ink/50">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                <span className={"text-lg font-bold " + (active ? "text-[#7A5E0F]" : "text-ink")}>{d.getDate()}</span>
                <span className="text-[10px] text-ink/45">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-sm font-semibold text-ink">Select a time</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {SLOTS.map((sl) => (
            <button key={sl.label} onClick={() => setSlot(sl)}
              className={"rounded-xl border py-2.5 text-sm font-semibold " + (slot?.label === sl.label ? "border-gold bg-gold/20 text-[#7A5E0F]" : "border-hairline text-ink/70 hover:border-ink/40")}>{sl.label}</button>
          ))}
        </div>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        <button onClick={confirm} disabled={busy || !day || !slot} className="mt-5 w-full rounded-full bg-ink py-3.5 text-base font-semibold text-paper disabled:opacity-50">
          {busy ? "Confirming…" : "Confirm my trial — instant"}
        </button>
      </div>
    </div>
  );
}

// ---------- Step 4: Meet Your Teacher (allotted + Director confirmed) ----------
interface Expect {
  duration: string; intro: string; partner: string; assess: string[];
  songs: { title: string; matched: boolean; chords: string[]; capo?: number; line: string }[];
}
function ConfirmationCard({ session, completed }: { session: TrialSession | null; completed: boolean }) {
  const first = firstNameOf(session) || "your child";
  const when = session?.trial_datetime ? new Date(session.trial_datetime) : null;
  const whenStr = when ? when.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }) : "your chosen slot";
  const songs = (session?.dream_songs || []).map((d) => d.title).filter(Boolean);
  const [exp, setExp] = useState<Expect | null>(null);

  useEffect(() => {
    let on = true;
    fetch("/api/trial/expect", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ instrument: session?.instrument || "Guitar", student_name: first, songs: session?.dream_songs || [] }),
    }).then((r) => r.json()).then((j) => { if (on && j.ok) setExp(j); }).catch(() => {});
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.instrument]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-feature-green/30 bg-feature-green/[0.06] p-6 shadow-card">
        <div className="flex items-center gap-2 text-feature-green"><span className="text-2xl">✅</span><span className="font-display text-xl font-bold">Your trial is confirmed</span></div>
        <p className="mt-2 text-sm text-ink/75"><b>{whenStr}</b> · at home or online, as you prefer.</p>

        <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
          <p className="text-sm font-bold text-[#7A5E0F]">🎓 Your teacher will be allotted in advance.</p>
          <p className="mt-1 text-sm text-ink/70">
            Their details — along with the <b>Director&rsquo;s personal confirmation</b> — will reach you in a single message on <b>WhatsApp</b> before your class. You&rsquo;re not alone in this: Musicphonetics is with you at every step, from your very first class to the stage.
          </p>
        </div>

        {/* The trial code (OTP) */}
        {session?.trial_otp && !completed && (
          <div className="mt-3 rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/50">Your trial code</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-display text-3xl font-bold tracking-[0.3em] text-ink">{session.trial_otp}</span>
            </div>
            <p className="mt-1 text-sm text-ink/60">Read this code out to your teacher at the <b>end</b> of the class. Once they enter it, your trial is complete and your feedback opens.</p>
          </div>
        )}
      </div>

      {/* Elaborated what-to-expect (real chords + AI prose) */}
      <div className="rounded-3xl border border-hairline bg-white p-6 shadow-card">
        <h3 className="font-display text-lg font-bold text-ink">What to expect in your trial</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/75">{exp?.intro || `Your trial is a focused 45 to 60 minute one-to-one class, built entirely around ${first}. It is a real lesson, not a sales pitch.`}</p>

        {(exp?.songs || []).length > 0 && (
          <div className="mt-4 space-y-3">
            {exp!.songs.map((s, i) => (
              <div key={i} className="rounded-2xl border border-hairline bg-paper p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-ink">🎵 {s.title}</span>
                  {s.matched && (
                    <span className="flex flex-wrap justify-end gap-1">
                      {s.chords.map((c) => <span key={c} className="rounded-md border border-hairline bg-white px-2 py-0.5 font-mono text-xs text-ink">{c}</span>)}
                      {s.capo ? <span className="rounded-md bg-white px-2 py-0.5 text-xs text-ink/55">capo {s.capo}</span> : null}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.line}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-2 text-sm">
          <Row k="Duration" v={exp?.duration || "45–60 minutes, one-to-one"} />
          <Row k="Your teacher will carry" v={songs.length ? `${first}'s profile & your songs` : `${first}'s full profile`} />
        </div>

        {exp?.assess && (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7A5E0F]">In the trial we&rsquo;ll understand</p>
            <ul className="mt-2 space-y-1.5">
              {exp.assess.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-ink/70">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>{a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {exp?.partner && <p className="mt-4 rounded-xl bg-gold/[0.08] p-3 text-sm text-ink/70">🎸 {exp.partner}</p>}

        <p className="mt-4 text-xs text-ink/50">
          {completed ? "Your trial is complete — share your feedback below to unlock your pathway." : "Your feedback opens the moment your teacher closes the class with your trial code."}
        </p>
      </div>
    </div>
  );
}

// ---------- Step 5: Share Feedback (unlocks pathway) ----------
function FeedbackCard({ onSaved }: { onSaved: () => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!rating) { setErr("Please give a star rating."); return; }
    setBusy(true); setErr("");
    const { client } = getSupabaseSafe();
    if (!client) { setErr("Not configured."); setBusy(false); return; }
    const { error } = await client.rpc("mp_trial_trial_feedback", { p_rating: rating, p_text: text });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-card">
      <div className="bg-gold/[0.08] p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A5E0F]">Step 5 · After your trial</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">How was your trial?</h2>
        <p className="mt-1 text-sm text-ink/60">Your honest feedback helps us finalise the perfect pathway. This is the last step before your recommendation.</p>
      </div>
      <div className="p-6">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className={"text-4xl transition " + (n <= rating ? "text-gold" : "text-ink/20")}>★</button>
          ))}
        </div>
        <textarea className={inp + " mt-5"} rows={3} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="What did you enjoy? Any questions or concerns before you begin?" />
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={busy} className="mt-4 w-full rounded-full bg-ink py-3.5 text-base font-semibold text-paper disabled:opacity-60">
          {busy ? "Submitting…" : "Submit feedback & unlock my pathway"}
        </button>
      </div>
    </div>
  );
}

// ---------- Step 6: Your Learning Pathway (revealed after feedback) ----------
function PathwayCard({ session: s }: { session: TrialSession | null }) {
  const has = s?.director_review || s?.recommendation;
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gold/40 bg-gradient-to-b from-gold/[0.1] to-white p-6 shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7A5E0F]">Step 6 · Your Learning Pathway</p>
        {has ? (
          <>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#7A5E0F]">Reviewed by the Director</p>
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
          </>
        ) : (
          <>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">Thank you. 🎉</h2>
            <p className="mt-2 leading-relaxed text-ink/75">
              Your teacher&rsquo;s assessment is with the Director now. Your personalised pathway — the right plan, pace and next songs for you — is being prepared and will appear here, and on your WhatsApp, very shortly.
            </p>
            <p className="mt-3 text-sm text-ink/55">No templates, no guesswork — a real recommendation, made for you.</p>
          </>
        )}
      </div>
    </div>
  );
}
