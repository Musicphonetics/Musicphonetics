"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  TEACHERS, MUSICIANS, EVENTS, AI_SAMPLE_REPORT, PLANS, inr,
  STUDENT, TODAY_PRACTICE, GOAL, LAST_FEEDBACK, LESSON_HISTORY, MILESTONES, PARENT_UPDATES,
  type Plan,
} from "./data";

// ============================================================================
// Prototype 1 — Musicphonetics as a consumer music app.
//
// A first-run story (promise → how it works → journey → choose your path) that
// leads into one of four distinct, identity-specific apps — Student, Parent,
// Teacher, Musician — each with its own bottom navigation, home screen and
// theme. No role-switcher sidebar: identity is chosen through onboarding, the
// way registration works. Presenter controls live OUTSIDE the app frame.
//
// Everything is synthetic and honestly labelled. No production data, auth,
// payments or emails. Reuses brand tokens but evolves them per identity.
// ============================================================================

/* --------------------------------------------------------------- identities */
type Id = "student" | "parent" | "teacher" | "musician";

type Theme = {
  bg: string; surface: string; surface2: string; text: string; muted: string;
  accent: string; accentSoft: string; line: string; dark: boolean;
};
const THEMES: Record<Id, Theme> = {
  student:  { bg: "#F4EEE2", surface: "#FFFFFF", surface2: "#FBF7EF", text: "#1A1206", muted: "#8A7E68", accent: "#A8851B", accentSoft: "#C9A227", line: "rgba(26,18,6,.10)", dark: false },
  parent:   { bg: "#E9EFE9", surface: "#FFFFFF", surface2: "#F3F7F2", text: "#15201A", muted: "#6B7A70", accent: "#2C4636", accentSoft: "#A8851B", line: "rgba(21,32,26,.10)", dark: false },
  teacher:  { bg: "#1B202A", surface: "#232834", surface2: "#1F2531", text: "#F5F1E8", muted: "rgba(245,241,232,.52)", accent: "#C9A227", accentSoft: "#E7C86A", line: "rgba(255,255,255,.10)", dark: true },
  musician: { bg: "#0B0F18", surface: "#161A23", surface2: "#11151E", text: "#F5F1E8", muted: "rgba(245,241,232,.48)", accent: "#E7C86A", accentSoft: "#C9A227", line: "rgba(255,255,255,.09)", dark: true },
};
function themeVars(t: Theme): React.CSSProperties {
  const v: Record<string, string> = {
    "--bg": t.bg, "--surface": t.surface, "--s2": t.surface2, "--text": t.text,
    "--muted": t.muted, "--accent": t.accent, "--accentSoft": t.accentSoft, "--line": t.line,
  };
  return v as React.CSSProperties;
}

/* --------------------------------------------------------------------- icons */
const P: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  practice: "M9 18V5l10-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z",
  progress: "M4 15l4-4 3 3 5-6 4 4M5 20h14",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  students: "M9 11a3 3 0 100-6 3 3 0 000 6zm7 0a3 3 0 100-6M3 20a6 6 0 0112 0m2 0a6 6 0 00-3-5.2",
  lessons: "M5 4h12a1 1 0 011 1v15H7a2 2 0 00-2 2zM5 4v14M9 8h6M9 11h6",
  portfolio: "M4 5h16v14H4zM4 9h16M9 13l4 2.5L9 18z",
  enquiries: "M4 6h16v12H4zm0 1l8 6 8-6",
  children: "M12 20s-7-4.2-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.8-7 9-7 9z",
  updates: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  discover: "M12 21a9 9 0 100-18 9 9 0 000 18zM15 9l-2 4-4 2 2-4z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a7.9 7.9 0 000-2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 00-1.7-1L14.9 3h-5.8l-.4 2.6a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.4L2.6 11a7.9 7.9 0 000 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 001.7 1l.4 2.4h5.8l.4-2.6a7.5 7.5 0 001.7-1l2.4 1 2-3.4z",
  clock: "M12 8v4l3 2M12 21a9 9 0 100-18 9 9 0 000 18z",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8z",
  check: "M5 12.5l4.5 4.5L19 6.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chev: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  star: "M12 3l2.6 5.5L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.8z",
  map: "M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11zm0-8a3 3 0 100-6 3 3 0 000 6z",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
  play: "M8 5v14l11-7z",
  upload: "M12 16V4m0 0L8 8m4-4l4 4M4 20h16",
  sparkle: "M12 3l1.6 4.3L18 9l-4.4 1.7L12 15l-1.6-4.3L6 9l4.4-1.7z",
  plus: "M12 5v14M5 12h14",
  bolt: "M13 3L4 14h6l-1 7 9-11h-6z",
  mic: "M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v4",
};
function Ic({ n, s = 20, c = "" }: { n: string; s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={c}><path d={P[n]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* ----------------------------------------------------------- small UI atoms */
function Demo({ children = "Demo", tone = "amber" }: { children?: React.ReactNode; tone?: "amber" | "sim" }) {
  // Inline styles so the pill reads on both light and dark themed surfaces.
  const st: React.CSSProperties = tone === "sim"
    ? { background: "rgba(56,189,248,.16)", borderColor: "rgba(56,189,248,.5)", color: "#2A9ED1" }
    : { background: "rgba(217,138,11,.16)", borderColor: "rgba(217,138,11,.55)", color: "#C07E12" };
  return <span style={st} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.56rem] font-bold uppercase tracking-[0.1em]">{children}</span>;
}
function S({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  // themed surface card
  return <div onClick={onClick} style={style} className={`rounded-2xl border bg-[var(--surface)] border-[color:var(--line)] ${className}`}>{children}</div>;
}
function Avatar({ initials, size = 42 }: { initials: string; size?: number }) {
  return <span className="grid shrink-0 place-items-center rounded-full font-display font-semibold"
    style={{ width: size, height: size, fontSize: size * 0.36, background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "var(--accent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent)" }}>{initials}</span>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium" style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--muted)" }}>{children}</span>;
}

function AccentBtn({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${full ? "w-full" : ""}`} style={{ background: "var(--accent)" }}>{children}</button>;
}
function GhostBtn({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${full ? "w-full" : ""}`} style={{ borderColor: "var(--line)", color: "var(--text)" }}>{children}</button>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--muted)" }}>{children}</p>;
}

