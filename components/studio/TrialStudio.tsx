"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { track } from "@/lib/track";
import { TIERS, NON_BEGINNER_ROUTES, type Tier } from "@/lib/programTiers";

// ---------------------------------------------------------------------------
// The Musicphonetics concierge — a warm, Duolingo-style intake you can drop in
// any WhatsApp chat. One question at a time, it reacts to every answer like a
// human, works out whether the person is a true beginner, then reveals the
// right programme + fees and opens their Trial Portal. No fabricated data.
// ---------------------------------------------------------------------------

const INSTRUMENTS = ["Guitar", "Piano", "Keyboard", "Vocals", "Ukulele", "Drums"];
const EXPERIENCE = ["Complete beginner", "I know a little", "I can already play a bit"];
const TIMING = ["Immediately", "This week", "This month", "Just exploring"];

type Key = "name" | "instrument" | "song" | "experience" | "strings" | "chords" | "timing" | "contact";
const ORDER: Key[] = ["name", "instrument", "song", "experience", "strings", "chords", "timing", "contact"];

export function TrialStudio() {
  const params = useSearchParams();
  const router = useRouter();
  const presetInst = (() => { const v = params.get("instrument"); return v && INSTRUMENTS.includes(v) ? v : ""; })();

  const [name, setName] = useState("");
  const [inst, setInst] = useState(presetInst || "");
  const [song, setSong] = useState("");
  const [exp, setExp] = useState("");
  const [strings, setStrings] = useState(""); // Yes / No
  const [chords, setChords] = useState("");   // Yes / Not yet
  const [timing, setTiming] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chosen, setChosen] = useState<Tier["key"]>("main");

  const [key, setKey] = useState<Key>(presetInst ? "name" : "name");
  const [hist, setHist] = useState<Key[]>([]);
  const [react, setReact] = useState("Hey! 👋 I'm your Musicphonetics guide. Let's find your perfect start — 60 seconds, promise.");
  const [view, setView] = useState<"chat" | "reveal" | "opening">("chat");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const skipProbes = exp === "Complete beginner";
  const isBeginner = useMemo(() => !(strings === "Yes" || chords === "Yes"), [strings, chords]);

  const nextKey = useCallback((cur: Key): Key | "reveal" => {
    const i = ORDER.indexOf(cur);
    for (let j = i + 1; j < ORDER.length; j++) {
      const k = ORDER[j];
      if ((k === "strings" || k === "chords") && skipProbes) continue;
      if (k === "instrument" && presetInst) continue;
      return k;
    }
    return "reveal";
  }, [skipProbes, presetInst]);

  const go = (r: string, to: Key | "reveal") => {
    setErr(""); setReact(r); setHist((h) => [...h, key]);
    if (to === "reveal") setView("reveal"); else setKey(to);
  };
  const back = () => {
    setErr("");
    setHist((h) => { const c = [...h]; const prev = c.pop(); if (prev) setKey(prev); return c; });
  };

  // Human reactions.
  const instReact = (i: string) => ({
    Guitar: "Guitar — the instrument of a thousand songs. Great pick. 🎸",
    Piano: "Piano — timeless. Beautiful choice. 🎹",
    Keyboard: "Keyboard — so much fun and so versatile. 🎹",
    Vocals: "Your voice — the most personal instrument of all. 🎤",
    Ukulele: "Ukulele — the happiest four strings in music. 😄",
    Drums: "Drums — pure energy. I like your style. 🥁",
  } as Record<string, string>)[i] || "Great choice!";
  const timingReact = (t: string) => ({
    Immediately: "Oh, I LOVE that energy! Let's not waste a day. 🔥",
    "This week": "Perfect — momentum is everything. 🙌",
    "This month": "Lovely. We'll get you set up beautifully.",
    "Just exploring": "Totally fine — let's show you what this could look like. 😊",
  } as Record<string, string>)[t] || "";

  const submit = useCallback(async () => {
    setBusy(true); setErr(""); setView("opening");
    try {
      const r = await fetch("/api/trial/start", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          student_name: name, who: "Myself", email, phone, instrument: inst || "Guitar",
          experience_level: exp, learning_goal: isBeginner ? "Start correctly as a beginner" : `Interested in ${TIERS[chosen].name}`,
          dream_songs: song.trim() ? [{ title: song.trim(), lang: "" }] : [],
          answers: { first_song: song, timing, knows_strings: strings, knows_chords: chords, recommended_program: isBeginner ? "foundation" : chosen },
          utm_source: params.get("utm_source") || undefined, utm_medium: params.get("utm_medium") || undefined, utm_campaign: params.get("utm_campaign") || undefined,
        }),
      });
      const j = await r.json();
      if (!j.ok || !j.temp_password) { setErr(j.error || "Could not open your portal."); setView("reveal"); setBusy(false); return; }
      track("generate_lead", { instrument: inst, source: "concierge", program: isBeginner ? "foundation" : chosen });
      const { client } = getSupabaseSafe();
      if (client) {
        const { error } = await client.auth.signInWithPassword({ email, password: j.temp_password });
        if (!error) { router.replace("/trial/dashboard"); return; }
      }
      router.replace("/trial/login?new=1");
    } catch { setErr("Could not reach the server."); setView("reveal"); setBusy(false); }
  }, [name, email, phone, inst, exp, isBeginner, chosen, song, timing, strings, chords, params, router]);

  if (view === "opening") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
        <p className="mt-8 font-display text-2xl font-bold text-paper">Opening your Trial Portal…</p>
        <p className="mt-3 text-paper/60">Setting up {name || "your"} private space.</p>
      </div>
    );
  }

  if (view === "reveal") {
    return <Reveal name={name} isBeginner={isBeginner} chosen={chosen} setChosen={setChosen} onStart={submit} busy={busy} err={err} onBack={() => setView("chat")} />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <Header />
      {/* Guide bubble */}
      <div className="mt-8 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 text-lg">🎵</span>
        <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-paper/90">{react}</div>
      </div>

      <div className="mt-8 flex-1">
        {key === "name" && (
          <Q title="First — what should I call you?">
            <input autoFocus className={INP} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) go(`Lovely to meet you, ${name.split(" ")[0]}! 🎶`, nextKey("name")); }} />
          </Q>
        )}
        {key === "instrument" && (
          <Q title={`${name ? name.split(" ")[0] + ", w" : "W"}hat would you love to learn?`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INSTRUMENTS.map((o) => <Choice key={o} active={inst === o} onClick={() => { setInst(o); go(instReact(o), nextKey("instrument")); }}>{o}</Choice>)}
            </div>
          </Q>
        )}
        {key === "song" && (
          <Q title="Tell me — what's the ONE song you dream of playing?" sub="Hindi or English. This is where it gets exciting. ✨">
            <input autoFocus className={INP} placeholder="e.g. Tum Hi Ho, Summer of '69…" value={song} onChange={(e) => setSong(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && song.trim()) go(`“${song}” — what a choice. I can already picture you playing it. 🎶`, nextKey("song")); }} />
          </Q>
        )}
        {key === "experience" && (
          <Q title={`How are you with ${(inst || "music").toLowerCase()} right now?`} sub="Be honest — it helps me point you to the right place.">
            <div className="grid gap-3">
              {EXPERIENCE.map((o) => <Choice key={o} wide active={exp === o} onClick={() => { setExp(o); go(o === "Complete beginner" ? "Perfect — everyone starts somewhere, and starting right matters most." : "Nice — let's see exactly where you are.", nextKey("experience")); }}>{o}</Choice>)}
            </div>
          </Q>
        )}
        {key === "strings" && (
          <Q title={inst === "Piano" || inst === "Keyboard" ? "Quick one — do you know your note names (C, D, E…)?" : "Quick one — do you know the names of the strings?"}>
            <div className="grid grid-cols-2 gap-3">
              {["Yes", "No"].map((o) => <Choice key={o} active={strings === o} onClick={() => { setStrings(o); go(o === "Yes" ? "Ooh, you're ahead of the game. 👀" : "No stress — that's day one stuff.", nextKey("strings")); }}>{o}</Choice>)}
            </div>
          </Q>
        )}
        {key === "chords" && (
          <Q title="And can you already play more than 3 chords?">
            <div className="grid grid-cols-2 gap-3">
              {["Yes", "Not yet"].map((o) => <Choice key={o} active={chords === o} onClick={() => { setChords(o); go(o === "Yes" ? "Then you're past the basics — I know exactly where you belong. 💪" : "Perfect — we'll build those properly.", nextKey("chords")); }}>{o}</Choice>)}
            </div>
          </Q>
        )}
        {key === "timing" && (
          <Q title="How soon do you want to start?">
            <div className="grid gap-3">
              {TIMING.map((o) => <Choice key={o} wide active={timing === o} onClick={() => { setTiming(o); go(timingReact(o), nextKey("timing")); }}>{o}</Choice>)}
            </div>
          </Q>
        )}
        {key === "contact" && (
          <Q title="Last thing — where do I send your plan?" sub="I'll open your private Trial Portal instantly and email your login.">
            <input className={INP} inputMode="email" placeholder="Email (your portal login)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={INP + " mt-3"} inputMode="tel" placeholder="Phone / WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <p className="mt-3 text-xs text-paper/45">🔒 Private to you. Only for your trial and portal login.</p>
          </Q>
        )}
      </div>

      {err && <p className="mt-2 text-sm text-red-300">{err}</p>}

      <div className="sticky bottom-0 mt-6 flex items-center gap-3 bg-ink/80 py-3 backdrop-blur">
        {hist.length > 0 && <button onClick={back} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-paper/70 hover:text-paper">Back</button>}
        <button onClick={() => {
          if (key === "name") { if (!name.trim()) return setErr("Tell me your name to begin."); return go(`Lovely to meet you, ${name.split(" ")[0]}! 🎶`, nextKey("name")); }
          if (key === "song") { if (!song.trim()) return setErr("Give me one song — anything you love."); return go(`“${song}” — what a choice. 🎶`, nextKey("song")); }
          if (key === "contact") {
            if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email — it's your login.");
            if (phone.replace(/\D/g, "").length < 8) return setErr("Enter a valid phone number.");
            return setView("reveal");
          }
          setErr("Pick an option above to continue.");
        }} disabled={busy}
          className="flex-1 rounded-full bg-gold px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-[#f0d783] disabled:opacity-60">
          {key === "contact" ? "See my plan →" : "Continue"}
        </button>
      </div>
    </div>
  );
}

