"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProgressScreen, LessonPlanScreen } from "@/components/home/portal/frames";
import {
  PILLARS, PERSONAS, TEACHERS, MUSICIANS, MUSICIAN_FILTERS, BOOKING_STAGES,
  EVENTS, AI_TASKS, AI_SAMPLE_REPORT, PLANS, OWNER_METRICS, inr,
  type Status, type Persona, type Teacher, type Musician, type BookingStage, type Plan,
} from "./data";

// ============================================================================
// Prototype 1 — one navigable, honestly-labelled demonstration of the whole
// Musicphonetics ecosystem. Fully client-side, synthetic data, no production
// reads/writes, no auth, no payments. Reuses the brand design system and the
// real portal preview screens (frames.tsx) for continuity with the live app.
// ============================================================================

/* ----------------------------------------------------------------- icons -- */
const PATHS: Record<string, string> = {
  overview: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  teacher: "M12 4L3 8l9 4 9-4-9-4zM6 10v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4",
  parent: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z",
  ai: "M12 3l1.6 4.3L18 9l-4.4 1.7L12 15l-1.6-4.3L6 9l4.4-1.7zM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8z",
  musician: "M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v4",
  community: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z",
  pricing: "M20 12l-8 8-8-8V4h8zM7.5 7.5h.01",
  owner: "M5 21V9m7 12V4m7 17v-8",
  check: "M5 12.5l4.5 4.5L19 6.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  map: "M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11zm0-8a3 3 0 100-6 3 3 0 000 6z",
  star: "M12 3l2.6 5.5L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.8z",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
  lock: "M6 11V8a6 6 0 1112 0v3M5 11h14v10H5z",
  play: "M8 5v14l11-7z",
  upload: "M12 16V4m0 0L8 8m4-4l4 4M4 20h16",
  chevron: "M9 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  link: "M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  sparkle: "M12 3l1.6 4.3L18 9l-4.4 1.7L12 15l-1.6-4.3L6 9l4.4-1.7z",
};
function I({ n, c = "", s = 18 }: { n: string; c?: string; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={c}>
      <path d={PATHS[n]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ----------------------------------------------------------- UI primitives -- */
function DemoTag({ children = "Demo", tone = "amber" }: { children?: React.ReactNode; tone?: "amber" | "sim" }) {
  const cls = tone === "sim"
    ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
    : "border-amber-400/40 bg-amber-400/10 text-amber-200";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}

function StatusChip({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    live: "bg-emerald-400/12 text-emerald-300 border-emerald-400/30",
    building: "border border-gold/40 text-gold-soft",
    planned: "border border-ivory/20 text-ivory/50",
  };
  const label = status === "live" ? "Live" : status === "building" ? "Building" : "Planned";
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${map[status]}`}>{label}</span>;
}

function Verify({ v }: { v: Teacher["verification"] }) {
  const map = {
    verified: { c: "bg-emerald-400/12 text-emerald-300 border-emerald-400/30", t: "Verified" },
    pending: { c: "border border-gold/40 text-gold-soft", t: "Pending review" },
    unverified: { c: "border border-ivory/20 text-ivory/50", t: "Unverified" },
  }[v];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold ${map.c}`}>{v === "verified" && <I n="check" s={12} />}{map.t}</span>;
}

function Avatar({ initials, size = 44, ring = true }: { initials: string; size?: number; ring?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold/25 to-forest/30 font-display font-semibold text-gold-soft ${ring ? "ring-1 ring-gold/30" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}>{children}</div>;
}

function Head({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
      <h2 className="mt-2 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium leading-[1.1] text-ivory">{title}</h2>
      {sub && <p className="mt-2.5 text-[0.98rem] leading-relaxed text-ivory/60">{sub}</p>}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, href }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "soft"; disabled?: boolean; href?: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40";
  const v = {
    primary: "bg-gold text-charcoal hover:brightness-105",
    ghost: "border border-ivory/20 text-ivory/90 hover:border-ivory/50",
    soft: "bg-white/[0.06] text-ivory hover:bg-white/[0.1]",
  }[variant];
  if (href) return <a href={href} className={`${base} ${v}`}>{children}</a>;
  return <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${v}`}>{children}</button>;
}

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <Card className="p-4">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ivory/45">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold text-ivory">{value}</p>
      {note && <p className="mt-0.5 text-[0.72rem] text-ivory/45">{note}</p>}
    </Card>
  );
}

function PhoneFit({ children, h = 300 }: { children: React.ReactNode; h?: number }) {
  // Scales the 300px-wide portal frame down to fit a narrow column.
  const scale = h / 588;
  return (
    <div className="relative mx-auto overflow-hidden" style={{ width: 300 * scale, height: h }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 1 — ECOSYSTEM OVERVIEW                                                 */
/* =========================================================================== */
function OverviewView() {
  return (
    <div className="space-y-10">
      <Head
        eyebrow="The ecosystem"
        title="One identity. Four connected products."
        sub="A person can be a teacher, a performer and a parent under a single account — with the right tools, permissions and subscription for each. This prototype walks through how the pieces connect."
      />

      {/* identity → pillars */}
      <div className="grid gap-4 md:grid-cols-2">
        {PILLARS.map((p) => (
          <Card key={p.key} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-gold/[0.08] text-gold-soft"><I n={p.key === "education" ? "teacher" : p.key === "profiles" ? "musician" : p.key === "discovery" ? "map" : "community"} /></span>
              <StatusChip status={p.status} />
            </div>
            <h3 className="mt-3.5 font-display text-lg font-semibold text-ivory">{p.name}</h3>
            <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ivory/60">{p.line}</p>
          </Card>
        ))}
      </div>

      {/* who connects */}
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">One account, many roles</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {([
            ["teacher", "Teacher", "Teaches, showcases, performs"],
            ["parent", "Parent", "Follows a child, discovers teachers"],
            ["overview", "Student", "Learns, practises, submits work"],
            ["musician", "Musician", "Performs, takes bookings, collaborates"],
            ["community", "Venue / Organiser", "Discovers musicians, runs events"],
          ] as const).map(([icon, name, line]) => (
            <Card key={name} className="p-4">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-gold-soft"><I n={icon} s={16} /></span>
              <p className="mt-2.5 font-display text-base font-medium text-ivory">{name}</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-ivory/55">{line}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* intelligence layer honest note */}
      <Card className="flex flex-col gap-3 border-gold/20 bg-gold/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/[0.08] text-gold-soft"><I n="sparkle" /></span>
          <div>
            <p className="font-display text-base font-semibold text-ivory">An intelligence layer, on top of a real data foundation</p>
            <p className="mt-1 max-w-xl text-[0.86rem] leading-relaxed text-ivory/60">Every class already records what was taught, accuracy and where a student struggled. The AI layer turns that into practice feedback — demonstrated here honestly as a prototype.</p>
          </div>
        </div>
        <StatusChip status="building" />
      </Card>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 2 — TEACHER                                                            */
/* =========================================================================== */
function TeacherView() {
  const [tab, setTab] = useState<"profile" | "workspace">("profile");
  const t = TEACHERS[0];
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Head eyebrow="Teacher platform" title="A professional identity, and the tools to teach." />
        <div className="flex rounded-full border border-white/12 bg-white/[0.04] p-1">
          {(["profile", "workspace"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${tab === k ? "bg-gold text-charcoal" : "text-ivory/70 hover:text-ivory"}`}>
              {k === "profile" ? "Public profile" : "Workspace"}
            </button>
          ))}
        </div>
      </div>

      {tab === "profile" ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden">
            <div className="relative h-28 bg-gradient-to-br from-forest/40 via-charcoal to-gold/15">
              <span className="absolute right-4 top-4"><DemoTag>Preview</DemoTag></span>
            </div>
            <div className="px-6 pb-6">
              <div className="-mt-9 flex items-end gap-4">
                <div className="rounded-full ring-4 ring-charcoal-2"><Avatar initials={t.initials} size={72} /></div>
                <div className="mb-1 flex items-center gap-2"><Verify v={t.verification} /></div>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ivory">{t.name}</h3>
              <p className="mt-0.5 text-sm text-ivory/55">{t.instruments.join(" · ")} teacher · {t.years} years · /t/{t.slug}</p>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-ivory/70">{t.bio}</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Genres & focus" value={t.genres.join(", ")} />
                <Field label="Teaching modes" value={t.modes.join(", ")} />
                <Field label="Locations" value={t.locations.join(", ")} />
                <Field label="Languages" value={t.languages.join(", ")} />
              </div>
              <div className="mt-4">
                <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Approach</p>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-ivory/70">{t.approach}</p>
              </div>

              <div className="mt-5">
                <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Portfolio</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["Live set", "Student recital", "Technique clip"].map((x) => (
                    <div key={x} className="grid aspect-video place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[0.62rem] text-ivory/40">
                      <span className="flex flex-col items-center gap-1"><I n="play" s={16} />{x}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Btn>Enquire about lessons <I n="arrow" s={16} /></Btn>
                <span className="text-[0.72rem] text-ivory/45">Enquiry goes to the teacher — consent-based, no exposed contact details.</span>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold">Why statuses matter</p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ivory/65">Registering or paying does <span className="text-ivory">not</span> make a teacher &ldquo;verified&rdquo;. Profiles move through <span className="text-ivory/85">unverified → pending review → verified</span> based on actual checks.</p>
            </Card>
            <Card className="p-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold">Subscription</p>
              <div className="mt-3 flex items-center justify-between">
                <div><p className="font-display text-lg font-semibold text-ivory">{t.plan}</p><p className="text-[0.75rem] text-ivory/50">Profile enhancements + analytics</p></div>
                <span className="rounded-full bg-emerald-400/12 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-emerald-300">Active</span>
              </div>
              <div className="mt-3"><DemoTag>Test-mode billing</DemoTag></div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Students" value="6" note="assigned to you" />
              <Stat label="This week" value="9" note="lessons scheduled" />
              <Stat label="Practice to review" value="3" note="awaiting feedback" />
              <Stat label="Reports due" value="2" note="this month" />
            </div>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold text-ivory">Record a lesson</p>
                <DemoTag>Prototype form</DemoTag>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Student" value="Aarav Kapoor" />
                <Field label="Instrument" value="Guitar" />
                <Field label="Topic taught" value="Barre chords — F & B♭" />
                <Field label="Accuracy" value="80%" />
                <Field label="Where they struggled" value="B-string transition" />
                <Field label="Practice set" value="20 min/day" />
              </div>
              <p className="mt-3 text-[0.72rem] text-ivory/45">In the live app these fields write to the student record and surface in the parent portal. Here, inputs are read-only sample values.</p>
            </Card>

            <Card className="p-5">
              <p className="font-display text-lg font-semibold text-ivory">My students</p>
              <div className="mt-3 divide-y divide-white/8">
                {[["Aarav Kapoor", "Guitar", "On track"], ["Meera Sharma", "Ukulele", "On track"], ["Ishaan Rao", "Guitar", "Needs attention"]].map(([n, inst, st]) => (
                  <div key={n} className="flex items-center gap-3 py-3">
                    <Avatar initials={n.split(" ").map((w) => w[0]).join("")} size={36} ring={false} />
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ivory">{n}</p><p className="text-[0.75rem] text-ivory/45">{inst}</p></div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold ${st === "On track" ? "bg-emerald-400/12 text-emerald-300" : "border border-gold/40 text-gold-soft"}`}>{st}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[0.72rem] text-ivory/45">A teacher only ever sees students assigned to them — enforced by row-level security in the live app.</p>
            </Card>
          </div>

          <Card className="p-4">
            <p className="mb-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ivory/45">Live portal preview</p>
            <PhoneFit h={300}><LessonPlanScreen /></PhoneFit>
            <p className="mt-3 text-center text-[0.7rem] text-ivory/45">The real Teacher / Student OS screen, reused from the shipping app.</p>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
      <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-ivory/40">{label}</p>
      <p className="mt-0.5 text-[0.9rem] text-ivory/85">{value}</p>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 3 — PARENT (Family Plus)                                               */
/* =========================================================================== */
function ParentView() {
  const children = [{ name: "Aarav Kapoor", inst: "Guitar", code: "MP-2026-000004" }, { name: "Meera Kapoor", inst: "Piano", code: "MP-2026-000011" }];
  const [idx, setIdx] = useState(0);
  const c = children[idx];
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Head eyebrow="Family Plus · ₹499/family" title="A parent sees the learning, not a billing screen." />
        <div className="flex items-center gap-2">
          <span className="text-[0.72rem] text-ivory/45">Child</span>
          <div className="flex rounded-full border border-white/12 bg-white/[0.04] p-1">
            {children.map((ch, i) => (
              <button key={ch.code} onClick={() => setIdx(i)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${idx === i ? "bg-gold text-charcoal" : "text-ivory/70 hover:text-ivory"}`}>
                {ch.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar initials={c.name.split(" ").map((w) => w[0]).join("")} />
              <div><p className="font-display text-lg font-semibold text-ivory">{c.name}</p><p className="text-[0.75rem] text-ivory/50">{c.inst} · {c.code}</p></div>
              <span className="ml-auto rounded-full bg-emerald-400/12 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-emerald-300">On track</span>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Last class</p>
              <p className="mt-1.5 font-display text-base font-medium text-ivory">Barre chords — F &amp; B♭</p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-ivory/60">&ldquo;Great focus today. B-string needs a cleaner press on the B♭ — we drilled it and it&rsquo;s improving.&rdquo;</p>
              <p className="mt-2 text-[0.72rem] text-ivory/45">— {TEACHERS[0].name}, teacher observation</p>
            </Card>
            <Card className="p-5">
              <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Practise next</p>
              <ul className="mt-2 space-y-2">
                {["B♭ barre-and-release, 60 sec/day", "Metronome 60 BPM — change on beat 1", "Spider walk 1-2-3-4"].map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[0.86rem] text-ivory/70"><I n="check" s={15} c="mt-0.5 shrink-0 text-gold-soft" />{x}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-5">
            <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Progress this cycle</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[0.78rem] text-ivory/60"><span>Class 5 of 8</span><span>62%</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold" style={{ width: "62%" }} /></div>
              </div>
            </div>
            <p className="mt-3 text-[0.72rem] text-ivory/45">Essential teacher communications and records are never paywalled — Family Plus adds summaries and family convenience, not access to safety-critical information.</p>
          </Card>
        </div>

        <Card className="p-4">
          <p className="mb-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ivory/45">Parent portal</p>
          <PhoneFit h={320}><ProgressScreen /></PhoneFit>
          <p className="mt-3 text-center text-[0.7rem] text-ivory/45">The real parent portal screen from the shipping app.</p>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 4 — AI ASSESSMENT (clearly labelled)                                   */
/* =========================================================================== */
function AiView() {
  const [instrument, setInstrument] = useState<keyof typeof AI_TASKS>("Guitar");
  const [task, setTask] = useState(AI_TASKS.Guitar[0]);
  const [phase, setPhase] = useState<"setup" | "processing" | "report">("setup");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function run() {
    setPhase("processing");
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => setPhase("report"), reduced ? 250 : 1900);
  }

  const r = AI_SAMPLE_REPORT;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Head eyebrow="AI music learning — prototype" title="From a practice video to structured feedback." />
        <DemoTag>Illustrative — not an AI model</DemoTag>
      </div>

      {phase !== "report" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <p className="font-display text-lg font-semibold text-ivory">1 · Set up the submission</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ivory/45">Instrument</p>
                <div className="flex gap-2">
                  {(Object.keys(AI_TASKS) as (keyof typeof AI_TASKS)[]).map((k) => (
                    <button key={k} onClick={() => { setInstrument(k); setTask(AI_TASKS[k][0]); }}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${instrument === k ? "bg-gold text-charcoal" : "border border-white/12 text-ivory/70 hover:text-ivory"}`}>{k}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ivory/45">Practice task</p>
                <div className="space-y-2">
                  {AI_TASKS[instrument].map((x) => (
                    <button key={x} onClick={() => setTask(x)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${task === x ? "border-gold/50 bg-gold/[0.07] text-ivory" : "border-white/10 bg-white/[0.02] text-ivory/70 hover:border-white/20"}`}>
                      {x}{task === x && <I n="check" s={16} c="text-gold-soft" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col p-5">
            <p className="font-display text-lg font-semibold text-ivory">2 · Submission</p>
            <div className="mt-4 grid flex-1 place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-ivory/60"><I n="upload" /></span>
                <p className="mt-3 text-sm font-medium text-ivory">Using a labelled sample clip</p>
                <p className="mt-1 text-[0.78rem] text-ivory/45">sample-{instrument.toLowerCase()}-01.mp4 · 00:72</p>
                <p className="mt-3 text-[0.72rem] text-ivory/45">No real upload is stored in this prototype.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[0.75rem] text-ivory/55">{instrument} · {task}</p>
              <Btn onClick={run} disabled={phase === "processing"}>
                {phase === "processing" ? "Assessing…" : <>Run demo assessment <I n="arrow" s={16} /></>}
              </Btn>
            </div>
            {phase === "processing" && (
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full animate-[fade-up_0.4s_ease] rounded-full bg-gradient-to-r from-gold-soft to-gold" style={{ width: "66%" }} />
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-amber-400/[0.06] px-5 py-3">
            <p className="font-display text-base font-semibold text-ivory">Demo assessment report</p>
            <div className="flex items-center gap-2">
              <DemoTag>Demo assessment</DemoTag>
              <DemoTag>Illustrative feedback — not generated by an AI model</DemoTag>
            </div>
          </div>
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-4 text-[0.8rem] text-ivory/60">
                <span><span className="text-ivory/40">Instrument:</span> {r.instrument}</span>
                <span><span className="text-ivory/40">Task:</span> {r.task}</span>
                <span><span className="text-ivory/40">Submitted:</span> {r.submitted}</span>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-emerald-300"><I n="check" s={14} /> Performed well</p>
                <ul className="mt-2 space-y-1.5">{r.wellDone.map((x) => <li key={x} className="flex items-start gap-2 text-[0.88rem] text-ivory/75"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />{x}</li>)}</ul>
              </div>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-gold-soft">To review</p>
                <ul className="mt-2 space-y-1.5">{r.toReview.map((x) => <li key={x} className="flex items-start gap-2 text-[0.88rem] text-ivory/75"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />{x}</li>)}</ul>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ivory/50">Timestamped observations</p>
                <div className="mt-2 space-y-2">
                  {r.timeline.map((e) => (
                    <div key={e.at} className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                      <span className="rounded bg-charcoal px-1.5 py-0.5 font-mono text-[0.68rem] text-gold-soft">{e.at}</span>
                      <span className="text-[0.84rem] text-ivory/70">{e.note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ivory/50">Recommended practice</p>
                <ul className="mt-2 space-y-1.5">{r.exercises.map((x) => <li key={x} className="flex items-start gap-2 text-[0.86rem] text-ivory/70"><I n="check" s={14} c="mt-0.5 shrink-0 text-gold-soft" />{x}</li>)}</ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 px-5 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ivory/45">Teacher comment &amp; next plan</p>
            <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ivory/75">{r.nextPlan}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn variant="soft" onClick={() => setPhase("setup")}>Run another</Btn>
              <Btn variant="ghost">Add teacher comment</Btn>
              <Btn variant="ghost">Assign as practice</Btn>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-sky-400/20 bg-sky-400/[0.03] p-4">
        <p className="text-[0.82rem] leading-relaxed text-ivory/65">
          <span className="font-semibold text-ivory">How this maps to the real product:</span> the analysis layer is designed to be modular — video processing, audio feature extraction, model-based assessment and timestamp alignment — always reviewed by the teacher. No finger-position, pitch or timing detection is claimed here; this screen demonstrates the <span className="text-ivory/85">workflow and report shape</span>, not a trained model.
        </p>
      </Card>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 5 — MUSICIANS (discover → profile → booking)                           */
/* =========================================================================== */
function MusiciansView() {
  const [stage, setStage] = useState<"list" | "profile" | "booking">("list");
  const [sel, setSel] = useState<Musician>(MUSICIANS[0]);
  const [f, setF] = useState({ instrument: "Any", genre: "Any", type: "Any" });

  const filtered = MUSICIANS.filter((m) =>
    (f.instrument === "Any" || m.instruments.some((i) => i.includes(f.instrument))) &&
    (f.genre === "Any" || m.genres.includes(f.genre)) &&
    (f.type === "Any" || m.performanceTypes.includes(f.type))
  );

  if (stage === "booking") return <BookingView musician={sel} onBack={() => setStage("profile")} />;

  if (stage === "profile") {
    const m = sel;
    return (
      <div className="space-y-6">
        <button onClick={() => setStage("list")} className="inline-flex items-center gap-1.5 text-sm text-ivory/60 hover:text-ivory"><I n="chevron" s={16} c="rotate-180" /> Back to discovery</button>
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-gold/20 via-charcoal to-forest/40"><span className="absolute right-4 top-4"><DemoTag>Sample profile</DemoTag></span></div>
          <div className="px-6 pb-6">
            <div className="-mt-10 flex flex-wrap items-end gap-4">
              <div className="rounded-full ring-4 ring-charcoal-2"><Avatar initials={m.initials} size={76} /></div>
              <div className="mb-1"><h3 className="font-display text-2xl font-semibold text-ivory">{m.name}</h3><p className="text-sm text-ivory/55">{m.tagline}</p></div>
              <span className="mb-1 ml-auto rounded-full border border-gold/40 px-2.5 py-0.5 text-[0.62rem] font-semibold text-gold-soft">{m.plan}</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Instruments" value={m.instruments.join(", ")} />
              <Field label="Genres" value={m.genres.join(", ")} />
              <Field label="Based in" value={m.location} />
              <Field label="Performs" value={m.performanceTypes.join(", ")} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ivory/80">Indicative from <span className="font-semibold text-ivory">{inr(m.fromFee)}</span></span>
              <Btn onClick={() => setStage("booking")}>Send booking enquiry <I n="arrow" s={16} /></Btn>
            </div>
            <p className="mt-3 text-[0.72rem] text-ivory/45">Indicative only — not a quote or a guaranteed booking. Enquiries are consent-based.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Head eyebrow="Discovery" title="Find a musician for the moment." sub="Filters run against available profiles. This prototype uses a clearly-labelled demonstration roster." />
      <div className="flex flex-wrap gap-3">
        {(["instrument", "genre", "type"] as const).map((key) => (
          <label key={key} className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-sm">
            <span className="text-[0.7rem] uppercase tracking-wide text-ivory/40">{key}</span>
            <select value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="bg-transparent text-ivory/85 focus:outline-none [&>option]:text-charcoal">
              {MUSICIAN_FILTERS[key].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <span className="ml-auto self-center text-[0.75rem] text-ivory/45">{filtered.length} of {MUSICIANS.length} profiles</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <button key={m.slug} onClick={() => { setSel(m); setStage("profile"); }} className="group text-left">
            <Card className="h-full p-5 transition group-hover:border-gold/30 group-hover:bg-white/[0.05]">
              <div className="flex items-center gap-3">
                <Avatar initials={m.initials} />
                <div className="min-w-0"><p className="truncate font-display text-base font-semibold text-ivory">{m.name}</p><p className="truncate text-[0.75rem] text-ivory/50">{m.location}</p></div>
              </div>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-ivory/65">{m.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.genres.slice(0, 3).map((g) => <span key={g} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.68rem] text-ivory/60">{g}</span>)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
                <span className="text-[0.75rem] text-ivory/50">from {inr(m.fromFee)}</span>
                <span className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-gold-soft">View <I n="arrow" s={13} /></span>
              </div>
            </Card>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <Card className="p-8 text-center text-ivory/50">No profiles match these filters yet.</Card>}
    </div>
  );
}

/* --- Booking sub-view ------------------------------------------------------ */
function BookingView({ musician, onBack }: { musician: Musician; onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [role, setRole] = useState<"client" | "musician">("client");
  const stage: BookingStage = BOOKING_STAGES[stageIdx];

  if (!submitted) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-ivory/60 hover:text-ivory"><I n="chevron" s={16} c="rotate-180" /> Back to profile</button>
        <Head eyebrow={`Booking enquiry · ${musician.name}`} title="Tell the musician about the event." />
        <Card className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[["Event type", "Wedding sangeet"], ["Date", "Sat 13 Dec 2026"], ["Location", "Chhatarpur, Delhi"], ["Duration", "90 minutes"], ["Audience", "~120 guests"], ["Indicative budget", "₹15,000–20,000"]].map(([l, v]) => (
              <Field key={l} label={l} value={v} />
            ))}
          </div>
          <p className="mt-3 text-[0.72rem] text-ivory/45">Sample details for the demo. Inputs validate and persist in the live app; spam protection applies.</p>
          <div className="mt-4"><Btn onClick={() => setSubmitted(true)}>Submit enquiry <I n="arrow" s={16} /></Btn></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-ivory/60 hover:text-ivory"><I n="chevron" s={16} c="rotate-180" /> Back to profile</button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Head eyebrow={`Booking · ${musician.name}`} title="Track the enquiry through to confirmation." />
        <DemoTag tone="sim">Simulated — no real booking</DemoTag>
      </div>

      {/* pipeline */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {BOOKING_STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-medium transition ${i < stageIdx ? "bg-emerald-400/12 text-emerald-300" : i === stageIdx ? "bg-gold text-charcoal" : "border border-white/12 text-ivory/40"}`}>
                {i < stageIdx && <I n="check" s={12} />}{s}
              </span>
              {i < BOOKING_STAGES.length - 1 && <I n="chevron" s={12} c="text-ivory/25" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <Card className="p-5">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Current status</p>
          <p className="mt-1 font-display text-xl font-semibold text-ivory">{stage}</p>
          <p className="mt-1 text-[0.82rem] text-ivory/55">Only transitions valid for the current role and state are enabled.</p>
        </Card>
        <Card className="p-5">
          <p className="mb-2 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Acting as</p>
          <div className="flex rounded-full border border-white/12 bg-white/[0.04] p-1">
            {(["client", "musician"] as const).map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${role === r ? "bg-white/[0.12] text-ivory" : "text-ivory/60"}`}>{r}</button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Btn variant="soft" onClick={() => setStageIdx(Math.max(0, stageIdx - 1))} disabled={stageIdx === 0}>Back</Btn>
            <Btn onClick={() => setStageIdx(Math.min(BOOKING_STAGES.length - 1, stageIdx + 1))} disabled={stageIdx === BOOKING_STAGES.length - 1}>
              Advance <I n="arrow" s={15} />
            </Btn>
          </div>
        </Card>
      </div>

      <Card className="border-sky-400/20 bg-sky-400/[0.03] p-4">
        <p className="text-[0.82rem] leading-relaxed text-ivory/65">Payments and confirmations are <span className="font-semibold text-ivory">simulated</span> for this demo. No charge is made, no real reservation is created, and no musician is committed. Future model: a platform commission on completed bookings — kept separate from subscription revenue.</p>
      </Card>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 6 — COMMUNITY & EVENTS                                                  */
/* =========================================================================== */
function CommunityView() {
  const typeColor: Record<string, string> = {
    "Open Mic": "text-gold-soft border-gold/40", Workshop: "text-sky-200 border-sky-400/40",
    Audition: "text-emerald-300 border-emerald-400/40", Collaboration: "text-violet-200 border-violet-400/40", Showcase: "text-gold-soft border-gold/40",
  };
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Head eyebrow="Community" title="Structured music activity — not a noisy feed." sub="Open mics, workshops, auditions and collaborations in one place." />
        <DemoTag>Sample events</DemoTag>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {EVENTS.filter((e) => e.state === "published").map((e) => (
          <Card key={e.title} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <span className={`rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${typeColor[e.type]}`}>{e.type}</span>
              <span className="text-[0.75rem] text-ivory/45">{e.date}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-ivory">{e.title}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-[0.8rem] text-ivory/55"><I n="map" s={14} />{e.where}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{e.tags.map((t) => <span key={t} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.68rem] text-ivory/60">{t}</span>)}</div>
            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
              <span className="text-[0.75rem] text-ivory/50">{e.spotsNote}</span>
              <Btn variant="soft">Register</Btn>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold"><I n="lock" s={15} /> Draft &amp; moderation</p>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-ivory/60">Events move through draft → pending review → published. Draft items (e.g. &ldquo;Teacher roundtable&rdquo;) never appear on public pages. Each event, profile and post can be reported and moderated.</p>
        </Card>
        <Card className="border-emerald-400/20 bg-emerald-400/[0.03] p-5">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-emerald-300"><I n="shield" s={15} /> Safeguarding by default</p>
          <ul className="mt-2 space-y-1.5 text-[0.84rem] text-ivory/65">
            {["Minors' personal info is restricted", "No unrestricted adult-to-minor messaging", "Consent before any student media is shown", "Guardian controls where appropriate"].map((x) => (
              <li key={x} className="flex items-start gap-2"><I n="check" s={14} c="mt-0.5 shrink-0 text-emerald-400" />{x}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 7 — PRICING                                                             */
/* =========================================================================== */
function PricingView() {
  const groups: Plan["audience"][] = ["Teachers", "Parents", "Musicians"];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Head eyebrow="Plans" title="Subscriptions across the ecosystem." sub="Proposed launch prices in INR — not validated willingness-to-pay or guaranteed revenue." />
        <DemoTag>Test-mode billing</DemoTag>
      </div>

      {groups.map((g) => (
        <div key={g}>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">{g}</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {PLANS.filter((p) => p.audience === g).map((p) => (
              <Card key={p.name} className={`flex flex-col p-5 ${p.highlight ? "border-gold/40 bg-gold/[0.04]" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold text-ivory">{p.name}</p>
                  {p.highlight && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-gold-soft">Popular</span>}
                </div>
                <p className="mt-2"><span className="font-display text-3xl font-semibold text-ivory">{inr(p.price)}</span><span className="text-sm text-ivory/50">{p.unit}</span></p>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ivory/55">{p.pitch}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {p.features.map((x) => <li key={x} className="flex items-start gap-2 text-[0.84rem] text-ivory/70"><I n="check" s={14} c="mt-0.5 shrink-0 text-gold-soft" />{x}</li>)}
                </ul>
                <div className="mt-5"><Btn variant={p.highlight ? "primary" : "soft"}>Start test checkout</Btn></div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card className="border-sky-400/20 bg-sky-400/[0.03] p-5">
        <p className="text-[0.82rem] leading-relaxed text-ivory/65">
          <span className="font-semibold text-ivory">Revenue is kept separate by type:</span> subscription revenue (teachers, parents, musicians), future booking commission, and booking gross value are never mixed. Entitlements are granted by a trusted payment event — never by a frontend flag. Multi-teacher &ldquo;Studio&rdquo; tools are shown as a direction, not advertised as fully working.
        </p>
      </Card>
    </div>
  );
}

/* =========================================================================== */
/*  VIEW 8 — OWNER ANALYTICS                                                     */
/* =========================================================================== */
function OwnerView() {
  const m = OWNER_METRICS;
  const max = Math.max(...m.activity);
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Head eyebrow="Owner & admin" title="The platform at a glance." />
        <DemoTag>Synthetic demo data — not real metrics</DemoTag>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active subscriptions" value={m.subscriptions.active} note={`${m.subscriptions.trial} trial · ${m.subscriptions.pastDue} past due`} />
        <Stat label="Booking enquiries" value={m.enquiries} note={`${m.bookingsConfirmed} confirmed`} />
        <Stat label="Event registrations" value={m.eventRegistrations} note="across sample events" />
        <Stat label="Moderation queue" value={m.moderationOpen} note="items awaiting review" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Accounts by role</p>
          <div className="mt-4 space-y-3">
            {m.accountsByRole.map((a) => {
              const mx = Math.max(...m.accountsByRole.map((x) => x.n));
              return (
                <div key={a.role}>
                  <div className="flex items-center justify-between text-[0.8rem] text-ivory/70"><span>{a.role}</span><span className="text-ivory/50">{a.n}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold" style={{ width: `${(a.n / mx) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ivory/45">Lessons logged · last 8 weeks</p>
          <div className="mt-4 flex items-end gap-2">
            {m.activity.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[0.6rem] tabular-nums text-ivory/40">{v}</span>
                <div className="w-full rounded-t bg-gradient-to-t from-gold/40 to-gold-soft/80" style={{ height: Math.round((v / max) * 104) }} />
                <span className="text-[0.6rem] text-ivory/35">W{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.7rem] text-ivory/40">Illustrative trend only.</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Profiles verified" value={m.profiles.verified} />
        <Stat label="Pending review" value={m.profiles.pending} />
        <Stat label="Unverified" value={m.profiles.unverified} />
      </div>

      <Card className="border-sky-400/20 bg-sky-400/[0.03] p-4">
        <p className="text-[0.82rem] leading-relaxed text-ivory/65">In the live dashboard these panels separate <span className="text-ivory/85">actual data</span>, <span className="text-ivory/85">test-mode</span> and <span className="text-ivory/85">synthetic demo</span> sources. Test transactions never show as real revenue, and synthetic demo users are never mixed into real counts.</p>
      </Card>
    </div>
  );
}

/* =========================================================================== */
/*  SHELL                                                                        */
/* =========================================================================== */
type Chapter = { key: string; label: string; icon: string; persona: Persona["key"]; render: () => JSX.Element };

const CHAPTERS: Chapter[] = [
  { key: "overview", label: "Ecosystem", icon: "overview", persona: "public", render: () => <OverviewView /> },
  { key: "teacher", label: "Teacher", icon: "teacher", persona: "teacher", render: () => <TeacherView /> },
  { key: "parent", label: "Parent", icon: "parent", persona: "parent", render: () => <ParentView /> },
  { key: "ai", label: "AI assessment", icon: "ai", persona: "teacher", render: () => <AiView /> },
  { key: "musicians", label: "Musicians", icon: "musician", persona: "public", render: () => <MusiciansView /> },
  { key: "community", label: "Community", icon: "community", persona: "public", render: () => <CommunityView /> },
  { key: "pricing", label: "Pricing", icon: "pricing", persona: "public", render: () => <PricingView /> },
  { key: "owner", label: "Owner", icon: "owner", persona: "owner", render: () => <OwnerView /> },
];

export function Prototype1() {
  const [active, setActive] = useState("overview");
  const chapter = CHAPTERS.find((c) => c.key === active) ?? CHAPTERS[0];
  const persona = PERSONAS[chapter.persona];
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => { mainRef.current?.scrollTo({ top: 0, behavior: "auto" }); }, [active]);

  return (
    <div className="flex h-[100svh] flex-col bg-charcoal-2 font-body text-ivory">
      {/* top bar */}
      <header className="z-20 shrink-0 border-b border-white/10 bg-charcoal/80 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-gold/30 bg-gold/[0.08] font-display text-sm font-bold text-gold-soft">M</span>
            <span className="hidden font-display text-base font-semibold sm:block">Musicphonetics</span>
          </Link>
          <span className="rounded-full border border-gold/40 bg-gold/[0.08] px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gold-soft">Prototype 1</span>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 sm:flex">
              <Avatar initials={persona.initials || "·"} size={28} ring={false} />
              <div className="leading-tight">
                <p className="text-[0.72rem] font-semibold text-ivory">{persona.who}</p>
                <p className="text-[0.6rem] text-ivory/45">Viewing as {persona.label}</p>
              </div>
            </div>
            <DemoTag>Demo · synthetic data</DemoTag>
          </div>
        </div>

        {/* mobile chapter tabs */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {CHAPTERS.map((c) => (
            <button key={c.key} onClick={() => setActive(c.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition ${active === c.key ? "bg-gold text-charcoal" : "bg-white/[0.05] text-ivory/70"}`}>
              <I n={c.icon} s={15} />{c.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* sidebar */}
        <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-white/10 bg-charcoal/40 p-3 lg:flex">
          {CHAPTERS.map((c, i) => (
            <button key={c.key} onClick={() => setActive(c.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active === c.key ? "bg-gold/[0.12] text-ivory ring-1 ring-gold/25" : "text-ivory/60 hover:bg-white/[0.04] hover:text-ivory"}`}>
              <span className={`grid h-7 w-7 place-items-center rounded-lg ${active === c.key ? "bg-gold/15 text-gold-soft" : "bg-white/[0.04] text-ivory/50"}`}><I n={c.icon} s={16} /></span>
              <span>{c.label}</span>
              <span className="ml-auto text-[0.62rem] tabular-nums text-ivory/30">{i + 1}</span>
            </button>
          ))}
          <div className="mt-auto rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ivory/45">Demonstration</p>
            <p className="mt-1 text-[0.72rem] leading-relaxed text-ivory/50">Synthetic data only. No production records, payments or emails are touched.</p>
            <Link href="/" className="mt-2 inline-flex items-center gap-1 text-[0.72rem] font-medium text-gold-soft hover:text-gold">Back to live site <I n="arrow" s={12} /></Link>
          </div>
        </nav>

        {/* content */}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-7 sm:px-8 sm:py-9">
            {chapter.render()}
            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[0.72rem] text-ivory/40">
              <span>Musicphonetics — Prototype 1 · ecosystem demonstration</span>
              <span>Honest by design: real · prototype · planned are labelled throughout.</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