/* =========================================================================== */
/*  DEVICE FRAME + CHROME                                                       */
/* =========================================================================== */
function AppChrome({
  theme, title, kicker, onBack, right, children, tabs, tab, setTab,
}: {
  theme: Theme; title: string; kicker?: string; onBack?: () => void; right?: React.ReactNode;
  children: React.ReactNode; tabs: { k: string; label: string; icon: string }[]; tab: string; setTab: (k: string) => void;
}) {
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => { scroll.current?.scrollTo({ top: 0 }); }, [tab]);
  return (
    <div data-dark={theme.dark} className="flex h-full flex-col font-body" style={{ ...themeVars(theme), background: "var(--bg)", color: "var(--text)" }}>
      <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
        {onBack && <button onClick={onBack} aria-label="Back" className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)" }}><Ic n="back" s={18} /></button>}
        <div className="min-w-0">
          {kicker && <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent)" }}>{kicker}</p>}
          <h1 className="font-display text-[1.45rem] font-semibold leading-tight">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">{right}</div>
      </header>
      <div ref={scroll} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{children}</div>
      <nav className="flex shrink-0 items-stretch justify-around border-t px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        {tabs.map((t) => {
          const on = t.k === tab;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} className="flex flex-1 flex-col items-center gap-1 py-1.5" style={{ color: on ? "var(--accent)" : "var(--muted)" }}>
              <Ic n={t.icon} s={22} />
              <span className="text-[0.6rem] font-semibold tracking-wide">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* =========================================================================== */
/*  INTRO / ONBOARDING                                                          */
/* =========================================================================== */
const PATHS: { id: Id; title: string; line: string; img: string }[] = [
  { id: "student", title: "I want to learn music", line: "Practice with purpose and see yourself improve.", img: "/images/classes/ukulele.webp" },
  { id: "parent", title: "I want to support a learner", line: "Follow your child's progress and know how to help.", img: "/images/moments/05-group.webp" },
  { id: "teacher", title: "I teach music", line: "Less admin, better feedback, a profile that wins students.", img: "/images/classes/keys-duet.webp" },
  { id: "musician", title: "I perform or work as a musician", line: "A professional profile, discovery and booking enquiries.", img: "/gallery/03-stage-guitar.jpg" },
];