// -------------------- Reveal (programme + fees) --------------------
function Reveal({ name, isBeginner, chosen, setChosen, onStart, busy, err, onBack }: {
  name: string; isBeginner: boolean; chosen: Tier["key"]; setChosen: (k: Tier["key"]) => void;
  onStart: () => void; busy: boolean; err: string; onBack: () => void;
}) {
  const first = name.split(" ")[0] || "there";
  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <Header />
      <div className="mt-8 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 text-lg">🎵</span>
        <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-paper/90">
          {isBeginner
            ? `${first}, based on your answers, your correct first step is clear. Here it is 👇`
            : `${first}, you're past the basics — so you skip the beginner module. Here's where serious learners like you begin 👇`}
        </div>
      </div>

      {isBeginner ? (
        <div className="mt-6 space-y-4">
          <ProgramCard p={TIERS.foundation} highlight />
          <p className="text-center text-sm text-paper/60">As you clear Foundation, you move up to <b className="text-paper">The Main Pathway</b> — the full system.</p>
          <StartButton label="Start my free trial" onStart={onStart} busy={busy} />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Choose your route — you can change this any time</p>
          {NON_BEGINNER_ROUTES.map((k) => (
            <button key={k} onClick={() => setChosen(k)} className="block w-full text-left">
              <ProgramCard p={TIERS[k]} selected={chosen === k} selectable />
            </button>
          ))}
          <StartButton label={`Start my free trial`} onStart={onStart} busy={busy} />
        </div>
      )}

      {err && <p className="mt-3 text-center text-sm text-red-300">{err}</p>}
      <p className="mt-4 text-center text-xs text-paper/40">Your first class is always free. No card, no obligation.</p>
      <button onClick={onBack} className="mx-auto mt-4 block text-sm text-paper/50 hover:text-paper">← Back</button>
    </div>
  );
}

