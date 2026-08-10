"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/track";

// ---------------------------------------------------------------------------
// The Musicphonetics Trial Studio. The moment someone books a trial they enter
// a personal, tokenised studio: an exciting questionnaire captures them (the
// lead saves the instant we have a contact), then a personalised curriculum
// reveal — "Your path to <song>" — turns interest into intent before any human
// speaks to them. Talks only to /api/trial/*.
// ---------------------------------------------------------------------------

interface Song {
  title: string; artist?: string; matched?: boolean; lang?: string;
  chords: string[]; capo?: number; chordCount?: number; classes: number;
  difficulty?: string; weeks?: number; playBy?: string; playByISO?: string;
}
interface Plan {
  instrument: string; startDate: string; pace: string;
  songs: Song[]; primary: Song; uniqueChords: string[];
  headline: string; roadmap: { when: string; t: string; d: string }[];
  guitar: { type: string; forWhom: string; budget: string; note: string; partner: string };
  narration: string; aiGenerated?: boolean;
}
interface Session {
  token: string; status: string; student_name?: string; who?: string;
  student_age?: string; instrument?: string; experience_level?: string;
  learning_goal?: string; dream_songs?: { title: string; lang?: string }[];
  plan?: Plan | null; guitar_reco?: Plan["guitar"] | null;
  teacher_summary?: string | null; director_note?: string | null;
  feedback?: { by: string; text: string; at: string }[];
}

const INSTRUMENTS = ["Guitar", "Piano", "Keyboard", "Vocals", "Ukulele", "Drums"];
const EXPERIENCE = ["Complete beginner", "Know a little", "Played before"];
const GOALS = ["Play songs I love", "Learn it properly", "Exam / grades (Trinity)", "Perform on stage", "Just for fun & relaxation"];
const STARTS = ["This week", "Within 2 weeks", "This month", "Just exploring"];

const WA = "918796199188";