function Intro({ onChoose, onSignIn }: { onChoose: (id: Id) => void; onSignIn: () => void }) {
  const [step, setStep] = useState(0);
  const last = 3;

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-full flex-col bg-[#0B0F18] font-body text-ivory">
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-gold/30 bg-gold/10 font-display text-xs font-bold text-gold-soft">M</span>
          <span className="font-display text-sm font-semibold tracking-tight">Musicphonetics</span>
        </span>
        {step < last && <button onClick={() => setStep(last)} className="text-[0.78rem] font-medium text-ivory/50 hover:text-ivory">Skip</button>}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );

  // Screens 1–3: visual story
  if (step < last) {
    const screens = [
      {
        img: "/images/hero/slide-3.webp", pos: "50% 30%",
        eyebrow: "Welcome to Musicphonetics",
        title: <>Make music.<br />Understand your<br /><span className="text-gold-soft">progress.</span></>,
        sub: "A music learning app built around how you actually improve — not another library of videos.",
      },
      {
        img: "/images/classes/duet.webp", pos: "50% 25%",
        eyebrow: "Between every lesson",
        title: <>Learning that<br />keeps going.</>,
        sub: "Students know what to practise. Teachers leave real feedback. Parents follow along. Nothing gets lost in chat.",
      },
      {
        img: "/gallery/08-stage.jpg", pos: "50% 40%",
        eyebrow: "Your whole music life",
        title: <>Find your place<br />in music.</>,
        sub: "Find a teacher, build a practice routine, track progress, grow a professional profile and discover events.",
      },
    ][step];

    return (
      <Shell>
        <div className="relative flex-1 overflow-hidden">
          <img src={screens.img} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: screens.pos }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F18] via-[#0B0F18]/35 to-[#0B0F18]/10" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gold-soft">{screens.eyebrow}</p>
            <h2 className="mt-2 font-display text-[2.1rem] font-medium leading-[1.05]">{screens.title}</h2>
            <p className="mt-3 max-w-[20rem] text-[0.95rem] leading-relaxed text-ivory/75">{screens.sub}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-1.5">{[0, 1, 2].map((i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-gold" : "w-1.5 bg-ivory/25"}`} />)}</div>
          <button onClick={() => setStep(step + 1)} className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-charcoal">
            Continue <Ic n="arrow" s={16} />
          </button>
        </div>
      </Shell>
    );
  }

  // Screen 4: choose your path
  return (
    <Shell>
      <div className="flex min-h-0 flex-1 flex-col px-6 pt-5">
        <h2 className="font-display text-[1.9rem] font-medium leading-tight">Choose your path</h2>
        <p className="mt-1.5 text-[0.9rem] text-ivory/60">How will you use Musicphonetics? You can request another role later.</p>
        <div className="mt-4 grid min-h-0 flex-1 grid-rows-4 gap-3 overflow-y-auto pb-2">
          {PATHS.map((p) => (
            <button key={p.id} onClick={() => onChoose(p.id)} className="group relative overflow-hidden rounded-2xl border border-white/10 text-left">
              <img src={p.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition group-hover:opacity-70 group-active:scale-[1.02]" style={{ objectPosition: "50% 35%" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F18] via-[#0B0F18]/70 to-transparent" />
              <div className="relative flex h-full items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-display text-[1.15rem] font-semibold leading-tight">{p.title}</p>
                  <p className="mt-0.5 max-w-[15rem] text-[0.76rem] leading-snug text-ivory/65">{p.line}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-charcoal"><Ic n="arrow" s={17} /></span>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onSignIn} className="shrink-0 py-4 text-center text-[0.85rem] text-ivory/60">
          Already with us? <span className="font-semibold text-gold-soft">Sign in</span>
        </button>
      </div>
    </Shell>
  );
}

/* =========================================================================== */
/*  STUDENT APP                                                                 */
/* =========================================================================== */
function StudentApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState("home");
  const [done, setDone] = useState<boolean[]>([false, false, false]);
  const tabs = [{ k: "home", label: "Home", icon: "home" }, { k: "practice", label: "Practice", icon: "practice" }, { k: "progress", label: "Progress", icon: "progress" }, { k: "profile", label: "You", icon: "profile" }];

  const home = (
    <div className="space-y-4">
      <p className="text-[0.95rem]" style={{ color: "var(--muted)" }}>Good evening, {STUDENT.first} 👋</p>
      {/* today */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg,#A8851B,#6E560F)" }}>
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/70">Today&rsquo;s practice · {TODAY_PRACTICE.minutes} min</p>
        <h2 className="mt-1.5 font-display text-xl font-semibold">{TODAY_PRACTICE.title}</h2>
        <button onClick={() => setTab("practice")} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold" style={{ color: "#6E560F" }}>Start practice <Ic n="arrow" s={15} /></button>
        <Ic n="practice" s={120} c="pointer-events-none absolute -right-4 -bottom-6 opacity-10" />
      </div>
      {/* goal */}
      <S className="p-4">
        <div className="flex items-center justify-between"><SectionLabel>Current goal</SectionLabel><span className="text-[0.72rem]" style={{ color: "var(--muted)" }}>{GOAL.step}</span></div>
        <p className="mt-1.5 font-display text-lg font-semibold">{GOAL.title}</p>
        <p className="text-[0.8rem]" style={{ color: "var(--muted)" }}>{GOAL.sub}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--text) 8%, transparent)" }}><div className="h-full rounded-full" style={{ width: `${GOAL.pct}%`, background: "var(--accent)" }} /></div>
      </S>
      {/* feedback */}
      <S className="p-4">
        <SectionLabel>From your teacher</SectionLabel>
        <div className="mt-2 flex items-start gap-3">
          <Avatar initials="RM" size={38} />
          <div><p className="text-[0.88rem] leading-relaxed">{LAST_FEEDBACK.text}</p><p className="mt-1 text-[0.72rem]" style={{ color: "var(--muted)" }}>{LAST_FEEDBACK.teacher} · {LAST_FEEDBACK.when}</p></div>
        </div>
      </S>
      {/* next lesson */}
      <S className="flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}><Ic n="clock" /></span>
        <div className="flex-1"><p className="text-[0.86rem] font-semibold">Next lesson</p><p className="text-[0.78rem]" style={{ color: "var(--muted)" }}>Sat · 11:00 AM · with {STUDENT.teacher}</p></div>
        <Ic n="chev" s={18} c="opacity-40" />
      </S>
    </div>
  );

  const practice = (
    <div className="space-y-4">
      <S className="p-4">
        <div className="flex items-center justify-between"><SectionLabel>This week&rsquo;s plan</SectionLabel><Pill>{TODAY_PRACTICE.minutes} min/day</Pill></div>
        <p className="mt-1.5 font-display text-lg font-semibold">{TODAY_PRACTICE.title}</p>
        <div className="mt-3 space-y-2">
          {TODAY_PRACTICE.steps.map((s, i) => (
            <button key={s} onClick={() => setDone(done.map((d, j) => (j === i ? !d : d)))} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left" style={{ borderColor: "var(--line)", background: "var(--s2)" }}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border" style={{ borderColor: done[i] ? "var(--accent)" : "var(--line)", background: done[i] ? "var(--accent)" : "transparent", color: "#fff" }}>{done[i] && <Ic n="check" s={14} />}</span>
              <span className={`text-[0.86rem] ${done[i] ? "line-through opacity-50" : ""}`}>{s}</span>
            </button>
          ))}
        </div>
      </S>
      <S className="p-4">
        <div className="flex items-center justify-between"><SectionLabel>Submit a practice video</SectionLabel><Demo>Prototype</Demo></div>
        <div className="mt-3 grid place-items-center rounded-xl border border-dashed p-6 text-center" style={{ borderColor: "var(--line)" }}>
          <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}><Ic n="upload" /></span>
          <p className="mt-2 text-[0.84rem] font-medium">Record or upload your take</p>
          <p className="mt-0.5 text-[0.74rem]" style={{ color: "var(--muted)" }}>Your teacher reviews it and leaves feedback</p>
        </div>
        <p className="mt-2 text-[0.7rem]" style={{ color: "var(--muted)" }}>Upload isn&rsquo;t stored in this prototype. See the AI assessment preview below.</p>
        <div className="mt-3"><GhostBtn full onClick={() => setTab("progress")}>Preview AI feedback (sample)</GhostBtn></div>
      </S>
    </div>
  );

  const progress = (
    <div className="space-y-4">
      <S className="p-4">
        <SectionLabel>Skills journey</SectionLabel>
        <div className="mt-3 space-y-2.5">
          {MILESTONES.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border" style={{ borderColor: m.done ? "var(--accent)" : "var(--line)", background: m.done ? "var(--accent)" : "transparent", color: "#fff" }}>{m.done && <Ic n="check" s={13} />}</span>
              <span className={`text-[0.88rem] ${m.done ? "" : "opacity-55"}`}>{m.label}</span>
              {!m.done && <span className="ml-auto"><Pill>Next</Pill></span>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[0.7rem]" style={{ color: "var(--muted)" }}>Milestones reflect lessons actually recorded — no made-up scores or streaks.</p>
      </S>
      <S className="p-4">
        <SectionLabel>Lesson history</SectionLabel>
        <div className="mt-3 space-y-3">
          {LESSON_HISTORY.map((l) => (
            <div key={l.date} className="flex gap-3">
              <div className="w-12 shrink-0 text-[0.72rem] font-semibold" style={{ color: "var(--muted)" }}>{l.date}</div>
              <div className="flex-1 border-l pl-3" style={{ borderColor: "var(--line)" }}><p className="text-[0.86rem] font-medium">{l.topic}</p><p className="text-[0.76rem]" style={{ color: "var(--muted)" }}>{l.note}</p></div>
            </div>
          ))}
        </div>
      </S>
      <AiPreview />
    </div>
  );

  const profile = (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pt-1">
        <Avatar initials="AK" size={60} />
        <div><p className="font-display text-xl font-semibold">{STUDENT.name}</p><p className="text-[0.82rem]" style={{ color: "var(--muted)" }}>{STUDENT.instrument} · {STUDENT.code}</p></div>
      </div>
      <S>
        {[["Learning goal", GOAL.title], ["Teacher", STUDENT.teacher], ["Plan", "Under Family Plus (parent-managed)"]].map(([a, b], i) => (
          <div key={a} className="flex items-center justify-between px-4 py-3" style={i > 0 ? { borderTop: "1px solid var(--line)" } : undefined}><span className="text-[0.82rem]" style={{ color: "var(--muted)" }}>{a}</span><span className="text-[0.86rem] font-medium">{b}</span></div>
        ))}
      </S>
      <SettingsList items={[["settings", "Account & privacy"], ["shield", "Safety (age-appropriate)"], ["updates", "Notifications"]]} />
      <p className="px-1 text-[0.72rem]" style={{ color: "var(--muted)" }}>Younger learners get an age-appropriate view — no public contact info or open messaging.</p>
    </div>
  );

  const screen = tab === "home" ? home : tab === "practice" ? practice : tab === "progress" ? progress : profile;
  const titles: Record<string, string> = { home: "Your practice", practice: "Practice", progress: "Progress", profile: "You" };
  return <AppChrome theme={THEMES.student} kicker="Student" title={titles[tab]} tabs={tabs} tab={tab} setTab={setTab} right={<ExitBtn onExit={onExit} />}>{screen}</AppChrome>;
}

/* =========================================================================== */
/*  PARENT APP                                                                  */
/* =========================================================================== */
function ParentApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState("home");
  const kids = [{ name: "Aarav", full: "Aarav Kapoor", inst: "Guitar", pct: 62 }, { name: "Meera", full: "Meera Kapoor", inst: "Piano", pct: 40 }];
  const [kid, setKid] = useState(0);
  const c = kids[kid];
  const tabs = [{ k: "home", label: "Home", icon: "home" }, { k: "children", label: "Children", icon: "children" }, { k: "updates", label: "Updates", icon: "updates" }, { k: "profile", label: "You", icon: "profile" }];

  const chipRow = (
    <div className="flex gap-2">
      {kids.map((k, i) => (
        <button key={k.name} onClick={() => setKid(i)} className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: kid === i ? "var(--accent)" : "var(--line)", background: kid === i ? "color-mix(in srgb,var(--accent) 12%,transparent)" : "transparent" }}>
          <Avatar initials={k.name[0]} size={22} /><span className="text-[0.82rem] font-medium">{k.name}</span>
        </button>
      ))}
    </div>
  );

  const home = (
    <div className="space-y-4">
      {chipRow}
      <S className="p-4">
        <div className="flex items-center justify-between"><SectionLabel>Where {c.name} stands</SectionLabel><span className="rounded-full px-2 py-0.5 text-[0.62rem] font-bold" style={{ background: "color-mix(in srgb,var(--accent) 14%,transparent)", color: "var(--accent)" }}>On track</span></div>
        <div className="mt-2 flex items-center justify-between text-[0.8rem]"><span style={{ color: "var(--muted)" }}>Class 5 of 8 · {c.inst}</span><span className="font-semibold">{c.pct}%</span></div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--text) 8%, transparent)" }}><div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: "var(--accent)" }} /></div>
      </S>
      <S className="p-4">
        <SectionLabel>Last class</SectionLabel>
        <p className="mt-1.5 font-display text-base font-semibold">Barre chords — F &amp; B♭</p>
        <p className="mt-2 text-[0.86rem] leading-relaxed">&ldquo;{LAST_FEEDBACK.text}&rdquo;</p>
        <p className="mt-1.5 text-[0.74rem]" style={{ color: "var(--muted)" }}>— {LAST_FEEDBACK.teacher}</p>
      </S>
      <S className="p-4">
        <SectionLabel>How to help this week</SectionLabel>
        <ul className="mt-2 space-y-1.5">
          {TODAY_PRACTICE.steps.map((s) => <li key={s} className="flex items-start gap-2 text-[0.84rem]"><Ic n="check" s={15} c="mt-0.5 shrink-0" /><span>{s}</span></li>)}
        </ul>
      </S>
      <DiscoverStrip />
    </div>
  );

  const children = (
    <div className="space-y-4">
      {kids.map((k) => (
        <S key={k.name} className="flex items-center gap-3 p-4">
          <Avatar initials={k.name[0]} size={46} />
          <div className="flex-1"><p className="font-display text-base font-semibold">{k.full}</p><p className="text-[0.78rem]" style={{ color: "var(--muted)" }}>{k.inst} · {k.pct}% this cycle</p></div>
          <Ic n="chev" s={18} c="opacity-40" />
        </S>
      ))}
      <S className="p-4">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border" style={{ borderColor: "var(--line)", color: "var(--accent)" }}><Ic n="plus" /></span><div><p className="text-[0.86rem] font-semibold">Link another child</p><p className="text-[0.74rem]" style={{ color: "var(--muted)" }}>Each link is explicitly authorised</p></div></div>
      </S>
      <p className="px-1 text-[0.72rem]" style={{ color: "var(--muted)" }}>One Family Plus account covers all your authorised children — you only ever see your own family&rsquo;s records.</p>
    </div>
  );

  const updates = (
    <div className="space-y-3">
      {PARENT_UPDATES.map((u, i) => (
        <S key={i} className="p-4">
          <div className="flex items-center justify-between"><span className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide" style={{ background: "color-mix(in srgb,var(--accent) 12%,transparent)", color: "var(--accent)" }}>{u.kind}</span><span className="text-[0.72rem]" style={{ color: "var(--muted)" }}>{u.when}</span></div>
          <p className="mt-2 text-[0.86rem] leading-relaxed">{u.text}</p>
          <p className="mt-1 text-[0.74rem]" style={{ color: "var(--muted)" }}>{u.who}</p>
        </S>
      ))}
      <p className="px-1 text-[0.72rem]" style={{ color: "var(--muted)" }}>Essential teacher updates and reports are never paywalled.</p>
    </div>
  );

  const profile = (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pt-1"><Avatar initials="AS" size={60} /><div><p className="font-display text-xl font-semibold">Anjali Sharma</p><p className="text-[0.82rem]" style={{ color: "var(--muted)" }}>Family account · 2 children</p></div></div>
      <PlanCard title="Family Plus" price={499} unit="/family · month" active />
      <SettingsList items={[["children", "Manage children"], ["settings", "Account & privacy"], ["updates", "Notification preferences"]]} />
    </div>
  );

  const screen = tab === "home" ? home : tab === "children" ? children : tab === "updates" ? updates : profile;
  const titles: Record<string, string> = { home: `${c.name}'s learning`, children: "Your children", updates: "Updates", profile: "Family" };
  return <AppChrome theme={THEMES.parent} kicker="Parent" title={titles[tab]} tabs={tabs} tab={tab} setTab={setTab} right={<ExitBtn onExit={onExit} />}>{screen}</AppChrome>;
}