function ProgramCard({ p, highlight, selected, selectable }: { p: Tier; highlight?: boolean; selected?: boolean; selectable?: boolean }) {
  return (
    <div className={"rounded-3xl border p-5 transition " +
      (selected ? "border-gold bg-gold/10" : highlight ? "border-gold/50 bg-gold/[0.06]" : "border-white/12 bg-white/[0.04]")}>
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
        {p.points.map((pt) => (
          <li key={pt} className="flex items-start gap-2 text-sm text-paper/80">
            <span className="mt-0.5 text-gold">✦</span>{pt}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-paper/45">For: {p.forWhom}</p>
      {selectable && <p className={"mt-3 text-sm font-semibold " + (selected ? "text-gold" : "text-paper/40")}>{selected ? "Selected ✓" : "Tap to choose"}</p>}
    </div>
  );
}

function StartButton({ label, onStart, busy }: { label: string; onStart: () => void; busy: boolean }) {
  return (
    <button onClick={onStart} disabled={busy} className="w-full rounded-full bg-gold px-6 py-4 text-base font-semibold text-ink transition hover:bg-[#f0d783] disabled:opacity-60">
      {busy ? "Opening…" : `${label} →`}
    </button>
  );
}

const INP = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-paper placeholder-paper/40 outline-none focus:border-gold";
function Header() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-gold/10 font-display text-lg font-bold text-gold">♪</span>
      <div>
        <div className="font-display text-lg font-bold leading-none text-paper">Musicphonetics</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80">Find your start</div>
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
function Choice({ active, onClick, children, wide }: { active: boolean; onClick: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={"rounded-xl border px-4 py-3.5 font-semibold transition-all " + (wide ? "w-full text-left " : "text-left ") +
        (active ? "border-gold bg-gold/15 text-paper shadow-[0_0_0_1px_rgba(231,203,110,.5)]" : "border-white/15 bg-white/5 text-paper/80 hover:border-white/35")}>
      {children}
    </button>
  );
}
