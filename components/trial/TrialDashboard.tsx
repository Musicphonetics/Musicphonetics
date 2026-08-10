"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// The Trial Portal ("Trial Zone"). A premium, logged-in assessment dashboard —
// the salesperson. It shows the family their journey, collects a real pre-
// assessment, advertises events, and reveals the human-made recommendation once
// the teacher and Director have assessed. It is NOT the student dashboard; on
// enrolment this same account converts to the full Student Portal.
// ---------------------------------------------------------------------------

interface PreAssessment {
  favourite_artists?: string;
  why?: string;
  parent_objective?: string;
  schedule?: string;
  owns_instrument?: string;
  goal?: string;
}
interface Session {
  stage: string; status?: string; student_name?: string; who?: string; student_age?: string;
  instrument?: string; experience_level?: string; learning_goal?: string;
  dream_songs?: { title: string; lang?: string }[]; pre_assessment?: PreAssessment;
  teacher_summary?: string | null; director_note?: string | null;
  director_review?: { text?: string; path?: string; instrument?: string; frequency?: string; start_window?: string } | null;
  recommendation?: { path?: string; price?: string; monthly?: string } | null;
  trial_datetime?: string | null; feedback?: { by: string; text: string; at: string }[];
}

const STAGES = [
  { key: "booked", label: "Trial Booked" },
  { key: "pre_assessed", label: "Pre-Assessment" },
  { key: "teacher_assigned", label: "Teacher Assigned" },
  { key: "trial_done", label: "Trial Session" },
  { key: "assessed", label: "Teacher Assessment" },
  { key: "director_reviewed", label: "Director Review" },
  { key: "recommended", label: "Your Recommendation" },
  { key: "enrolled", label: "Start Your Journey" },
];
const ORDER: Record<string, number> = {
  booked: 0, pre_assessed: 1, teacher_assigned: 2, trial_scheduled: 2, trial_done: 3,
  assessed: 4, director_reviewed: 5, recommended: 6, enrolled: 7, nurture: 6,
};

const EVENTS = [
  { icon: "🎤", t: "Open Mic & Chai", d: "Our students perform live, every quarter." },
  { icon: "🏆", t: "Student Showcase", d: "A real stage, real applause." },
  { icon: "🎼", t: "Trinity Exam Prep", d: "Graded milestones, done right." },
  { icon: "🔥", t: "Summer Music Camp", d: "Intensive, fun, unforgettable." },
];