/* =========================================================================== */
/*  TEACHER APP                                                                 */
/* =========================================================================== */
function TeacherApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState("home");
  const [sub, setSub] = useState<null | "record" | "public" | "plans">(null);
  const t = TEACHERS[0];
  const tabs = [{ k: "home", label: "Home", icon: "home" }, { k: "students", label: "Students", icon: "students" }, { k: "lessons", label: "Lessons", icon: "lessons" }, { k: "profile", label: "Profile", icon: "profile" }];

  const roster = [["Aarav Kapoor", "Guitar", "On track"], ["Meera Sharma", "Ukulele", "On track"], ["Ishaan Rao", "Guitar", "Needs attention"], ["Zoya Khan", "Guitar", "On track"]];

  if (sub === "record") return <SubScreen theme={THEMES.teacher} title="Record a lesson" onBack={() => setSub(null)}>
    <div className="space-y-3">
      <Demo>Prototype form</Demo>
      {[["Student", "Aarav Kapoor"], ["Instrument", "Guitar"], ["Topic taught", "Barre chords — F & B♭"], ["Accuracy", "80%"], ["Struggled with", "B-string transition"], ["Practice set", "20 min/day"], ["Next step", "Hold B♭ for 2 bars at 60 BPM"]].map(([a, b]) => (
        <div key={a} className="rounded-xl border px-3.5 py-2.5" style={{ borderColor: "var(--line)", background: "var(--s2)" }}><p className="text-[0.64rem] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{a}</p><p className="mt-0.5 text-[0.9rem]">{b}</p></div>
      ))}
      <p className="text-[0.74rem]" style={{ color: "var(--muted)" }}>In the live app this writes to the student record and appears in the parent portal.</p>
      <AccentBtn full onClick={() => setSub(null)}>Save lesson</AccentBtn>
    </div>
  </SubScreen>;

  if (sub === "public") return <SubScreen theme={THEMES.teacher} title="Public profile" onBack={() => setSub(null)}><TeacherPublicProfile t={t} /></SubScreen>;
  if (sub === "plans") return <SubScreen theme={THEMES.teacher} title="Teacher plans" onBack={() => setSub(null)}><PlansList audience="Teachers" /></SubScreen>;

  const home = (
    <div className="space-y-4">
      <p className="text-[0.95rem]" style={{ color: "var(--muted)" }}>Good evening, Rohan</p>
      <div className="grid grid-cols-3 gap-2.5">
        {[["9", "lessons today"], ["3", "to review"], ["2", "notes due"]].map(([n, l]) => (
          <S key={l} className="p-3 text-center"><p className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>{n}</p><p className="text-[0.66rem]" style={{ color: "var(--muted)" }}>{l}</p></S>
        ))}
      </div>
      <AccentBtn full onClick={() => setSub("record")}><Ic n="plus" s={17} /> Record a lesson</AccentBtn>
      <S className="p-4">
        <SectionLabel>Needs attention</SectionLabel>
        <div className="mt-2 flex items-center gap-3">
          <Avatar initials="IR" size={38} />
          <div className="flex-1"><p className="text-[0.86rem] font-semibold">Ishaan Rao</p><p className="text-[0.76rem]" style={{ color: "var(--muted)" }}>Missed last practice · chord changes</p></div>
          <span className="rounded-full border px-2 py-0.5 text-[0.6rem] font-bold" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>Follow up</span>
        </div>
      </S>
      <S className="p-4">
        <div className="flex items-center justify-between"><SectionLabel>Practice to review</SectionLabel><Demo>Prototype</Demo></div>
        <div className="mt-2 space-y-2">
          {[["Aarav Kapoor", "Barre chords video"], ["Zoya Khan", "Scale exercise"]].map(([n, w]) => (
            <div key={n} className="flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: "var(--line)", background: "var(--s2)" }}>
              <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "color-mix(in srgb,var(--accent) 14%,transparent)", color: "var(--accent)" }}><Ic n="play" s={15} /></span>
              <div className="flex-1"><p className="text-[0.84rem] font-medium">{n}</p><p className="text-[0.72rem]" style={{ color: "var(--muted)" }}>{w}</p></div>
              <Ic n="chev" s={16} c="opacity-40" />
            </div>
          ))}
        </div>
      </S>
    </div>
  );

  const students = (
    <div className="space-y-3">
      {roster.map(([n, inst, st]) => (
        <S key={n} className="flex items-center gap-3 p-3.5">
          <Avatar initials={n.split(" ").map((w) => w[0]).join("")} size={42} />
          <div className="flex-1"><p className="text-[0.88rem] font-semibold">{n}</p><p className="text-[0.74rem]" style={{ color: "var(--muted)" }}>{inst}</p></div>
          <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold" style={{ background: st === "On track" ? "color-mix(in srgb,var(--accent) 14%,transparent)" : "transparent", border: st === "On track" ? "none" : "1px solid var(--accent)", color: "var(--accent)" }}>{st}</span>
        </S>
      ))}
      <p className="px-1 text-[0.72rem]" style={{ color: "var(--muted)" }}>You only ever see students assigned to you — enforced by row-level security in the live app.</p>
    </div>
  );

  const lessons = (
    <div className="space-y-4">
      <AccentBtn full onClick={() => setSub("record")}><Ic n="plus" s={17} /> New lesson record</AccentBtn>
      <S className="p-4">
        <SectionLabel>Recent activity</SectionLabel>
        <div className="mt-3 space-y-3">
          {LESSON_HISTORY.map((l) => (
            <div key={l.date} className="flex gap-3"><div className="w-12 shrink-0 text-[0.72rem] font-semibold" style={{ color: "var(--muted)" }}>{l.date}</div><div className="flex-1 border-l pl-3" style={{ borderColor: "var(--line)" }}><p className="text-[0.86rem] font-medium">{l.topic}</p><p className="text-[0.76rem]" style={{ color: "var(--muted)" }}>Aarav Kapoor · {l.note}</p></div></div>
          ))}
        </div>
      </S>
      <AiPreview />
    </div>
  );

  const profile = (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pt-1"><Avatar initials="RM" size={60} /><div><p className="font-display text-xl font-semibold">{t.name}</p><p className="text-[0.82rem]" style={{ color: "var(--muted)" }}>{t.instruments.join(" · ")} teacher</p></div></div>
      <GhostBtn full onClick={() => setSub("public")}><Ic n="profile" s={16} /> View my public profile</GhostBtn>
      <PlanCard title="Professional" price={999} unit="/month" active onManage={() => setSub("plans")} />
      <SettingsList items={[["enquiries", "Student enquiries"], ["settings", "Account & privacy"], ["updates", "Notifications"]]} />
    </div>
  );

  const screen = tab === "home" ? home : tab === "students" ? students : tab === "lessons" ? lessons : profile;
  const titles: Record<string, string> = { home: "Teaching", students: "My students", lessons: "Lessons", profile: "Profile" };
  return <AppChrome theme={THEMES.teacher} kicker="Teacher" title={titles[tab]} tabs={tabs} tab={tab} setTab={setTab} right={<ExitBtn onExit={onExit} />}>{screen}</AppChrome>;
}

