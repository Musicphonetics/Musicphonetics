"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { track } from "@/lib/track";
import { TIERS, NON_BEGINNER_ROUTES, type Tier } from "@/lib/programTiers";
import {
  MOTIVATIONS, LEVELS, INSTRUMENTS, skillsFor, roadmapFor, dnaFor,
  type RoadmapWeek,
} from "@/lib/journey";

// ---------------------------------------------------------------------------
// The Musicphonetics "music journey" — not a form, a personalised experience
// that gradually becomes the student's profile. Inspire → Discover → Dream →
// (AI reads their first song) → Musical DNA + Roadmap → Mentor → Save → Portal.
// No fabricated facts: skills/roadmap are generic foundations; the AI writes
// only the warm narrative; the teacher personalises everything after the trial.
// ---------------------------------------------------------------------------

type Key = "name" | "motivation" | "instrument" | "inspiration" | "level" | "song";
const ORDER: Key[] = ["name", "motivation", "instrument", "inspiration", "level", "song"];

interface Report { ack: string; message: string; focus: string }

export function TrialStudio() {
  const params = useSearchParams();
  const router = useRouter();
  const presetInst = (() => { const v = params.get("instrument"); return v && INSTRUMENTS.some((i) => i.key === v) ? v : ""; })();

  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [inst, setInst] = useState(presetInst || "");
  const [inspiration, setInspiration] = useState("");
  const [levelKey, setLevelKey] = useState("");
  const [song, setSong] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chosen, setChosen] = useState<Tier["key"]>("main");
  const [report, setReport] = useState<Report | null>(null);

  const [key, setKey] = useState<Key>("name");
  const [hist, setHist] = useState<Key[]>([]);
  const [react, setReact] = useState("Hi! 👋 Let's discover your musical goal together — this takes about a minute, and there's a nice surprise at the end.");
  const [view, setView] = useState<"chat" | "analysing" | "reveal" | "opening">("chat");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const level = LEVELS.find((l) => l.key === levelKey) || null;
  const isBeginner = level ? level.beginner : true;
  const dna = useMemo(() => dnaFor(levelKey, motivation), [levelKey, motivation]);
  const first = name.split(" ")[0] || "there";

  const nextKey = useCallback((cur: Key): Key | "song-done" => {
    const i = ORDER.indexOf(cur);
    for (let j = i + 1; j < ORDER.length; j++) {
      const k = ORDER[j];
      if (k === "instrument" && presetInst) continue;
      return k;
    }
    return "song-done";
  }, [presetInst]);

  const go = (r: string, to: Key) => { setErr(""); setReact(r); setHist((h) => [...h, key]); setKey(to); };
  const back = () => { setErr(""); setHist((h) => { const c = [...h]; const prev = c.pop(); if (prev) setKey(prev); return c; }); };

  // The big moment: analyse the first song, then reveal the journey.
  const analyse = useCallback(async () => {
    setView("analysing"); setErr("");
    track("generate_lead", { instrument: inst, source: "journey", step: "analyse" });
    try {
      const r = await fetch("/api/ai/journey", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, instrument: inst, inspiration, motivation, level: level?.label, song }),
      });
      const j = await r.json().catch(() => ({}));
      setReport(j && j.ok ? { ack: j.ack, message: j.message, focus: j.focus } : null);
    } catch { setReport(null); }
    setView("reveal");
  }, [name, inst, inspiration, motivation, level, song]);

  const submit = useCallback(async () => {
    setBusy(true); setErr(""); setView("opening");
    try {
      const r = await fetch("/api/trial/start", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          student_name: name, who: "Myself", email, phone, instrument: inst || "Guitar",
          experience_level: level?.label || "Complete beginner",
          learning_goal: song ? `Dreams of playing “${song}”` : (isBeginner ? "Start correctly as a beginner" : `Interested in ${TIERS[chosen].name}`),
          dream_songs: song.trim() ? [{ title: song.trim(), lang: "" }] : [],
          answers: {
            first_song: song, motivation, inspiration, level: levelKey,
            musical_dna: dna.label, focus: report?.focus || "",
            recommended_program: isBeginner ? "foundation" : chosen,
          },
          utm_source: params.get("utm_source") || undefined, utm_medium: params.get("utm_medium") || undefined, utm_campaign: params.get("utm_campaign") || undefined,
        }),
      });
      const j = await r.json();
      if (!j.ok || !j.temp_password) { setErr(j.error || "Could not save your journey."); setView("reveal"); setBusy(false); return; }
      track("generate_lead", { instrument: inst, source: "journey", program: isBeginner ? "foundation" : chosen });
      const { client } = getSupabaseSafe();
      if (client) {
        const { error } = await client.auth.signInWithPassword({ email, password: j.temp_password });
        if (!error) { router.replace("/trial/dashboard"); return; }
      }
      router.replace("/trial/login?new=1");
    } catch { setErr("Could not reach the server."); setView("reveal"); setBusy(false); }
  }, [name, email, phone, inst, level, isBeginner, chosen, song, motivation, inspiration, levelKey, dna, report, params, router]);

  if (view === "opening") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
        <p className="mt-8 font-display text-2xl font-bold text-paper">Saving your musical journey…</p>
        <p className="mt-3 text-paper/60">Setting up {first}&rsquo;s private studio.</p>
      </div>
    );
  }

  if (view === "analysing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
        <p className="mt-8 font-display text-2xl font-bold text-paper">Analysing your goal…</p>
        <p className="mt-3 text-paper/60">Mapping the path to <span className="text-gold">“{song}”</span></p>
      </div>
    );
  }

  if (view === "reveal") {
    return <Reveal {...{ first, inst, inspiration, song, level, isBeginner, dna, report, chosen, setChosen, email, setEmail, phone, setPhone, onStart: submit, busy, err, onBack: () => { setView("chat"); setKey("song"); } }} />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <Header />
      <div className="mt-8 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 text-lg">🎵</span>
        <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-paper/90">{react}</div>
      </div>

      <div className="mt-8 flex-1">
        {key === "name" && (
          <Q title="First — what should we call you?">
            <input autoFocus className={INP} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) go(`Lovely to meet you, ${name.split(" ")[0]}! 🎶`, nextKey("name") as Key); }} />
          </Q>
        )}

        {key === "motivation" && (
          <Q title={`${first}, everyone has a reason the music called them.`} sub="What's pulling you toward it?">
            <div className="grid gap-3 sm:grid-cols-2">
              {MOTIVATIONS.map((m) => (
                <TileCard key={m.key} icon={m.icon} title={m.label} sub={m.sub} active={motivation === m.key}
                  onClick={() => { setMotivation(m.key); go("Beautiful reason. That's exactly the kind of learner we love. ✨", nextKey("motivation") as Key); }} />
              ))}
            </div>
          </Q>
        )}

        {key === "instrument" && (
          <Q title="Which instrument is calling you?">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INSTRUMENTS.map((o) => (
                <button key={o.key} type="button" onClick={() => { setInst(o.key); go(`${o.key} — a wonderful choice. 🎶`, nextKey("instrument") as Key); }}
                  className={"flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-5 font-semibold transition " +
                    (inst === o.key ? "border-gold bg-gold/15 text-paper" : "border-white/15 bg-white/5 text-paper/80 hover:border-white/35")}>
                  <span className="text-3xl">{o.icon}</span>{o.key}
                </button>
              ))}
            </div>
          </Q>
        )}

        {key === "inspiration" && (
          <Q title="Who — or what — inspired you?" sub="An artist, a band, a song, a moment. Type whatever comes to mind.">
            <input autoFocus className={INP} placeholder="e.g. Ed Sheeran, Arijit Singh, my grandfather…" value={inspiration} onChange={(e) => setInspiration(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && inspiration.trim()) go(ackFor(inspiration, inst), nextKey("inspiration") as Key); }} />
          </Q>
        )}

        {key === "level" && (
          <Q title="Where are you right now?" sub="Be honest — it just helps us start you in the right place.">
            <div className="grid gap-3">
              {LEVELS.map((l) => (
                <TileCard key={l.key} wide icon={l.icon} title={l.label} sub={l.sub} active={levelKey === l.key}
                  onClick={() => { setLevelKey(l.key); go(l.beginner ? "Perfect — starting right is everything. 🌱" : "Great — we'll pick up right where you are. 💪", nextKey("level") as Key); }} />
              ))}
            </div>
          </Q>
        )}

        {key === "song" && (
          <Q title={`If we handed you a ${(inst || "guitar").toLowerCase()} today…`} sub="What's the FIRST song you'd dream of playing? This is where the magic starts. ✨">
            <input autoFocus className={INP} placeholder="e.g. Perfect, Tum Hi Ho, Summer of '69…" value={song} onChange={(e) => setSong(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && song.trim()) analyse(); }} />
          </Q>
        )}
      </div>

      {err && <p className="mt-2 text-sm text-red-300">{err}</p>}

      <div className="sticky bottom-0 mt-6 flex items-center gap-3 bg-ink/80 py-3 backdrop-blur">
        {hist.length > 0 && <button onClick={back} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-paper/70 hover:text-paper">Back</button>}
        <button onClick={() => {
          if (key === "name") { if (!name.trim()) return setErr("Tell us your name to begin."); return go(`Lovely to meet you, ${first}! 🎶`, nextKey("name") as Key); }
          if (key === "inspiration") { if (!inspiration.trim()) return setErr("Give us a name — anyone who inspires you."); return go(ackFor(inspiration, inst), nextKey("inspiration") as Key); }
          if (key === "song") { if (!song.trim()) return setErr("One song — anything you love."); return analyse(); }
          setErr("Pick an option above to continue.");
        }} disabled={busy}
          className="flex-1 rounded-full bg-gold px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-[#f0d783] disabled:opacity-60">
          {key === "song" ? "Reveal my path →" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function ackFor(inspiration: string, inst: string) {
  const i = (inst || "music").toLowerCase();
  return `${inspiration.trim()} — brilliant. We can build your ${i} right around that sound. 🎯`;
}

// -------------------- Reveal: the journey + save --------------------
function Reveal(props: {
  first: string; inst: string; inspiration: string; song: string;
  level: { label: string } | null; isBeginner: boolean; dna: { label: string; blurb: string }; report: Report | null;
  chosen: Tier["key"]; setChosen: (k: Tier["key"]) => void;
  email: string; setEmail: (v: string) => void; phone: string; setPhone: (v: string) => void;
  onStart: () => void; busy: boolean; err: string; onBack: () => void;
}) {
  const { first, inst, inspiration, song, level, isBeginner, dna, report, chosen, setChosen, email, setEmail, phone, setPhone, onStart, busy, err, onBack } = props;
  const skills = skillsFor(inst);
  const weeks = roadmapFor(inst);
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState("");

  function trySave() {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setLocal("Enter a valid email — it becomes your login.");
    if (phone.replace(/\D/g, "").length < 8) return setLocal("Enter a valid phone / WhatsApp number.");
    setLocal(""); onStart();
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <Header />

      {/* We don't just take leads */}
      <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
        <p className="text-sm font-semibold text-gold">We don&rsquo;t just take down your details.</p>
        <p className="mt-1 text-sm text-paper/80">{first}, here&rsquo;s a real plan for your music — built around <b className="text-paper">you</b>, before you pay a rupee.</p>
      </div>

      {/* Musical DNA */}
      <div className="mt-5 rounded-3xl border border-white/12 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">🧬 Your Musical DNA</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-paper">You&rsquo;re {dna.label}.</h2>
        <p className="mt-1 text-sm text-paper/70">{dna.blurb}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <DnaRow k="Instrument" v={inst || "—"} />
          <DnaRow k="Inspired by" v={inspiration || "—"} />
          <DnaRow k="First goal" v={song || "—"} />
          <DnaRow k="Level" v={level?.label || "—"} />
        </div>
      </div>

      {/* AI report on the first song */}
      <div className="mt-5 rounded-3xl border border-white/12 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">Your path to “{song}”</p>
        {report?.message
          ? <p className="mt-2 text-sm leading-relaxed text-paper/85">{report.message}</p>
          : <p className="mt-2 text-sm leading-relaxed text-paper/85">Great news — you don&rsquo;t need to learn everything before you can start playing “{song}”. We break it into a few core skills and get you into the song early.</p>}

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-paper/50">Skills we&rsquo;ll build</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => <span key={s} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-paper/80">🎵 {s}</span>)}
        </div>
        {report?.focus && <p className="mt-4 border-l-2 border-gold pl-3 text-sm italic text-paper/80">{report.focus}</p>}
      </div>

      {/* 30-day roadmap */}
      <div className="mt-5">
        <p className="px-1 text-xs font-semibold uppercase tracking-widest text-gold">Your 30-day roadmap</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {weeks.map((w) => <WeekCard key={w.title} w={w} />)}
        </div>
        <p className="mt-3 px-1 text-xs text-paper/50">Your teacher personalises this roadmap after your free trial — this is the direction, they add the human touch.</p>
      </div>

      {/* Mentor preview (honest — matched, not invented) */}
      <div className="mt-5 flex items-center gap-4 rounded-3xl border border-white/12 bg-white/[0.04] p-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold/15 text-2xl">🎓</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Meet your mentor</p>
          <p className="mt-0.5 text-sm text-paper/85">A specialist {(inst || "music").toLowerCase()} mentor from our faculty will be hand-matched to you — and confirmed by the Director — before your trial.</p>
          <p className="mt-1 text-xs text-paper/50">10+ years faculty · Trinity-experienced · beginner-friendly</p>
        </div>
      </div>

      {/* Programme fit */}
      <div className="mt-5">
        <p className="px-1 text-xs font-semibold uppercase tracking-widest text-gold">Where you&rsquo;ll begin</p>
        {isBeginner ? (
          <div className="mt-3"><ProgramCard p={TIERS.foundation} highlight /></div>
        ) : (
          <div className="mt-3 space-y-3">
            {NON_BEGINNER_ROUTES.map((k) => (
              <button key={k} onClick={() => setChosen(k)} className="block w-full text-left"><ProgramCard p={TIERS[k]} selected={chosen === k} selectable /></button>
            ))}
          </div>
        )}
      </div>

      {/* Save the journey → profile */}
      <div className="mt-6 rounded-3xl border border-gold/40 bg-gold/[0.07] p-5">
        <p className="font-display text-lg font-bold text-paper">Let&rsquo;s save your musical journey</p>
        <p className="mt-1 text-sm text-paper/75">Your Musical DNA, first song and roadmap are ready. Create your free Musicphonetics profile so we can save everything and book your trial.</p>
        {!saving ? (
          <button onClick={() => setSaving(true)} className="mt-4 w-full rounded-full bg-gold px-6 py-4 text-base font-semibold text-ink transition hover:bg-[#f0d783]">Save my journey & book my free trial →</button>
        ) : (
          <div className="mt-4 space-y-3">
            <input className={INP} inputMode="email" placeholder="Email (your portal login)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={INP} inputMode="tel" placeholder="Phone / WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <p className="text-xs text-paper/45">🔒 Private to you — only for your trial and portal login. Your first class is free, no card needed.</p>
            {(local || err) && <p className="text-sm text-red-300">{local || err}</p>}
            <button onClick={trySave} disabled={busy} className="w-full rounded-full bg-gold px-6 py-4 text-base font-semibold text-ink transition hover:bg-[#f0d783] disabled:opacity-60">
              {busy ? "Saving…" : "Create my profile & continue →"}
            </button>
          </div>
        )}
      </div>

      <button onClick={onBack} className="mx-auto mt-5 block text-sm text-paper/50 hover:text-paper">← Change my answers</button>
    </div>
  );
}

function DnaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-paper/45">{k}</p>
      <p className="truncate text-sm font-semibold text-paper">{v}</p>
    </div>
  );
}
function WeekCard({ w }: { w: RoadmapWeek }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
      <p className="text-sm font-bold text-paper">{w.title}</p>
      <ul className="mt-2 space-y-1">
        {w.items.map((it) => <li key={it} className="flex items-start gap-2 text-xs text-paper/75"><span className="mt-0.5 text-gold">✦</span>{it}</li>)}
      </ul>
    </div>
  );
}

function ProgramCard({ p, highlight, selected, selectable }: { p: Tier; highlight?: boolean; selected?: boolean; selectable?: boolean }) {
  return (
    <div className={"rounded-3xl border p-5 transition " + (selected ? "border-gold bg-gold/10" : highlight ? "border-gold/50 bg-gold/[0.06]" : "border-white/12 bg-white/[0.04]")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-paper">{p.name}</h3>
          <p className="text-sm text-gold">{p.tagline}</p>
        </div>
        <div className="text-right">
          {p.strike && <div className="text-sm text-paper/40 line-through">{p.strike}</div>}
          <div className="font-display text-lg font-bold text-paper">{p.price}<span className="text-sm font-normal text-paper/50">{p.unit || ""}</span></div>
        </div>
      </div>
      {p.badge && <span className="mt-2 inline-block rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-ink">{p.badge}</span>}
      <p className="mt-3 text-sm leading-relaxed text-paper/70">{p.note}</p>
      <ul className="mt-3 space-y-1.5">
        {p.points.map((pt) => <li key={pt} className="flex items-start gap-2 text-sm text-paper/80"><span className="mt-0.5 text-gold">✦</span>{pt}</li>)}
      </ul>
      {selectable && <p className={"mt-3 text-sm font-semibold " + (selected ? "text-gold" : "text-paper/40")}>{selected ? "Selected ✓" : "Tap to choose"}</p>}
    </div>
  );
}

const INP = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-paper placeholder-paper/40 outline-none focus:border-gold";
function Header() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-gold/10 font-display text-lg font-bold text-gold">♪</span>
      <div>
        <div className="font-display text-lg font-bold leading-none text-paper">Musicphonetics</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80">Your music journey</div>
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
function TileCard({ icon, title, sub, active, onClick, wide }: { icon: string; title: string; sub: string; active: boolean; onClick: () => void; wide?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={"flex items-start gap-3 rounded-2xl border p-4 text-left transition " + (wide ? "w-full " : "") +
        (active ? "border-gold bg-gold/15" : "border-white/15 bg-white/5 hover:border-white/35")}>
      <span className="text-2xl">{icon}</span>
      <span className="min-w-0">
        <span className="block font-semibold text-paper">{title}</span>
        <span className="block text-xs text-paper/60">{sub}</span>
      </span>
    </button>
  );
}
