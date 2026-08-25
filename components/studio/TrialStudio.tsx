"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { track } from "@/lib/track";
import { TIERS, NON_BEGINNER_ROUTES, type Tier } from "@/lib/programTiers";
import {
  MOTIVATIONS, LEVELS, INSTRUMENTS, skillsFor, roadmapFor, dnaFor,
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
const instEmoji = (k: string) => INSTRUMENTS.find((i) => i.key === k)?.icon || "🎵";

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
  const tier = isBeginner ? TIERS.foundation : TIERS[chosen];
  const [step, setStep] = useState(0);
  const [local, setLocal] = useState("");
  const STEPS = 5;
  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const prev = () => (step === 0 ? onBack() : setStep((s) => s - 1));

  function trySave() {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setLocal("Enter a valid email — it becomes your login.");
    if (phone.replace(/\D/g, "").length < 8) return setLocal("Enter a valid phone / WhatsApp number.");
    setLocal(""); onStart();
  }

  // One panel at a time, always full-height, never the page scrolls.
  const cta = (label: string, onClick: () => void, primary = true) => (
    <button onClick={onClick} disabled={busy}
      className={"flex-1 rounded-full px-6 py-4 text-base font-bold transition disabled:opacity-60 " + (primary ? "bg-gold text-ink hover:bg-[#f0d783]" : "border border-white/15 text-paper/80")}>
      {label}
    </button>
  );

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col px-5 pb-6 pt-5">
      <div className="flex items-center justify-between">
        <Header />
        <Dots n={STEPS} i={step} />
      </div>

      <div key={step} className="flex flex-1 flex-col justify-center overflow-y-auto py-3 animate-[fadeIn_.4s_ease] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {step === 0 && (
          <div className="overflow-hidden rounded-[28px] border border-gold/40 bg-gradient-to-br from-gold/25 via-gold/[0.07] to-transparent p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">🧬 Your Musical DNA</p>
            <h1 className="mt-3 font-display text-[2.4rem] font-black leading-[1.02] text-paper">You&rsquo;re {dna.label}.</h1>
            <p className="mt-3 text-sm leading-relaxed text-paper/75">{dna.blurb}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip>{instEmoji(inst)} {inst}</Chip>
              {inspiration && <Chip>✨ {inspiration}</Chip>}
              {song && <Chip>🎯 {song}</Chip>}
              {level && <Chip>{level.label}</Chip>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">🎯 Your first song</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-paper">“{song}”</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-paper/85">{report?.message || `You won't need to learn everything before you're playing “${song}”.`}</p>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-wide text-paper/50">The skills we&rsquo;ll build</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {skills.map((s) => <span key={s} className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs text-paper/80">{s}</span>)}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Your 30-day roadmap</p>
            <h2 className="mt-2 font-display text-2xl font-black text-paper">From zero to your first song.</h2>
            <div className="mt-4 space-y-2">
              {weeks.map((w, i) => (
                <div key={w.title} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/15 text-sm font-bold text-gold">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-paper">{w.title.replace(/^Week \d+ — /, "")}</p>
                    <p className="truncate text-xs text-paper/55">{w.items.slice(0, 3).join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-paper/45">🎓 A hand-matched mentor personalises this after your free trial.</p>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">This is where you begin</p>
            {!isBeginner && (
              <div className="mt-3 flex gap-1.5">
                {NON_BEGINNER_ROUTES.map((k) => (
                  <button key={k} onClick={() => setChosen(k)}
                    className={"flex-1 rounded-full px-3 py-2 text-xs font-semibold transition " + (chosen === k ? "bg-gold text-ink" : "border border-white/15 text-paper/70 hover:text-paper")}>
                    {TIERS[k].name.replace(/^The /, "")}
                  </button>
                ))}
              </div>
            )}
            <div className="relative mt-3 overflow-hidden rounded-[28px] border border-gold/50 bg-gradient-to-b from-gold/[0.16] to-transparent p-6 shadow-[0_0_60px_-15px_rgba(231,203,110,0.5)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-black text-paper">{tier.name}</h3>
                  <p className="text-sm text-gold">{tier.tagline}</p>
                </div>
                {tier.badge && <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase text-ink">{tier.badge}</span>}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                {tier.strike && <span className="text-lg text-paper/40 line-through">{tier.strike}</span>}
                <span className="font-display text-4xl font-black text-paper">{tier.price}</span>
                <span className="text-sm text-paper/55">{tier.unit || "/ month"}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {tier.points.slice(0, 4).map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm text-paper/85">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gold text-[10px] text-ink">✓</span>{pt}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-center text-xs font-semibold text-gold">🎁 Your first class is 100% free.</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">🎉 One last step</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-paper">Ready, {first}?</h2>
            <p className="mt-2 text-sm text-paper/75">Save your journey and lock your <b className="text-paper">free trial</b>. No card, no obligation.</p>
            <div className="mt-5 space-y-3">
              <input autoFocus className={INP} inputMode="email" placeholder="Email (your portal login)" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={INP} inputMode="tel" placeholder="Phone / WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {(local || err) && <p className="text-sm text-red-300">{local || err}</p>}
              <p className="text-[11px] text-paper/45">🔒 Private to you — only for your trial and portal login.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={prev} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-paper/70 hover:text-paper" aria-label="Back">←</button>
        {step === 0 && cta("See your song →", next)}
        {step === 1 && cta("See your roadmap →", next)}
        {step === 2 && cta("See where you begin →", next)}
        {step === 3 && cta("Book my free trial →", next)}
        {step === 4 && cta(busy ? "Saving…" : "Create my profile →", trySave)}
      </div>
    </div>
  );
}

function Dots({ n, i }: { n: number; i: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: n }).map((_, k) => (
        <span key={k} className={"h-1.5 rounded-full transition-all " + (k === i ? "w-5 bg-gold" : k < i ? "w-1.5 bg-gold/50" : "w-1.5 bg-white/20")} />
      ))}
    </div>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-paper/90">{children}</span>;
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