function TeacherPublicProfile({ t }: { t: typeof TEACHERS[number] }) {
  return (
    <div className="space-y-4">
      <div className="relative -mx-5 -mt-1 h-28 overflow-hidden">
        <img src="/images/classes/keys-duet.webp" alt="" className="h-full w-full object-cover opacity-70" style={{ objectPosition: "50% 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg), transparent)" }} />
        <span className="absolute right-4 top-4"><Demo>Preview</Demo></span>
      </div>
      <div className="flex items-end gap-3"><Avatar initials={t.initials} size={64} /><div className="pb-1"><div className="flex items-center gap-2"><p className="font-display text-xl font-semibold">{t.name}</p><span className="rounded-full border px-2 py-0.5 text-[0.58rem] font-bold" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>Pending review</span></div><p className="text-[0.78rem]" style={{ color: "var(--muted)" }}>/t/{t.slug}</p></div></div>
      <p className="text-[0.88rem] leading-relaxed">{t.bio}</p>
      <div className="flex flex-wrap gap-1.5">{t.genres.concat(t.modes).map((g) => <Pill key={g}>{g}</Pill>)}</div>
      <div className="grid grid-cols-3 gap-2">{["Live set", "Recital", "Technique"].map((x) => <div key={x} className="grid aspect-video place-items-center rounded-lg border text-[0.6rem]" style={{ borderColor: "var(--line)", color: "var(--muted)" }}><Ic n="play" s={15} /></div>)}</div>
      <p className="text-[0.72rem]" style={{ color: "var(--muted)" }}>Paying never makes a profile &ldquo;verified&rdquo;: unverified → pending review → verified, based on real checks.</p>
      <AccentBtn full>Share profile link</AccentBtn>
    </div>
  );
}

