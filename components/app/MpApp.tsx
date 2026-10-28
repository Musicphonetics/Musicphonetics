"use client";

import { useMemo, useState } from "react";
import {
  useStore, computeStats, todayYMD, prettyDate, INSTRUMENTS,
  type Profile, type Session, type Data,
} from "./store";

// ============================================================================
// Musicphonetics — practice app. A real, standalone, offline-capable practice
// companion. Everything shown is data the user logs; it persists on-device.
// Self-contained: no backend, no imports from the rest of the app.
// ============================================================================

/* --------------------------------------------------------------------- icons */
const IP: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  chart: "M5 20V10m7 10V4m7 16v-7",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 6.5",
  flame: "M12 3c0 3-4 4-4 8a4 4 0 008 0c0-1.5-1-2.5-1-4 2 1 3 3 3 5a6 6 0 11-12 0c0-5 6-6 6-9z",
  clock: "M12 8v4l3 2M12 21a9 9 0 100-18 9 9 0 000 18z",
  pencil: "M4 20h4L18 10l-4-4L4 16zM14 6l4 4",
  trash: "M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chev: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  music: "M9 18V5l10-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8z",
  download: "M12 4v12m0 0l-4-4m4 4l4-4M5 20h14",
  spark: "M12 3l1.6 4.3L18 9l-4.4 1.7L12 15l-1.6-4.3L6 9z",
};
function Ic({ n, s = 20, c = "" }: { n: string; s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden className={c}><path d={IP[n]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* --------------------------------------------------------------- UI atoms */
const GOLD = "#A8851B";
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(22,27,38,.04),0_8px_24px_rgba(22,27,38,.05)] ${className}`}>{children}</div>;
}
function Primary({ children, onClick, full, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; full?: boolean; disabled?: boolean; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[0.95rem] font-semibold text-cream transition active:scale-[0.98] disabled:opacity-40 ${full ? "w-full" : ""}`}>{children}</button>;
}
function GoldBtn({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-semibold text-white transition active:scale-[0.98] ${full ? "w-full" : ""}`} style={{ background: GOLD }}>{children}</button>;
}
function Ghost({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-5 py-3 text-[0.9rem] font-semibold text-ink/80 transition active:scale-[0.98] ${full ? "w-full" : ""}`}>{children}</button>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] text-ink/45">{children}</p>;
}
const FEELINGS = ["Tough", "Okay", "Good", "Great", "In flow"];