export function TrialDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [s, setS] = useState<Session | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const { client } = getSupabaseSafe();
    if (!client) { setErr("Portal not configured."); setLoading(false); return; }
    const { data: { session } } = await client.auth.getSession();
    if (!session) { router.replace("/trial/login"); return; }
    const { data, error } = await client.rpc("mp_trial_mine");
    if (error) setErr(error.message);
    setS((data as Session) || null);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const signOut = async () => {
    const { client } = getSupabaseSafe();
    await client?.auth.signOut();
    router.replace("/trial/login");
  };

  if (loading) return <div className="grid min-h-screen place-items-center bg-ink"><div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-gold" /></div>;

  const stageIdx = s ? (ORDER[s.stage] ?? 0) : 0;
  const firstName = (s?.student_name || "").split(" ")[0];
  const preDone = !!(s?.pre_assessment && Object.keys(s.pre_assessment).length > 0) || stageIdx >= 1;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-gold/10 font-display text-lg font-bold text-gold">♪</span>
          <div>
            <div className="font-display text-base font-bold leading-none text-paper">Musicphonetics</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80">Trial Zone</div>
          </div>
        </div>
        <button onClick={signOut} className="text-xs font-semibold text-paper/50 hover:text-paper">Sign out</button>
      </div>

      {err && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{err}</p>}

      {/* Welcome */}
      <div className="mt-6 rounded-3xl border border-gold/20 bg-gradient-to-b from-gold/[0.12] to-transparent p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Welcome to Musicphonetics</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
          {firstName ? `${firstName}'s` : "Your"} musical journey begins here.
        </h1>
        <p className="mt-3 text-paper/70">
          {s?.instrument ? `${s.instrument} · ` : ""}This is your private space. Follow every step below, from your
          assessment to your personalised recommendation.
        </p>
      </div>

      {/* Journey stepper */}
      <SectionTitle>Your trial journey</SectionTitle>
      <ol className="space-y-2">
        {STAGES.map((st, i) => {
          const done = i < stageIdx, current = i === stageIdx;
          return (
            <li key={st.key} className={"flex items-center gap-3 rounded-xl border px-4 py-3 " +
              (current ? "border-gold/50 bg-gold/10" : done ? "border-white/10 bg-white/[0.03]" : "border-white/8 bg-transparent")}>
              <span className={"grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold " +
                (done ? "bg-gold text-ink" : current ? "bg-gold/30 text-gold" : "bg-white/10 text-paper/40")}>
                {done ? "✓" : i + 1}
              </span>
              <span className={"text-sm font-semibold " + (done || current ? "text-paper" : "text-paper/45")}>{st.label}</span>
              {current && <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-gold">In progress</span>}
            </li>
          );
        })}
      </ol>

      {/* Pre-assessment */}
      {!preDone ? (
        <PreAssessmentForm session={s} onSaved={load} />
      ) : (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Pre-assessment ✓</p>
          <p className="mt-1 text-sm text-paper/70">Thank you. Your teacher will walk in already knowing {firstName || "the student"}. You can add more any time by messaging us.</p>
        </div>
      )}

      {/* Recommendation — locked until the Director reviews */}
      <SectionTitle>Your personalised recommendation</SectionTitle>
      {s?.director_review || s?.recommendation ? (
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Reviewed by the Director</p>
          {s?.director_review?.text && <p className="mt-2 leading-relaxed text-paper/85">{s.director_review.text}</p>}
          <div className="mt-4 grid gap-2 text-sm text-paper/80">
            {s?.director_review?.path && <Row k="Recommended path" v={s.director_review.path} />}
            {s?.director_review?.instrument && <Row k="Starting instrument" v={s.director_review.instrument} />}
            {s?.director_review?.frequency && <Row k="Class frequency" v={s.director_review.frequency} />}
            {s?.director_review?.start_window && <Row k="Suggested start" v={s.director_review.start_window} />}
          </div>
          {s?.recommendation?.path && (
            <a href="/pay" className="mt-5 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">
              Start my journey — {s.recommendation.path}{s.recommendation.monthly ? ` (${s.recommendation.monthly})` : ""} →
            </a>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
          <div className="text-2xl">🔒</div>
          <p className="mt-2 font-semibold text-paper/80">Unlocks after your assessment</p>
          <p className="mt-1 text-sm text-paper/50">Your teacher will assess {firstName || "the student"} in the trial class, then the Director personally reviews and recommends your path. No guesswork.</p>
        </div>
      )}

      {/* Mentor note */}
      {(s?.director_note || s?.teacher_summary) && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">A note from your mentor</p>
          <p className="mt-2 leading-relaxed text-paper/85">{s.director_note || s.teacher_summary}</p>
        </div>
      )}

      {/* Events */}
      <SectionTitle>What&rsquo;s happening at Musicphonetics</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {EVENTS.map((e) => (
          <div key={e.t} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <span className="text-2xl">{e.icon}</span>
            <div>
              <div className="font-semibold text-paper">{e.t}</div>
              <div className="text-sm text-paper/60">{e.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <FeedbackBox onSaved={load} existing={s?.feedback} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 border-b border-white/8 py-1.5"><span className="text-paper/55">{k}</span><span className="font-semibold text-paper">{v}</span></div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-10 font-display text-xl font-bold text-paper">{children}</h2>;
}

const inp = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper placeholder-paper/40 outline-none focus:border-gold";

function PreAssessmentForm({ session, onSaved }: { session: Session | null; onSaved: () => void }) {
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
    <div className="mt-8 rounded-3xl border border-gold/25 bg-white/[0.04] p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">Step 2 · takes 2 minutes</p>
      <h3 className="mt-1 font-display text-xl font-bold text-paper">Your pre-assessment</h3>
      <p className="mt-1 text-sm text-paper/60">So your teacher walks in already knowing you. The more you share, the more personal your trial.</p>

      <label className="mt-5 block text-sm font-semibold text-paper/80">Which 2 songs do you dream of playing? <span className="font-normal text-paper/45">(Hindi or English)</span></label>
      {songs.map((s, i) => (
        <input key={i} className={inp + " mt-2"} placeholder={i === 0 ? "e.g. Country Roads, Tum Hi Ho…" : "Second song (optional)"}
          value={s.title} onChange={(e) => setSongs((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
      ))}

      <label className="mt-5 block text-sm font-semibold text-paper/80">Favourite artists or bands</label>
      <input className={inp + " mt-2"} placeholder="Who do you love listening to?" value={artists} onChange={(e) => setArtists(e.target.value)} />

      <label className="mt-5 block text-sm font-semibold text-paper/80">Why do you want to learn?</label>
      <textarea className={inp + " mt-2"} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Your reason, in your words." />

      <label className="mt-5 block text-sm font-semibold text-paper/80">As a parent, what&rsquo;s your objective? <span className="font-normal text-paper/45">(if for a child)</span></label>
      <input className={inp + " mt-2"} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What would make this worth it for you?" />

      <label className="mt-5 block text-sm font-semibold text-paper/80">Preferred schedule</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {["Weekday evenings", "Weekday daytime", "Weekends", "Flexible"].map((o) => (
          <Pill key={o} active={schedule === o} onClick={() => setSchedule(o)}>{o}</Pill>
        ))}
      </div>

      <label className="mt-5 block text-sm font-semibold text-paper/80">Do you already own an instrument?</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {["Yes", "No", "Not sure"].map((o) => <Pill key={o} active={owns === o} onClick={() => setOwns(o)}>{o}</Pill>)}
      </div>

      <label className="mt-5 block text-sm font-semibold text-paper/80">Your main goal</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {["Play for fun", "Learn properly", "Exams / grades", "Perform on stage"].map((o) => <Pill key={o} active={goal === o} onClick={() => setGoal(o)}>{o}</Pill>)}
      </div>

      {err && <p className="mt-3 text-sm text-red-300">{err}</p>}
      <button onClick={save} disabled={busy}
        className="mt-6 w-full rounded-full bg-gold py-3.5 text-base font-semibold text-ink disabled:opacity-60">
        {busy ? "Saving…" : "Submit my pre-assessment"}
      </button>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={"rounded-full border px-3.5 py-2 text-sm font-semibold transition " +
        (active ? "border-gold bg-gold/20 text-gold" : "border-white/15 text-paper/60 hover:border-white/35")}>
      {children}
    </button>
  );
}

function FeedbackBox({ onSaved, existing }: { onSaved: () => void; existing?: { by: string; text: string; at: string }[] }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const { client } = getSupabaseSafe();
    if (client) await client.rpc("mp_trial_feedback", { p_text: text });
    setBusy(false); setSent(true); setText(""); onSaved();
  };
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">Talk to us</p>
      <h3 className="mt-1 font-display text-lg font-bold text-paper">A question or concern before you begin?</h3>
      {existing && existing.length > 0 && (
        <p className="mt-2 text-xs text-paper/45">You&rsquo;ve sent {existing.length} message{existing.length > 1 ? "s" : ""}. We&rsquo;re on it.</p>
      )}
      {sent ? (
        <p className="mt-3 text-sm text-gold">Got it — we&rsquo;ll bring this up personally. 🙌</p>
      ) : (
        <>
          <textarea className={inp + " mt-3"} rows={3} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="e.g. My child is shy, or I only have weekends free, or can we speak to the Director?" />
          <button onClick={send} disabled={busy || !text.trim()}
            className="mt-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
            {busy ? "Sending…" : "Send to my mentor"}
          </button>
        </>
      )}
    </div>
  );
}