/* =========================================================================== */
/*  MUSICIAN APP                                                                */
/* =========================================================================== */
function MusicianApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState("home");
  const [bk, setBk] = useState(0); // booking stage index for the enquiries demo
  const m = MUSICIANS[0];
  const tabs = [{ k: "home", label: "Home", icon: "home" }, { k: "portfolio", label: "Portfolio", icon: "portfolio" }, { k: "enquiries", label: "Enquiries", icon: "enquiries" }, { k: "profile", label: "Profile", icon: "profile" }];
  const STAGES = ["Enquiry", "Reviewing", "Quote sent", "Accepted", "Confirmed"];

  const home = (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl">
        <img src="/gallery/08-stage.jpg" alt="" className="h-36 w-full object-cover opacity-80" style={{ objectPosition: "50% 45%" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-4"><p className="font-display text-lg font-semibold text-white">{m.name}</p><p className="text-[0.78rem] text-white/70">{m.tagline}</p></div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[["—", "profile views"], ["2", "new enquiries"], ["3", "event invites"]].map(([n, l]) => (
          <S key={l} className="p-3 text-center"><p className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>{n}</p><p className="text-[0.64rem]" style={{ color: "var(--muted)" }}>{l}</p></S>
        ))}
      </div>
      <p className="px-1 text-[0.7rem]" style={{ color: "var(--muted)" }}>Analytics show only real data — no invented views, bookings or earnings.</p>
      <S className="p-4">
        <div className="flex items-center justify-between"><SectionLabel>Event opportunities</SectionLabel><Demo>Sample</Demo></div>
        <div className="mt-2 space-y-2">
          {EVENTS.filter((e) => e.state === "published").slice(0, 2).map((e) => (
            <div key={e.title} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "var(--line)", background: "var(--s2)" }}>
              <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "color-mix(in srgb,var(--accent) 14%,transparent)", color: "var(--accent)" }}><Ic n="mic" s={16} /></span>
              <div className="flex-1"><p className="text-[0.84rem] font-medium">{e.title}</p><p className="text-[0.72rem]" style={{ color: "var(--muted)" }}>{e.date}</p></div>
              <Ic n="chev" s={16} c="opacity-40" />
            </div>
          ))}
        </div>
      </S>
    </div>
  );

  const portfolio = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {["Live at The Piano Man", "Wedding set — acoustic", "Studio session", "Café unplugged"].map((x, i) => (
          <div key={x} className="relative aspect-square overflow-hidden rounded-xl border" style={{ borderColor: "var(--line)" }}>
            <img src={["/gallery/03-stage-guitar.jpg", "/gallery/08-stage.jpg", "/images/classes/duet.webp", "/images/hero/slide-3.webp"][i]} alt="" className="h-full w-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-black"><Ic n="play" s={13} /></span>
            <p className="absolute inset-x-2 bottom-1.5 text-[0.66rem] font-medium text-white">{x}</p>
          </div>
        ))}
      </div>
      <S className="p-4"><SectionLabel>Instruments & genres</SectionLabel><div className="mt-2 flex flex-wrap gap-1.5">{m.instruments.concat(m.genres).map((g) => <Pill key={g}>{g}</Pill>)}</div></S>
      <S className="p-4"><SectionLabel>Performs</SectionLabel><p className="mt-1.5 text-[0.86rem]">{m.performanceTypes.join(" · ")}</p><p className="mt-1 text-[0.8rem]" style={{ color: "var(--muted)" }}>Indicative from <span className="font-semibold" style={{ color: "var(--text)" }}>{inr(m.fromFee)}</span></p></S>
    </div>
  );

  const enquiries = (
    <div className="space-y-4">
      <S className="p-4">
        <div className="flex items-center justify-between"><SectionLabel>Wedding sangeet · 13 Dec</SectionLabel><Demo tone="sim">Simulated</Demo></div>
        <p className="mt-1.5 text-[0.84rem]">Chhatarpur, Delhi · 90 min · ~120 guests</p>
        {/* pipeline */}
        <div className="mt-3 flex items-center gap-1">
          {STAGES.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <span className="h-1.5 w-full rounded-full" style={{ background: i <= bk ? "var(--accent)" : "color-mix(in srgb,var(--text) 10%,transparent)" }} />
              <span className="text-[0.56rem] font-medium" style={{ color: i === bk ? "var(--accent)" : "var(--muted)" }}>{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <GhostBtn onClick={() => setBk(Math.max(0, bk - 1))}>Back</GhostBtn>
          <AccentBtn full onClick={() => setBk(Math.min(STAGES.length - 1, bk + 1))}>{bk === STAGES.length - 1 ? "Confirmed" : "Advance stage"}</AccentBtn>
        </div>
      </S>
      <p className="px-1 text-[0.72rem]" style={{ color: "var(--muted)" }}>Payments & confirmations are simulated — no charge, no real reservation, no musician committed. Future model: commission on completed bookings.</p>
    </div>
  );

  const profile = (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pt-1"><Avatar initials={m.initials} size={60} /><div><p className="font-display text-xl font-semibold">{m.name}</p><p className="text-[0.82rem]" style={{ color: "var(--muted)" }}>{m.location}</p></div></div>
      <GhostBtn full><Ic n="profile" s={16} /> View public profile</GhostBtn>
      <PlanCard title="Musician Pro" price={999} unit="/month" active />
      <SettingsList items={[["discover", "Discovery placement"], ["settings", "Account & privacy"], ["updates", "Notifications"]]} />
    </div>
  );

  const screen = tab === "home" ? home : tab === "portfolio" ? portfolio : tab === "enquiries" ? enquiries : profile;
  const titles: Record<string, string> = { home: "Your stage", portfolio: "Portfolio", enquiries: "Enquiries", profile: "Profile" };
  return <AppChrome theme={THEMES.musician} kicker="Musician" title={titles[tab]} tabs={tabs} tab={tab} setTab={setTab} right={<ExitBtn onExit={onExit} />}>{screen}</AppChrome>;
}

/* ---------------------------------------------------------- shared fragments */
function ExitBtn({ onExit }: { onExit: () => void }) {
  return <button onClick={onExit} aria-label="Exit demo persona" className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)" }}><Ic n="back" s={16} /></button>;
}