export function TrialStudio() {
  const params = useSearchParams();
  const [view, setView] = useState<"questions" | "analyzing" | "studio">("questions");
  const [session, setSession] = useState<Session | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  // answers
  const presetInst = (() => {
    const v = params.get("instrument");
    return v && INSTRUMENTS.includes(v) ? v : "";
  })();
  const [inst, setInst] = useState(presetInst || "Guitar");
  const [who, setWho] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [exp, setExp] = useState("");
  const [goal, setGoal] = useState("");
  const [songs, setSongs] = useState<{ title: string; lang: string }[]>([{ title: "", lang: "" }, { title: "", lang: "" }]);
  const [start, setStart] = useState("");

  const [qi, setQi] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const analyzeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume from a saved studio if a token is in the URL.
  useEffect(() => {
    const t = params.get("token");
    if (!t) { setBooting(false); return; }
    (async () => {
      try {
        const r = await fetch(`/api/trial/get?token=${encodeURIComponent(t)}`);
        const j = await r.json();
        if (j.ok && j.session) {
          setToken(t); setSession(j.session);
          if (j.session.plan) { setPlan(j.session.plan); setView("studio"); }
          else { setView("questions"); }
        }
      } catch { /* fall through to fresh questionnaire */ }
      finally { setBooting(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (analyzeRef.current) clearTimeout(analyzeRef.current); }, []);

  // Ordered question keys (skip instrument when deep-linked with one).
  const STEPS = (presetInst ? [] : ["instrument"]).concat(["who", "contact", "experience", "goal", "songs", "start"]);
  const stepKey = STEPS[qi];
  const pct = Math.round(((qi + 1) / STEPS.length) * 100);

  const createSession = useCallback(async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/trial/start", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          student_name: name, who, student_age: who === "My child" ? age : "",
          parent_name: who === "My child" ? name : "", phone, email, instrument: inst,
          experience_level: exp, learning_goal: goal,
          source: "trial_studio", landing_page: "/studio",
          utm_source: params.get("utm_source") || undefined,
          utm_medium: params.get("utm_medium") || undefined,
          utm_campaign: params.get("utm_campaign") || undefined,
        }),
      });
      const j = await r.json();
      if (!j.ok || !j.token) { setErr(j.error || "Could not save your studio. Please try again."); return false; }
      setToken(j.token);
      try { window.history.replaceState(null, "", `/studio?token=${j.token}`); } catch { /* noop */ }
      track("generate_lead", { instrument: inst, source: "trial_studio" });
      return true;
    } catch { setErr("Could not reach the server. Please try again."); return false; }
    finally { setBusy(false); }
  }, [name, who, age, phone, email, inst, exp, goal, params]);

  const submitAnswers = useCallback(async () => {
    if (!token) { setErr("Session missing. Please refresh."); return; }
    setView("analyzing"); setBusy(true); setErr("");
    const started = Date.now();
    let got: Plan | null = null;
    try {
      const r = await fetch("/api/trial/answers", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token, instrument: inst, experience_level: exp, learning_goal: goal,
          preferred_start: start, dream_songs: songs.filter((s) => s.title.trim()),
          answers: { who, student_age: age, name, phone, email, experience: exp, goal, start, songs },
        }),
      });
      const j = await r.json();
      if (j.ok && j.plan) got = j.plan;
    } catch { /* handled below */ }
    // keep the "analyzing" drama for at least 2s
    const wait = Math.max(0, 2000 - (Date.now() - started));
    analyzeRef.current = setTimeout(() => {
      setBusy(false);
      if (got) { setPlan(got); setView("studio"); track("book_trial", { instrument: inst, source: "trial_studio" }); }
      else { setErr("We saved your details. Let's finish on WhatsApp."); setView("studio"); }
    }, wait);
  }, [token, inst, exp, goal, start, songs, who, age, name, phone, email]);

  // Advance / validate per step.
  const next = useCallback(async () => {
    setErr("");
    if (stepKey === "instrument" && !inst) return setErr("Pick an instrument to continue.");
    if (stepKey === "who" && (!who || !name.trim())) return setErr("Tell us who is learning and a name.");
    if (stepKey === "contact") {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 8) return setErr("Please enter a valid phone number.");
      const ok = await createSession();
      if (!ok) return;
    }
    if (stepKey === "experience" && !exp) return setErr("Pick one to continue.");
    if (stepKey === "goal" && !goal) return setErr("Pick what you're after.");
    if (stepKey === "songs" && !songs.some((s) => s.title.trim())) return setErr("Add at least one song you dream of playing.");
    if (stepKey === "start") { if (!start) return setErr("Pick when you'd like to start."); return submitAnswers(); }
    setQi((i) => Math.min(i + 1, STEPS.length - 1));
  }, [stepKey, inst, who, name, phone, exp, goal, songs, start, createSession, submitAnswers, STEPS.length]);

  if (booting) return <div className="min-h-screen bg-ink" />;

  if (view === "analyzing") return <Analyzing name={name || session?.student_name} song={songs.find((s) => s.title)?.title} />;
  if (view === "studio" && plan) return <Studio token={token} plan={plan} name={name || session?.student_name} session={session} inst={inst} />;

  // -------------------- Questionnaire --------------------
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <StudioHeader />
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-10 flex-1">
        {stepKey === "instrument" && (
          <Q title="What would you like to learn?" sub="Pick your instrument.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INSTRUMENTS.map((o) => (
                <Choice key={o} active={inst === o} onClick={() => setInst(o)}>{o}</Choice>
              ))}
            </div>
          </Q>
        )}

        {stepKey === "who" && (
          <Q title="Who is this for?" sub="So we personalise everything.">
            <div className="grid grid-cols-2 gap-3">
              {["Myself", "My child"].map((o) => (
                <Choice key={o} active={who === o} onClick={() => setWho(o)}>{o}</Choice>
              ))}
            </div>
            <input className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-paper placeholder-paper/40 outline-none focus:border-gold"
              placeholder={who === "My child" ? "Child's name" : "Your name"} value={name} onChange={(e) => setName(e.target.value)} />
            {who === "My child" && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {["4-7", "8-12", "13-17", "18+"].map((a) => (
                  <Choice key={a} active={age === a} onClick={() => setAge(a)} small>{a}</Choice>
                ))}
              </div>
            )}
          </Q>
        )}

        {stepKey === "contact" && (
          <Q title="Where do we send your plan?" sub="We save your studio and reserve a trial slot. No spam, ever.">
            <input className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-paper placeholder-paper/40 outline-none focus:border-gold"
              inputMode="tel" placeholder="Phone / WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-paper placeholder-paper/40 outline-none focus:border-gold"
              inputMode="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="mt-3 text-xs text-paper/45">🔒 Your studio is private to you. We use this only to arrange your free trial.</p>
          </Q>
        )}

        {stepKey === "experience" && (
          <Q title={`How much ${inst.toLowerCase()} do you know?`} sub="Be honest, it helps us pitch it perfectly.">
            <div className="grid gap-3">
              {EXPERIENCE.map((o) => <Choice key={o} active={exp === o} onClick={() => setExp(o)} wide>{o}</Choice>)}
            </div>
          </Q>
        )}

        {stepKey === "goal" && (
          <Q title="What are you really after?" sub="Your reason shapes your plan.">
            <div className="grid gap-3">
              {GOALS.map((o) => <Choice key={o} active={goal === o} onClick={() => setGoal(o)} wide>{o}</Choice>)}
            </div>
          </Q>
        )}

        {stepKey === "songs" && (
          <Q title="Which 2 songs do you dream of playing?" sub="Hindi or English, whatever moves you. This is where the magic starts. 🎶">
            {songs.map((s, i) => (
              <div key={i} className="mt-3">
                <div className="flex items-center gap-2">
                  <input className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-paper placeholder-paper/40 outline-none focus:border-gold"
                    placeholder={i === 0 ? "e.g. Country Roads, Tum Hi Ho…" : "Second song (optional)"}
                    value={s.title}
                    onChange={(e) => setSongs((prev) => prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                </div>
                <div className="mt-2 flex gap-2">
                  {["English", "Hindi"].map((l) => (
                    <button key={l} type="button"
                      onClick={() => setSongs((prev) => prev.map((x, j) => (j === i ? { ...x, lang: x.lang === l ? "" : l } : x)))}
                      className={"rounded-full border px-3 py-1 text-xs font-semibold transition " + (s.lang === l ? "border-gold bg-gold/20 text-gold" : "border-white/15 text-paper/50")}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Q>
        )}

        {stepKey === "start" && (
          <Q title="When would you like to start?" sub="The sooner you start, the sooner you play.">
            <div className="grid gap-3">
              {STARTS.map((o) => <Choice key={o} active={start === o} onClick={() => setStart(o)} wide>{o}</Choice>)}
            </div>
          </Q>
        )}
      </div>

      {err && <p className="mt-2 text-sm text-red-300">{err}</p>}

      <div className="sticky bottom-0 mt-6 flex items-center gap-3 bg-ink/80 py-3 backdrop-blur">
        {qi > 0 && (
          <button onClick={() => { setErr(""); setQi((i) => Math.max(0, i - 1)); }}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-paper/70 hover:text-paper">
            Back
          </button>
        )}
        <button onClick={next} disabled={busy}
          className="flex-1 rounded-full bg-gold px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-[#f0d783] disabled:opacity-60">
          {busy ? "Please wait…" : stepKey === "start" ? "Reveal my plan ✨" : "Continue"}
        </button>
      </div>
    </div>
  );
}

// ---------------- pieces ----------------

function StudioHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-gold/10 font-display text-lg font-bold text-gold">♪</span>
        <div>
          <div className="font-display text-lg font-bold leading-none text-paper">Musicphonetics</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80">Trial Studio</div>
        </div>
      </div>
    </div>
  );
}

function Q({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="animate-[fadeIn_.35s_ease]">
      <h1 className="font-display text-2xl font-bold leading-tight text-paper sm:text-3xl">{title}</h1>
      {sub && <p className="mt-2 text-paper/60">{sub}</p>}
      <div className="mt-6">{children}</div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function Choice({ active, onClick, children, wide, small }: { active: boolean; onClick: () => void; children: React.ReactNode; wide?: boolean; small?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={
        "rounded-xl border text-left font-semibold transition-all " +
        (small ? "px-2 py-2.5 text-center text-sm " : "px-4 py-3.5 ") +
        (wide ? "w-full " : "") +
        (active ? "border-gold bg-gold/15 text-paper shadow-[0_0_0_1px_rgba(231,203,110,.5)]" : "border-white/15 bg-white/5 text-paper/80 hover:border-white/35")
      }>
      {children}
    </button>
  );
}

function Analyzing({ name, song }: { name?: string; song?: string }) {
  const [i, setI] = useState(0);
  const msgs = [
    "Reading your answers…",
    song ? `Mapping the chords for "${song}"…` : "Mapping your first songs…",
    "Building your personal class plan…",
    "Calculating your play-by date…",
  ];
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % msgs.length), 700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
      <p className="mt-8 font-display text-2xl font-bold text-paper">{name ? `${name}, ` : ""}building your plan</p>
      <p className="mt-3 text-paper/60">{msgs[i]}</p>
    </div>
  );
}

// -------------------- The Studio dashboard --------------------

function Studio({ token, plan, name, session, inst }: { token: string | null; plan: Plan; name?: string; session: Session | null; inst: string }) {
  const primary = plan.primary;
  const wa =
    `https://wa.me/${WA}?text=` +
    encodeURIComponent(`Hi Musicphonetics! I just built my Trial Studio${name ? ` (${name})` : ""}. I want to book my free ${inst} trial and start playing "${primary?.title}".`);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-8">
      <StudioHeader />

      {/* Reveal */}
      <div className="mt-8 rounded-3xl border border-gold/25 bg-gradient-to-b from-gold/[0.12] to-transparent p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Your personal path</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
          {name ? `${name}, here's` : "Here's"} your path to<br /><span className="text-gold">“{primary?.title}”.</span>
        </h1>
        <p className="mt-4 leading-relaxed text-paper/80">{plan.narration}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-paper">
          🎯 Play it by <span className="text-gold">{primary?.playBy}</span>
        </div>
      </div>

      {/* Songs */}
      <SectionTitle>Your dream songs, decoded</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {plan.songs.map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-paper">{s.title}</h3>
                {s.artist && <p className="text-xs text-paper/50">{s.artist}</p>}
              </div>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold">{s.difficulty}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.chords.map((c) => (
                <span key={c} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 font-mono text-xs text-paper">{c}</span>
              ))}
              {s.capo ? <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-paper/60">capo {s.capo}</span> : null}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-paper/60">~{s.classes} classes</span>
              <span className="font-semibold text-gold">by {s.playBy}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <SectionTitle>Your class-by-class roadmap</SectionTitle>
      <ol className="relative space-y-4 border-l border-white/12 pl-6">
        {plan.roadmap.map((r, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-ink">{i + 1}</span>
            <div className="text-xs font-semibold uppercase tracking-wide text-gold/80">{r.when}</div>
            <div className="font-semibold text-paper">{r.t}</div>
            <div className="text-sm text-paper/60">{r.d}</div>
          </li>
        ))}
      </ol>

      {/* Guitar reco + events */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Your instrument</p>
          <h3 className="mt-1 font-display text-lg font-bold text-paper">{plan.guitar.type}</h3>
          <p className="mt-1 text-sm text-paper/65">{plan.guitar.forWhom}</p>
          <p className="mt-3 text-sm text-paper/80">Budget to start: <span className="font-semibold text-gold">{plan.guitar.budget}</span></p>
          <p className="mt-2 text-sm text-paper/60">{plan.guitar.note}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Upcoming</p>
          <h3 className="mt-1 font-display text-lg font-bold text-paper">Open Mic &amp; Chai</h3>
          <p className="mt-1 text-sm text-paper/65">Our students perform on a real stage every quarter. You are invited from day one.</p>
          <p className="mt-3 text-sm text-paper/80">Your goal: play <span className="font-semibold text-gold">“{primary?.title}”</span> live.</p>
        </div>
      </div>

      {/* Director / teacher note (fills in once your mentor adds it) */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">A note from your mentor</p>
        {session?.director_note || session?.teacher_summary ? (
          <p className="mt-2 leading-relaxed text-paper/85">{session.director_note || session.teacher_summary}</p>
        ) : (
          <p className="mt-2 text-sm text-paper/55">Abhishek and your matched teacher will add a personal pre-assessment note here after they review your answers. Keep an eye on your studio.</p>
        )}
      </div>

      {/* Feedback */}
      <FeedbackBox token={token} />

      {/* CTA */}
      <div className="mt-8 rounded-3xl bg-gold p-6 text-center text-ink sm:p-8">
        <h2 className="font-display text-2xl font-bold">Lock in your free trial</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/75">
          Your studio is saved. Confirm on WhatsApp and we&rsquo;ll match your teacher and set your first class.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-paper">
          Confirm my free trial →
        </a>
        <p className="mt-3 text-xs text-ink/60">Bookmark this page — it&rsquo;s your private studio and becomes your student portal.</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-10 font-display text-xl font-bold text-paper">{children}</h2>;
}

function FeedbackBox({ token }: { token: string | null }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!token || !text.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/trial/feedback", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, text }),
      });
      setSent(true); setText("");
    } catch { /* ignore */ } finally { setBusy(false); }
  };
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">Tell us anything</p>
      <h3 className="mt-1 font-display text-lg font-bold text-paper">A question, a worry, a request?</h3>
      {sent ? (
        <p className="mt-3 text-sm text-gold">Got it — we&rsquo;ll bring this up in your trial. 🙌</p>
      ) : (
        <>
          <textarea className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper placeholder-paper/40 outline-none focus:border-gold"
            rows={3} placeholder="e.g. My child is shy, or I only have weekends free…" value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={send} disabled={busy || !text.trim()}
            className="mt-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
            {busy ? "Sending…" : "Send to my mentor"}
          </button>
        </>
      )}
    </div>
  );
}