/* =========================================================================== */
/*  ONBOARDING                                                                  */
/* =========================================================================== */
function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [instrument, setInstrument] = useState("");
  const [goal, setGoal] = useState("");
  const [target, setTarget] = useState(20);

  return (
    <div className="flex h-full flex-col bg-cream">
      <div className="flex items-center gap-2 px-6 pt-6">
        <span className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white" style={{ background: GOLD }}>M</span>
        <span className="font-display text-base font-semibold text-ink">Musicphonetics</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-6">
        {step === 0 && (
          <div>
            <h1 className="font-display text-[2rem] font-medium leading-tight text-ink">Let&rsquo;s build a practice habit.</h1>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/60">A calm, honest practice companion. Log what you actually do — it keeps your streak, your history and your progress. All on your device.</p>
            <div className="mt-7">
              <Label>What should we call you?</Label>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-[1rem] text-ink outline-none focus:border-[color:var(--g)]" style={{ ["--g" as string]: GOLD }} />
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h1 className="font-display text-[1.8rem] font-medium leading-tight text-ink">What do you play?</h1>
            <p className="mt-2 text-[0.95rem] text-ink/60">Pick your main instrument for now.</p>
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {INSTRUMENTS.map((i) => (
                <button key={i} onClick={() => setInstrument(i)} className="rounded-xl border px-2 py-3 text-[0.85rem] font-medium transition"
                  style={{ borderColor: instrument === i ? GOLD : "rgba(0,0,0,.12)", background: instrument === i ? "rgba(201,162,39,.1)" : "white", color: instrument === i ? GOLD : "#161B26" }}>{i}</button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h1 className="font-display text-[1.8rem] font-medium leading-tight text-ink">Set your intention.</h1>
            <div className="mt-5">
              <Label>Your goal right now</Label>
              <input autoFocus value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Play my first full song"
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-[1rem] text-ink outline-none" />
            </div>
            <div className="mt-5">
              <Label>Daily practice target</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[10, 15, 20, 30, 45, 60].map((m) => (
                  <button key={m} onClick={() => setTarget(m)} className="rounded-full border px-4 py-2 text-[0.85rem] font-semibold transition"
                    style={{ borderColor: target === m ? GOLD : "rgba(0,0,0,.12)", background: target === m ? GOLD : "white", color: target === m ? "white" : "#161B26" }}>{m} min</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 px-6 pb-8 pt-4">
        <div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === step ? 20 : 6, background: i === step ? GOLD : "rgba(0,0,0,.15)" }} />)}</div>
        {step < 2 ? (
          <Primary onClick={() => setStep(step + 1)} disabled={(step === 0 && !name.trim()) || (step === 1 && !instrument)}>Continue <Ic n="arrow" s={16} /></Primary>
        ) : (
          <Primary onClick={() => onDone({ name: name.trim(), instrument, goal: goal.trim() || "Keep improving", targetMin: target, createdAt: new Date().toISOString() })} disabled={!instrument}>Start <Ic n="arrow" s={16} /></Primary>
        )}
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  LOG SESSION SHEET                                                            */
/* =========================================================================== */
function LogSheet({ initial, onSave, onClose, onDelete }: {
  initial?: Session; onSave: (s: Omit<Session, "id">) => void; onClose: () => void; onDelete?: () => void;
}) {
  const [date, setDate] = useState(initial?.date ?? todayYMD());
  const [minutes, setMinutes] = useState(initial?.minutes ?? 20);
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [feel, setFeel] = useState(initial?.feel ?? 3);
  const [note, setNote] = useState(initial?.note ?? "");

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-cream">
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
        <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-black/5"><Ic n="close" s={18} /></button>
        <h2 className="font-display text-lg font-semibold text-ink">{initial ? "Edit session" : "Log practice"}</h2>
        {onDelete ? <button onClick={onDelete} aria-label="Delete" className="grid h-9 w-9 place-items-center rounded-full bg-red-500/10 text-red-600"><Ic n="trash" s={17} /></button> : <span className="w-9" />}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <Label>How long?</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[10, 15, 20, 30, 45, 60].map((m) => (
            <button key={m} onClick={() => setMinutes(m)} className="rounded-full border px-4 py-2 text-[0.85rem] font-semibold transition"
              style={{ borderColor: minutes === m ? GOLD : "rgba(0,0,0,.12)", background: minutes === m ? GOLD : "white", color: minutes === m ? "white" : "#161B26" }}>{m}m</button>
          ))}
          <div className="flex items-center gap-1 rounded-full border border-black/12 px-3">
            <input type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(Math.max(1, Math.min(600, Number(e.target.value) || 0)))} className="w-12 bg-transparent py-2 text-center text-[0.85rem] font-semibold text-ink outline-none" />
            <span className="text-[0.75rem] text-ink/45">min</span>
          </div>
        </div>

        <div className="mt-5"><Label>What did you work on?</Label>
          <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Barre chords, scales, a song…" className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[0.95rem] text-ink outline-none" />
        </div>

        <div className="mt-5"><Label>How did it go?</Label>
          <div className="mt-2 flex gap-1.5">
            {FEELINGS.map((f, i) => (
              <button key={f} onClick={() => setFeel(i + 1)} className="flex-1 rounded-xl border py-2.5 text-[0.72rem] font-semibold transition"
                style={{ borderColor: feel === i + 1 ? GOLD : "rgba(0,0,0,.1)", background: feel === i + 1 ? "rgba(201,162,39,.12)" : "white", color: feel === i + 1 ? GOLD : "#8A8578" }}>{f}</button>
            ))}
          </div>
        </div>

        <div className="mt-5"><Label>Notes <span className="font-normal normal-case tracking-normal text-ink/35">(optional)</span></Label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Anything to remember for next time…" className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[0.95rem] text-ink outline-none" />
        </div>

        <div className="mt-5"><Label>Date</Label>
          <input type="date" value={date} max={todayYMD()} onChange={(e) => setDate(e.target.value || todayYMD())} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[0.95rem] text-ink outline-none" />
        </div>
      </div>

      <div className="shrink-0 border-t border-black/5 px-5 py-4">
        <GoldBtn full onClick={() => { onSave({ date, minutes, focus: focus.trim() || "Practice", feel, note: note.trim() || undefined }); }}>
          <Ic n="check" s={18} /> {initial ? "Save changes" : "Save session"}
        </GoldBtn>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  HOME                                                                        */
/* =========================================================================== */
function Home({ profile, sessions, onLog }: { profile: Profile; sessions: Session[]; onLog: () => void }) {
  const st = useMemo(() => computeStats(sessions), [sessions]);
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })();
  const pct = Math.min(100, Math.round((st.todayMinutes / profile.targetMin) * 100));

  return (
    <div className="space-y-4">
      <p className="text-[0.95rem] text-ink/55">{greeting}, {profile.name.split(" ")[0]}</p>

      {/* today */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg,#1F2531,#161B26)" }}>
        <Ic n="music" s={120} c="pointer-events-none absolute -right-5 -bottom-6 opacity-[0.08]" />
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] text-white/50">Today&rsquo;s practice</p>
        {st.practicedToday ? (
          <>
            <h2 className="mt-1.5 font-display text-2xl font-semibold">{st.todayMinutes} min done {pct >= 100 && "🎯"}</h2>
            <p className="mt-0.5 text-[0.85rem] text-white/60">{pct >= 100 ? "Target hit — lovely work." : `${profile.targetMin - st.todayMinutes} min to your ${profile.targetMin}-min target`}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#E7C86A" }} /></div>
            <button onClick={onLog} className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-gold-soft">Log more <Ic n="plus" s={15} /></button>
          </>
        ) : (
          <>
            <h2 className="mt-1.5 font-display text-2xl font-semibold">Ready for {profile.targetMin} minutes?</h2>
            <p className="mt-0.5 text-[0.85rem] text-white/60">{st.streak > 0 ? "Keep your streak alive." : "A few focused minutes counts."}</p>
            <button onClick={onLog} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink">Log practice <Ic n="arrow" s={15} /></button>
          </>
        )}
      </div>

      {/* streak + week */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5" style={{ color: GOLD }}><Ic n="flame" s={18} /><Label>Streak</Label></div>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">{st.streak}<span className="ml-1 text-base font-normal text-ink/40">day{st.streak === 1 ? "" : "s"}</span></p>
          <p className="text-[0.72rem] text-ink/45">{st.practicedToday ? "Logged today ✓" : "Practise today to extend it"}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-ink/50"><Ic n="clock" s={17} /><Label>Last 7 days</Label></div>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">{st.weekMinutes}<span className="ml-1 text-base font-normal text-ink/40">min</span></p>
          <p className="text-[0.72rem] text-ink/45">{st.last7.filter((d) => d.minutes > 0).length} active day{st.last7.filter((d) => d.minutes > 0).length === 1 ? "" : "s"}</p>
        </Card>
      </div>

      <WeekChart last7={st.last7} target={profile.targetMin} />

      {/* goal */}
      <Card className="p-4">
        <div className="flex items-center gap-2" style={{ color: GOLD }}><Ic n="target" s={17} /><Label>Your goal</Label></div>
        <p className="mt-1.5 font-display text-lg font-medium text-ink">{profile.goal}</p>
        <p className="text-[0.8rem] text-ink/50">{profile.instrument} · target {profile.targetMin} min/day</p>
      </Card>

      {sessions.length === 0 && (
        <Card className="p-5 text-center">
          <p className="text-[0.9rem] text-ink/60">No sessions yet. Your first log starts your streak and history.</p>
        </Card>
      )}
    </div>
  );
}

function WeekChart({ last7, target }: { last7: { label: string; minutes: number }[]; target: number }) {
  const max = Math.max(target, ...last7.map((d) => d.minutes), 1);
  return (
    <Card className="p-4">
      <Label>This week</Label>
      <div className="mt-3 flex items-end justify-between gap-2" style={{ height: 96 }}>
        {last7.map((d, i) => {
          const h = Math.round((d.minutes / max) * 72);
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
              <div className="w-full rounded-md" style={{ height: Math.max(h, 3), background: d.minutes > 0 ? (d.minutes >= target ? GOLD : "#E7C86A") : "rgba(0,0,0,.07)" }} />
              <span className="text-[0.62rem] font-semibold text-ink/40">{d.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* =========================================================================== */
/*  SESSIONS                                                                    */
/* =========================================================================== */
function Sessions({ sessions, onEdit, onLog }: { sessions: Session[]; onEdit: (s: Session) => void; onLog: () => void }) {
  if (sessions.length === 0) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-black/5 text-ink/40"><Ic n="list" s={24} /></span>
          <p className="mt-3 text-[0.95rem] font-medium text-ink">No sessions yet</p>
          <p className="mt-1 text-[0.84rem] text-ink/50">Log your first practice to start building history.</p>
          <div className="mt-4"><GoldBtn onClick={onLog}><Ic n="plus" s={16} /> Log practice</GoldBtn></div>
        </div>
      </div>
    );
  }
  // group by date
  const groups = sessions.reduce<Record<string, Session[]>>((acc, s) => { (acc[s.date] ??= []).push(s); return acc; }, {});
  const dates = Object.keys(groups).sort().reverse();
  return (
    <div className="space-y-5">
      {dates.map((d) => (
        <div key={d}>
          <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink/40">{prettyDate(d)}</p>
          <div className="space-y-2">
            {groups[d].map((s) => (
              <button key={s.id} onClick={() => onEdit(s)} className="w-full text-left">
                <Card className="flex items-center gap-3 p-3.5 transition active:scale-[0.99]">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "rgba(201,162,39,.12)", color: GOLD }}><span className="text-[0.7rem] font-bold">{s.minutes}m</span></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[0.9rem] font-medium text-ink">{s.focus}</p><p className="text-[0.76rem] text-ink/45">{FEELINGS[s.feel - 1]}{s.note ? ` · ${s.note}` : ""}</p></div>
                  <Ic n="chev" s={16} c="text-ink/25" />
                </Card>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================== */
/*  PROGRESS                                                                    */
/* =========================================================================== */
function Progress({ profile, sessions }: { profile: Profile; sessions: Session[] }) {
  const st = useMemo(() => computeStats(sessions), [sessions]);
  const hrs = Math.floor(st.totalMinutes / 60), mins = st.totalMinutes % 60;
  const since = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total practice" value={hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`} />
        <Stat label="Sessions" value={st.totalSessions} />
        <Stat label="Current streak" value={`${st.streak}d`} />
        <Stat label="Best streak" value={`${st.bestStreak}d`} />
      </div>
      <WeekChart last7={st.last7} target={profile.targetMin} />
      <Card className="p-4">
        <Label>Consistency · last 7 days</Label>
        <p className="mt-2 text-[0.9rem] text-ink/70">You practised <span className="font-semibold text-ink">{st.last7.filter((d) => d.minutes > 0).length} of 7</span> days, {st.weekMinutes} minutes total.</p>
        <p className="mt-1 text-[0.78rem] text-ink/45">Every number here is from sessions you logged{since ? ` since ${since}` : ""} — nothing estimated.</p>
      </Card>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <Card className="p-4"><Label>{label}</Label><p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p></Card>;
}

/* =========================================================================== */
/*  YOU / SETTINGS                                                               */
/* =========================================================================== */
function You({ profile, data, onEdit, onReset, onExport }: {
  profile: Profile; data: Data; onEdit: () => void; onReset: () => void; onExport: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pt-1">
        <span className="grid h-16 w-16 place-items-center rounded-full font-display text-xl font-semibold" style={{ background: "rgba(201,162,39,.15)", color: GOLD }}>{profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
        <div><p className="font-display text-xl font-semibold text-ink">{profile.name}</p><p className="text-[0.84rem] text-ink/50">{profile.instrument} learner</p></div>
      </div>

      <Card>
        {[["Goal", profile.goal], ["Instrument", profile.instrument], ["Daily target", `${profile.targetMin} min`]].map(([a, b], i) => (
          <div key={a} className="flex items-center justify-between px-4 py-3.5" style={i > 0 ? { borderTop: "1px solid rgba(0,0,0,.06)" } : undefined}>
            <span className="text-[0.84rem] text-ink/50">{a}</span><span className="text-[0.88rem] font-medium text-ink">{b}</span>
          </div>
        ))}
      </Card>

      <Ghost full onClick={onEdit}><Ic n="pencil" s={16} /> Edit profile & goal</Ghost>
      <Ghost full onClick={onExport}><Ic n="download" s={16} /> Export my data ({data.sessions.length} sessions)</Ghost>

      {!confirm ? (
        <button onClick={() => setConfirm(true)} className="w-full py-2 text-center text-[0.82rem] font-medium text-red-600/80">Reset all data</button>
      ) : (
        <Card className="p-4">
          <p className="text-[0.86rem] text-ink/70">Delete your profile and all {data.sessions.length} sessions? This can&rsquo;t be undone.</p>
          <div className="mt-3 flex gap-2">
            <Ghost full onClick={() => setConfirm(false)}>Cancel</Ghost>
            <button onClick={onReset} className="w-full rounded-full bg-red-600 px-5 py-3 text-[0.9rem] font-semibold text-white">Delete everything</button>
          </div>
        </Card>
      )}

      <p className="px-1 pt-2 text-center text-[0.72rem] leading-relaxed text-ink/40">Your data lives only on this device, in this browser. Export it to keep a copy.</p>
    </div>
  );
}

/* =========================================================================== */
/*  EDIT PROFILE SHEET                                                           */
/* =========================================================================== */
function EditProfile({ profile, onSave, onClose }: { profile: Profile; onSave: (p: Profile) => void; onClose: () => void }) {
  const [name, setName] = useState(profile.name);
  const [instrument, setInstrument] = useState(profile.instrument);
  const [goal, setGoal] = useState(profile.goal);
  const [target, setTarget] = useState(profile.targetMin);
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-cream">
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
        <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-black/5"><Ic n="close" s={18} /></button>
        <h2 className="font-display text-lg font-semibold text-ink">Edit profile</h2><span className="w-9" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 space-y-5">
        <div><Label>Name</Label><input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[0.95rem] text-ink outline-none" /></div>
        <div><Label>Instrument</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">{INSTRUMENTS.map((i) => <button key={i} onClick={() => setInstrument(i)} className="rounded-xl border px-2 py-2.5 text-[0.82rem] font-medium" style={{ borderColor: instrument === i ? GOLD : "rgba(0,0,0,.12)", background: instrument === i ? "rgba(201,162,39,.1)" : "white", color: instrument === i ? GOLD : "#161B26" }}>{i}</button>)}</div>
        </div>
        <div><Label>Goal</Label><input value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[0.95rem] text-ink outline-none" /></div>
        <div><Label>Daily target</Label>
          <div className="mt-2 flex flex-wrap gap-2">{[10, 15, 20, 30, 45, 60].map((m) => <button key={m} onClick={() => setTarget(m)} className="rounded-full border px-4 py-2 text-[0.85rem] font-semibold" style={{ borderColor: target === m ? GOLD : "rgba(0,0,0,.12)", background: target === m ? GOLD : "white", color: target === m ? "white" : "#161B26" }}>{m} min</button>)}</div>
        </div>
      </div>
      <div className="shrink-0 border-t border-black/5 px-5 py-4"><GoldBtn full onClick={() => onSave({ ...profile, name: name.trim() || profile.name, instrument, goal: goal.trim() || profile.goal, targetMin: target })}><Ic n="check" s={18} /> Save</GoldBtn></div>
    </div>
  );
}

/* =========================================================================== */
/*  ROOT                                                                         */
/* =========================================================================== */
const TABS = [{ k: "home", label: "Home", icon: "home" }, { k: "sessions", label: "Sessions", icon: "list" }, { k: "progress", label: "Progress", icon: "chart" }, { k: "you", label: "You", icon: "user" }];

export function MpApp() {
  const store = useStore();
  const { data, hydrated } = store;
  const [tab, setTab] = useState("home");
  const [logOpen, setLogOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [editProfile, setEditProfile] = useState(false);

  function exportData() {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "musicphonetics-practice.json"; a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  }

  const shell = (inner: React.ReactNode) => (
    <div className="min-h-[100svh] w-full bg-[#E7E0D1] sm:grid sm:place-items-center sm:p-6">
      <div className="relative mx-auto flex h-[100svh] w-full flex-col overflow-hidden bg-cream sm:h-[min(880px,92svh)] sm:max-w-[440px] sm:rounded-[2rem] sm:border sm:border-black/10 sm:shadow-[0_40px_90px_-30px_rgba(22,27,38,.5)]">
        {inner}
      </div>
    </div>
  );

  if (!hydrated) return shell(<div className="grid flex-1 place-items-center"><span className="grid h-12 w-12 animate-pulse place-items-center rounded-xl text-lg font-bold text-white" style={{ background: GOLD }}>M</span></div>);
  if (!data.profile) return shell(<Onboarding onDone={(p) => { store.setProfile(p); setTab("home"); }} />);

  const profile = data.profile;
  const body =
    tab === "home" ? <Home profile={profile} sessions={data.sessions} onLog={() => setLogOpen(true)} />
    : tab === "sessions" ? <Sessions sessions={data.sessions} onEdit={(s) => setEditing(s)} onLog={() => setLogOpen(true)} />
    : tab === "progress" ? <Progress profile={profile} sessions={data.sessions} />
    : <You profile={profile} data={data} onEdit={() => setEditProfile(true)} onReset={() => { store.reset(); setTab("home"); }} onExport={exportData} />;

  const titles: Record<string, string> = { home: "Practice", sessions: "Your sessions", progress: "Progress", you: "You" };

  return shell(
    <>
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-6">
        <h1 className="font-display text-[1.5rem] font-semibold text-ink">{titles[tab]}</h1>
        <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white" style={{ background: GOLD }}>M</span>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-28">{body}</main>

      {/* bottom nav with raised log button */}
      <nav className="relative shrink-0 border-t border-black/[0.06] bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2">
        <button onClick={() => setLogOpen(true)} aria-label="Log practice" className="absolute -top-6 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full text-white shadow-[0_10px_24px_-6px_rgba(201,162,39,.7)]" style={{ background: GOLD }}><Ic n="plus" s={26} /></button>
        <div className="flex items-stretch justify-between">
          {TABS.map((t, i) => {
            const on = t.k === tab;
            return (
              <button key={t.k} onClick={() => setTab(t.k)} className={`flex flex-1 flex-col items-center gap-1 py-1.5 ${i === 1 ? "mr-7" : i === 2 ? "ml-7" : ""}`} style={{ color: on ? GOLD : "#9A927F" }}>
                <Ic n={t.icon} s={22} /><span className="text-[0.6rem] font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {logOpen && <LogSheet onClose={() => setLogOpen(false)} onSave={(s) => { store.addSession(s); setLogOpen(false); setTab("home"); }} />}
      {editing && <LogSheet initial={editing} onClose={() => setEditing(null)} onDelete={() => { store.removeSession(editing.id); setEditing(null); }} onSave={(s) => { store.updateSession(editing.id, s); setEditing(null); }} />}
      {editProfile && <EditProfile profile={profile} onClose={() => setEditProfile(false)} onSave={(p) => { store.setProfile(p); setEditProfile(false); }} />}
    </>
  );
}