function SubScreen({ theme, title, onBack, children }: { theme: Theme; title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div data-dark={theme.dark} className="flex h-full flex-col font-body" style={{ ...themeVars(theme), background: "var(--bg)", color: "var(--text)" }}>
      <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
        <button onClick={onBack} aria-label="Back" className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)" }}><Ic n="back" s={18} /></button>
        <h1 className="font-display text-[1.35rem] font-semibold">{title}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{children}</div>
    </div>
  );
}

function SettingsList({ items }: { items: [string, string][] }) {
  return (
    <S className="overflow-hidden">
      {items.map(([icon, label], i) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3.5" style={i > 0 ? { borderTop: "1px solid var(--line)" } : undefined}>
          <span style={{ color: "var(--muted)" }}><Ic n={icon} s={18} /></span>
          <span className="flex-1 text-[0.86rem]">{label}</span>
          <Ic n="chev" s={16} c="opacity-30" />
        </div>
      ))}
    </S>
  );
}

function PlanCard({ title, price, unit, active, onManage }: { title: string; price: number; unit: string; active?: boolean; onManage?: () => void }) {
  return (
    <S className="p-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Subscription</SectionLabel>
        <div className="flex items-center gap-2">{active && <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold" style={{ background: "color-mix(in srgb,var(--accent) 14%,transparent)", color: "var(--accent)" }}>Active</span>}<Demo>Test-mode</Demo></div>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div><p className="font-display text-lg font-semibold">{title}</p><p><span className="font-display text-xl font-semibold" style={{ color: "var(--accent)" }}>{inr(price)}</span><span className="text-[0.76rem]" style={{ color: "var(--muted)" }}>{unit}</span></p></div>
        <button onClick={onManage} className="rounded-full border px-3.5 py-2 text-[0.78rem] font-semibold" style={{ borderColor: "var(--line)", color: "var(--text)" }}>{onManage ? "Change plan" : "Manage"}</button>
      </div>
    </S>
  );
}

function PlansList({ audience }: { audience: Plan["audience"] }) {
  return (
    <div className="space-y-3">
      <Demo>Test-mode billing — no real charge</Demo>
      {PLANS.filter((p) => p.audience === audience).map((p) => (
        <S key={p.name} className="p-4" >
          <div className="flex items-center justify-between"><p className="font-display text-lg font-semibold">{p.name}</p><p><span className="font-display text-xl font-semibold" style={{ color: "var(--accent)" }}>{inr(p.price)}</span><span className="text-[0.74rem]" style={{ color: "var(--muted)" }}>{p.unit}</span></p></div>
          <p className="mt-1 text-[0.8rem]" style={{ color: "var(--muted)" }}>{p.pitch}</p>
          <ul className="mt-2.5 space-y-1">{p.features.slice(0, 4).map((f) => <li key={f} className="flex items-start gap-2 text-[0.82rem]"><Ic n="check" s={14} c="mt-0.5 shrink-0" />{f}</li>)}</ul>
          <div className="mt-3"><AccentBtn full>Start test checkout</AccentBtn></div>
        </S>
      ))}
    </div>
  );
}

function DiscoverStrip() {
  return (
    <S className="overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4"><SectionLabel>Discover near you</SectionLabel><Demo>Sample</Demo></div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-4 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[["Monsoon Open Mic", "/gallery/08-stage.jpg"], ["Guitar Masterclass", "/images/classes/ukulele.webp"], ["Find a piano teacher", "/images/classes/keys-duet.webp"]].map(([t, img]) => (
          <div key={t} className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl">
            <img src={img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <p className="absolute inset-x-2 bottom-1.5 text-[0.72rem] font-semibold text-white">{t}</p>
          </div>
        ))}
      </div>
    </S>
  );
}

function AiPreview() {
  const [open, setOpen] = useState(false);
  const r = AI_SAMPLE_REPORT;
  return (
    <S className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span style={{ color: "var(--accent)" }}><Ic n="sparkle" s={18} /></span><p className="font-display text-base font-semibold">AI practice feedback</p></div>
        <Demo>Not a real AI model</Demo>
      </div>
      <p className="mt-1.5 text-[0.82rem]" style={{ color: "var(--muted)" }}>A preview of the assessment report shape for {r.instrument.toLowerCase()} & keyboard.</p>
      {!open ? (
        <div className="mt-3"><GhostBtn full onClick={() => setOpen(true)}>Open sample report</GhostBtn></div>
      ) : (
        <div className="mt-3 space-y-3 rounded-xl border p-3" style={{ borderColor: "var(--line)", background: "var(--s2)" }}>
          <div className="flex flex-wrap gap-2"><Demo>Demo assessment</Demo><Demo>Illustrative — not AI-generated</Demo></div>
          <p className="text-[0.78rem]" style={{ color: "var(--muted)" }}>{r.instrument} · {r.task}</p>
          <div><p className="text-[0.66rem] font-bold uppercase tracking-wide" style={{ color: "var(--accent)" }}>To review</p><ul className="mt-1 space-y-1">{r.toReview.map((x) => <li key={x} className="text-[0.8rem]">• {x}</li>)}</ul></div>
          <div><p className="text-[0.66rem] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Timestamps</p><div className="mt-1 space-y-1">{r.timeline.slice(0, 2).map((e) => <p key={e.at} className="text-[0.8rem]"><span className="font-mono" style={{ color: "var(--accent)" }}>{e.at}</span> — {e.note}</p>)}</div></div>
          <p className="text-[0.8rem]"><span className="font-semibold">Next:</span> {r.nextPlan}</p>
        </div>
      )}
    </S>
  );
}

/* =========================================================================== */
/*  ROOT                                                                         */
/* =========================================================================== */
export function Prototype1() {
  const [phase, setPhase] = useState<"intro" | Id>("intro");

  const app =
    phase === "student" ? <StudentApp onExit={() => setPhase("intro")} />
    : phase === "parent" ? <ParentApp onExit={() => setPhase("intro")} />
    : phase === "teacher" ? <TeacherApp onExit={() => setPhase("intro")} />
    : phase === "musician" ? <MusicianApp onExit={() => setPhase("intro")} />
    : <Intro onChoose={(id) => setPhase(id)} onSignIn={() => setPhase("student")} />;

  return (
    <div className="relative min-h-[100svh] bg-[#0B0F18] text-ivory">
      {/* editorial backdrop (desktop only) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute left-[-10vw] top-[-10vh] h-[40rem] w-[40rem] rounded-full bg-gold/[0.07] blur-[160px]" />
        <div className="absolute right-[-8vw] bottom-[-12vh] h-[34rem] w-[34rem] rounded-full bg-forest/15 blur-[150px]" />
      </div>

      {/* desktop presenter rail */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center gap-8 px-6 py-8 lg:flex-row lg:items-center lg:gap-16">
        <div className="hidden max-w-sm lg:block">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ivory/60 hover:text-ivory"><Ic n="back" s={16} /> Back to live site</Link>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight">Musicphonetics, <span className="text-gold-soft">as an app.</span></h2>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-ivory/65">A first-run experience and four distinct, identity-specific apps — Student, Parent, Teacher, Musician. Each has its own home and navigation. No admin sidebar.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold-soft">Presenter controls · demo only</p>
            <p className="mt-1.5 text-[0.8rem] text-ivory/55">Jump straight into a persona&rsquo;s app, or start from onboarding.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {([["intro", "Onboarding"], ["student", "Student"], ["parent", "Parent"], ["teacher", "Teacher"], ["musician", "Musician"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setPhase(k)} className={`rounded-full border px-3 py-2 text-[0.8rem] font-medium transition ${phase === k ? "border-gold bg-gold/15 text-gold-soft" : "border-white/12 text-ivory/70 hover:text-ivory"}`}>{l}</button>
              ))}
            </div>
            <p className="mt-3 text-[0.68rem] text-ivory/40">Synthetic data only. No production records, payments or emails are touched.</p>
          </div>
        </div>

        {/* the device */}
        <div className="relative w-full max-w-[400px] shrink-0">
          <div className="relative mx-auto h-[100svh] w-full overflow-hidden bg-black lg:h-[min(840px,88svh)] lg:w-[390px] lg:rounded-[2.8rem] lg:border-[11px] lg:border-black lg:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
            {app}
          </div>
          {/* mobile-only restart */}
          <Link href="/" className="mt-3 flex items-center justify-center gap-1.5 text-[0.76rem] text-ivory/45 lg:hidden">Musicphonetics · Prototype 1 · <span className="text-gold-soft">live site</span></Link>
        </div>
      </div>
    </div>
  );
}
