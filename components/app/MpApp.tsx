"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HERO_STATS, ROLES, BROADCASTS, MUSICIANS, TEACHERS, TESTIMONIALS, inr,
  type Role, type Musician, type Teacher, type Broadcast,
} from "./content";
import { useStore, computeStats, todayYMD } from "./store";

// ============================================================================
// Musicphonetics app — the full experience: a scrollable introduction, a
// community feed (owner broadcasts reach everyone), musician portfolios wired
// to their social presence, a teacher directory, and a fast practice timer.
// Standalone; imports nothing from the rest of the project.
// ============================================================================

const GOLD = "#C9A227", DEEP = "#A8851B", INK = "#161B26", CREAM = "#F6F0E4";

/* --------------------------------------------------------------------- icons */
const IP: Record<string, string> = {
  arrow: "M5 12h14M13 6l6 6-6 6", back: "M15 6l-6 6 6 6", chev: "M9 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 6.5", star: "M12 3l2.6 5.5L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.8z",
  map: "M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11zm0-8a3 3 0 100-6 3 3 0 000 6z",
  users: "M9 11a3 3 0 100-6 3 3 0 000 6zm7 0a3 3 0 100-6M3 20a6 6 0 0112 0m2 0a6 6 0 00-3-5.2",
  flame: "M12 3c0 3-4 4-4 8a4 4 0 008 0c0-1.5-1-2.5-1-4 2 1 3 3 3 5a6 6 0 11-12 0c0-5 6-6 6-9z",
  community: "M7 8h10M7 12h6M4 4h16v12H8l-4 4z", compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15 9l-2 4-4 2 2-4z",
  note: "M9 18V5l10-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0", plus: "M12 5v14M5 12h14",
  share: "M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13", megaphone: "M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1zM15 8a4 4 0 010 8M18 5a8 8 0 010 14",
  close: "M6 6l12 12M18 6L6 18", play: "M8 5v14l11-7z", pause: "M8 5v14M16 5v14", timer: "M12 8v5l3 2M12 22a9 9 0 100-18 9 9 0 000 18zM9 2h6",
  verified: "M12 2l2.4 1.8 3 .2.9 2.9 2.4 1.9-1 2.9 1 2.9-2.4 1.9-.9 2.9-3 .2L12 22l-2.4-1.8-3-.2-.9-2.9L3.3 15.2l1-2.9-1-2.9 2.4-1.9.9-2.9 3-.2z",
  bolt: "M13 3L4 14h6l-1 7 9-11h-6z", calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z",
  heart: "M12 20s-7-4.2-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.8-7 9-7 9z", link: "M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1",
};
function Ic({ n, s = 20, c = "" }: { n: string; s?: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden className={c}><path d={IP[n]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Brand({ n, s = 16 }: { n: "instagram" | "youtube" | "spotify"; s?: number }) {
  if (n === "instagram") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" /><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" /></svg>;
  if (n === "youtube") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.7" /><path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor" /></svg>;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.7" /><path d="M7 10.2c3.2-1 7-0.6 10 1.4M7.6 13.4c2.6-0.7 5.6-0.3 8 1.1M8.2 16.3c2-0.5 4.2-0.2 6 0.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

/* --------------------------------------------------------------- UI atoms */
function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <div onClick={onClick} className={`rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(22,27,38,.04),0_10px_28px_rgba(22,27,38,.06)] ${className}`}>{children}</div>;
}
function Gold({ children, onClick, full, sm }: { children: React.ReactNode; onClick?: () => void; full?: boolean; sm?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white transition active:scale-[0.98] ${sm ? "px-4 py-2 text-[0.82rem]" : "px-6 py-3.5 text-[0.95rem]"} ${full ? "w-full" : ""}`} style={{ background: GOLD }}>{children}</button>;
}
function Dark({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[0.95rem] font-semibold text-cream transition active:scale-[0.98] ${full ? "w-full" : ""}`}>{children}</button>;
}
function Ghost({ children, onClick, full, sm, dark }: { children: React.ReactNode; onClick?: () => void; full?: boolean; sm?: boolean; dark?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition active:scale-[0.98] ${dark ? "border-white/25 text-white" : "border-black/15 text-ink/80"} ${sm ? "px-4 py-2 text-[0.82rem]" : "px-5 py-3 text-[0.9rem]"} ${full ? "w-full" : ""}`}>{children}</button>;
}
function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  return <span className="grid shrink-0 place-items-center rounded-full font-display font-semibold" style={{ width: size, height: size, fontSize: size * 0.36, background: "rgba(201,162,39,.16)", color: DEEP, boxShadow: "inset 0 0 0 1px rgba(201,162,39,.35)" }}>{initials}</span>;
}
function Verified({ s = 16 }: { s?: number }) { return <span className="relative inline-grid place-items-center" style={{ color: GOLD, width: s, height: s }}><Ic n="verified" s={s} /><span className="absolute text-white" style={{ fontSize: s * 0.42, marginTop: -1 }}>✓</span></span>; }
function Label({ children }: { children: React.ReactNode }) { return <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] text-ink/45">{children}</p>; }
function Pill({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[0.7rem] font-medium text-ink/65">{children}</span>; }

function share(title: string) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  try {
    if (navigator.share) { navigator.share({ title, url }).catch(() => {}); return; }
    navigator.clipboard?.writeText(`${title} — ${url}`);
  } catch { /* ignore */ }
}

/* =========================================================================== */
/*  WELCOME — the scrollable introduction                                       */
/* =========================================================================== */
function Welcome({ onEnter }: { onEnter: (tab?: string) => void }) {
  return (
    <div className="h-full overflow-y-auto bg-cream">
      {/* hero */}
      <section className="relative flex min-h-[86%] flex-col justify-end overflow-hidden text-white">
        <img src="/images/hero/slide-3.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 26%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#0B0F18 8%,rgba(11,15,24,.35) 55%,rgba(11,15,24,.6))" }} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-6">
          <span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg text-xs font-bold text-ink" style={{ background: GOLD }}>M</span><span className="font-display text-sm font-semibold">Musicphonetics</span></span>
          <button onClick={() => onEnter()} className="rounded-full border border-white/30 px-3.5 py-1.5 text-[0.76rem] font-semibold">Enter</button>
        </div>
        <div className="relative z-10 px-6 pb-8">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold-soft">The home of music, for everyone in it</p>
          <h1 className="mt-2 font-display text-[2.6rem] font-medium leading-[1.02]">Where music<br />lives.</h1>
          <p className="mt-3 max-w-[20rem] text-[1rem] leading-relaxed text-white/80">Learn, teach, perform and belong. One app connecting students, parents, teachers and musicians — worldwide.</p>
          <div className="mt-5 flex gap-2.5">
            <Gold onClick={() => onEnter()}>Open the app <Ic n="arrow" s={16} /></Gold>
            <Ghost dark onClick={() => { const el = document.getElementById("w-how"); el?.scrollIntoView({ behavior: "smooth" }); }}>How it works</Ghost>
          </div>
        </div>
      </section>

      {/* social proof */}
      <section className="bg-ink px-6 py-8 text-cream">
        <p className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold-soft">A real, growing community</p>
        <div className="mt-4 grid grid-cols-3 gap-y-5">
          {HERO_STATS.slice(0, 3).map((s) => (<div key={s.l} className="text-center"><p className="font-display text-2xl font-semibold">{s.n}</p><p className="mt-0.5 text-[0.66rem] leading-tight text-cream/55">{s.l}</p></div>))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-y-5">
          {HERO_STATS.slice(3).map((s) => (<div key={s.l} className="text-center"><p className="font-display text-2xl font-semibold">{s.n}</p><p className="mt-0.5 text-[0.66rem] leading-tight text-cream/55">{s.l}</p></div>))}
        </div>
        <p className="mt-6 text-center text-[0.82rem] leading-relaxed text-cream/60">You&rsquo;re never practising alone. Thousands of learners, teachers and performers are on Musicphonetics right now.</p>
      </section>

      {/* role sections */}
      <section id="w-how" className="space-y-px bg-black/[0.04]">
        {ROLES.map((r, i) => <RoleBlock key={r.key} r={r} flip={i % 2 === 1} onEnter={onEnter} />)}
      </section>

      {/* portfolio spotlight */}
      <section className="bg-ink px-6 py-10 text-cream">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold-soft">Your profile is your portfolio</p>
        <h2 className="mt-2 font-display text-[1.9rem] font-medium leading-tight">One link. Your whole sound.</h2>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-cream/65">Send one Musicphonetics link instead of explaining who you are. It pulls your Instagram, YouTube and Spotify into a single, beautiful portfolio.</p>
        <div className="mt-5"><MiniPortfolio m={MUSICIANS[0]} /></div>
        <div className="mt-4"><Gold full onClick={() => onEnter("discover")}>Browse musicians <Ic n="arrow" s={16} /></Gold></div>
      </section>

      {/* community spotlight */}
      <section className="px-6 py-10">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em]" style={{ color: DEEP }}>One community</p>
        <h2 className="mt-2 font-display text-[1.9rem] font-medium leading-tight text-ink">Events that reach everyone.</h2>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/60">Competitions, open mics and workshops are broadcast to every member — so opportunities actually find you.</p>
        <div className="mt-5"><BroadcastCard b={BROADCASTS[0]} onOpen={() => onEnter("community")} /></div>
      </section>

      {/* testimonials */}
      <section className="bg-black/[0.03] px-6 py-10">
        <p className="text-center text-[0.7rem] font-bold uppercase tracking-[0.18em]" style={{ color: DEEP }}>You&rsquo;re in good company</p>
        <div className="mt-5 space-y-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.who} className="p-4"><p className="text-[0.92rem] leading-relaxed text-ink/80">&ldquo;{t.quote}&rdquo;</p><p className="mt-2 text-[0.76rem] font-medium text-ink/50">{t.who} · {t.role}</p></Card>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="px-6 py-10">
        <h2 className="font-display text-[1.7rem] font-medium leading-tight text-ink">Up and running in a minute.</h2>
        <div className="mt-5 space-y-3">
          {[["Open the app", "No long sign-up. Explore the community and profiles instantly."], ["Pick how you fit in", "Student, parent, teacher or musician — your home adapts to you."], ["Do the thing", "Practise, post a lesson, share your portfolio, join an event."]].map(([t, b], i) => (
            <div key={t} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display font-semibold text-white" style={{ background: GOLD }}>{i + 1}</span>
              <div><p className="font-display text-[1.05rem] font-semibold text-ink">{t}</p><p className="text-[0.85rem] leading-relaxed text-ink/55">{b}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="relative overflow-hidden px-6 py-12 text-center text-white">
        <img src="/images/moments/openmic-audience.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#0B0F18,rgba(11,15,24,.6))" }} />
        <div className="relative">
          <h2 className="font-display text-[2rem] font-medium leading-tight">Your place in music<br />is waiting.</h2>
          <div className="mt-5 flex flex-col items-center gap-2">
            <Gold onClick={() => onEnter()}>Open Musicphonetics <Ic n="arrow" s={16} /></Gold>
            <p className="text-[0.72rem] text-white/55">Add to home screen to use it like an app</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoleBlock({ r, flip, onEnter }: { r: Role; flip: boolean; onEnter: (t?: string) => void }) {
  return (
    <div className="bg-cream">
      <div className="relative h-52 overflow-hidden">
        <img src={r.img} alt="" className="h-full w-full object-cover" style={{ objectPosition: r.pos }} />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
        <span className="absolute left-5 top-4 rounded-full bg-black/55 px-3 py-1 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">{r.tag}</span>
      </div>
      <div className="px-6 pb-9 pt-3">
        <h3 className="font-display text-[1.55rem] font-medium leading-tight text-ink">{r.title}</h3>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/60">{r.body}</p>
        <ul className="mt-3 grid gap-1.5">
          {r.points.map((p) => <li key={p} className="flex items-start gap-2 text-[0.86rem] text-ink/75"><Ic n="check" s={15} c="mt-0.5 shrink-0" />{p}</li>)}
        </ul>
        <button onClick={() => onEnter(r.key === "musician" ? "discover" : r.key === "teacher" ? "discover" : "community")} className="mt-4 inline-flex items-center gap-1.5 text-[0.84rem] font-semibold" style={{ color: DEEP }}>
          {flip ? "Explore" : "See more"} <Ic n="arrow" s={14} />
        </button>
      </div>
    </div>
  );
}

/* ---- a compact portfolio card (social stats) ---- */
function MiniPortfolio({ m }: { m: Musician }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
      <div className="relative h-24"><img src={m.cover} alt="" className="h-full w-full object-cover opacity-80" style={{ objectPosition: m.pos }} /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /></div>
      <div className="px-4 pb-4 -mt-6">
        <div className="flex items-end gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full font-display font-semibold text-ink ring-2 ring-white/20" style={{ background: "#E7C86A" }}>{m.initials}</span>
          <div className="pb-1 flex items-center gap-1.5"><p className="font-display text-base font-semibold">{m.name}</p>{m.verified && <Verified s={15} />}</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {m.instagram && <SocialStat icon="instagram" top={m.instagram.followers!} label="followers" />}
          {m.youtube && <SocialStat icon="youtube" top={m.youtube.subs!} label="subscribers" />}
          {m.spotify && <SocialStat icon="spotify" top={m.spotify.monthly!} label="monthly" />}
        </div>
      </div>
    </div>
  );
}
function SocialStat({ icon, top, label }: { icon: "instagram" | "youtube" | "spotify"; top: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/[0.06] py-2.5">
      <span className="mx-auto mb-1 flex justify-center text-gold-soft"><Brand n={icon} s={16} /></span>
      <p className="font-display text-sm font-semibold text-white">{top}</p>
      <p className="text-[0.58rem] text-white/50">{label}</p>
    </div>
  );
}

/* ---- community broadcast card ---- */
function BroadcastCard({ b, onOpen }: { b: Broadcast; onOpen?: () => void }) {
  const tone: Record<Broadcast["kind"], string> = { Competition: DEEP, "Open Mic": "#2C4636", Announcement: "#161B26", Workshop: "#7A5E0F" };
  return (
    <Card className="overflow-hidden" onClick={onOpen}>
      <div className="relative h-32"><img src={b.img} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
          <span className="rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white" style={{ background: tone[b.kind] }}>{b.kind}</span>
          {b.pinned && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-white backdrop-blur">📌 Pinned</span>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-[1.1rem] font-semibold leading-tight text-ink">{b.title}</h3>
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink/60">{b.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-ink/55">
          <span className="inline-flex items-center gap-1.5"><Ic n="map" s={14} />{b.place}</span>
          <span className="inline-flex items-center gap-1.5"><Ic n="calendar" s={14} />{b.date}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium" style={{ color: DEEP }}><Ic n="megaphone" s={14} />{b.reach}</span>
          <Gold sm>Register</Gold>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================== */
/*  COMMUNITY TAB                                                                */
/* =========================================================================== */
function Community() {
  return (
    <div className="space-y-5">
      {/* presence strip */}
      <Card className="flex items-center gap-3 p-3.5">
        <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
        <p className="text-[0.84rem] text-ink/70"><span className="font-semibold text-ink">214 members</span> active today · <span className="font-semibold text-ink">42 cities</span></p>
      </Card>

      <div className="flex items-center justify-between">
        <Label>From Musicphonetics</Label>
        <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[0.62rem] font-semibold text-ink/50"><Ic n="megaphone" s={12} /> Official broadcasts only</span>
      </div>
      {BROADCASTS.map((b) => <BroadcastCard key={b.id} b={b} />)}

      <p className="px-1 pt-1 text-center text-[0.72rem] leading-relaxed text-ink/40">Only Musicphonetics posts to the community, so the feed stays signal, not noise. Everyone — students, parents, teachers and musicians — sees the same opportunities.</p>
    </div>
  );
}

/* =========================================================================== */
/*  DISCOVER TAB (musicians + teachers)                                         */
/* =========================================================================== */
function Discover({ onMusician, onTeacher }: { onMusician: (m: Musician) => void; onTeacher: (t: Teacher) => void }) {
  const [seg, setSeg] = useState<"musicians" | "teachers">("musicians");
  return (
    <div className="space-y-4">
      <div className="flex rounded-full border border-black/10 bg-white p-1">
        {(["musicians", "teachers"] as const).map((s) => (
          <button key={s} onClick={() => setSeg(s)} className="flex-1 rounded-full py-2 text-[0.85rem] font-semibold capitalize transition" style={{ background: seg === s ? GOLD : "transparent", color: seg === s ? "white" : "#8A8578" }}>{s}</button>
        ))}
      </div>

      {seg === "musicians" ? (
        <div className="grid grid-cols-2 gap-3">
          {MUSICIANS.map((m) => (
            <button key={m.slug} onClick={() => onMusician(m)} className="text-left">
              <Card className="h-full overflow-hidden transition active:scale-[0.98]">
                <div className="relative h-24"><img src={m.cover} alt="" className="h-full w-full object-cover" style={{ objectPosition: m.pos }} /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {m.verified && <span className="absolute right-2 top-2"><Verified s={16} /></span>}
                </div>
                <div className="p-3 -mt-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-semibold text-ink ring-2 ring-white" style={{ background: "#E7C86A" }}>{m.initials}</span>
                  <p className="mt-1.5 truncate font-display text-[0.95rem] font-semibold text-ink">{m.name}</p>
                  <p className="truncate text-[0.72rem] text-ink/50">{m.location}</p>
                  {m.instagram && <p className="mt-1.5 inline-flex items-center gap-1 text-[0.72rem] font-medium" style={{ color: DEEP }}><Brand n="instagram" s={13} /> {m.instagram.followers}</p>}
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {TEACHERS.map((t) => (
            <button key={t.slug} onClick={() => onTeacher(t)} className="w-full text-left">
              <Card className="flex items-center gap-3 p-3.5 transition active:scale-[0.99]">
                <Avatar initials={t.initials} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><p className="truncate font-display text-[0.95rem] font-semibold text-ink">{t.name}</p>{t.verified && <Verified s={14} />}</div>
                  <p className="truncate text-[0.75rem] text-ink/50">{t.subjects.join(" · ")} · {t.location}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[0.72rem] font-medium" style={{ color: DEEP }}><Ic n="users" s={12} /> {t.students} students</p>
                </div>
                <Ic n="chev" s={16} c="text-ink/25" />
              </Card>
            </button>
          ))}
          <p className="px-1 pt-1 text-[0.72rem] text-ink/40">Teachers can see one another at a glance — enough to feel the community, never private student details.</p>
        </div>
      )}
    </div>
  );
}

/* ---- musician portfolio (detail) ---- */
function MusicianProfile({ m, onBack }: { m: Musician; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-cream">
      <div className="relative h-44">
        <img src={m.cover} alt="" className="h-full w-full object-cover" style={{ objectPosition: m.pos }} />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/10 to-black/20" />
        <button onClick={onBack} className="absolute left-4 top-5 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur"><Ic n="back" s={18} /></button>
        <button onClick={() => share(`${m.name} on Musicphonetics`)} className="absolute right-4 top-5 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur"><Ic n="share" s={16} /></button>
      </div>
      <div className="px-5 pb-28 -mt-9">
        <div className="flex items-end gap-3">
          <span className="grid h-20 w-20 place-items-center rounded-2xl font-display text-2xl font-semibold text-ink ring-4 ring-cream" style={{ background: "#E7C86A" }}>{m.initials}</span>
          <div className="pb-1"><div className="flex items-center gap-1.5"><h1 className="font-display text-[1.5rem] font-semibold text-ink">{m.name}</h1>{m.verified && <Verified s={18} />}</div><p className="text-[0.82rem] text-ink/55">{m.tagline}</p></div>
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[0.8rem] text-ink/55"><Ic n="map" s={14} />{m.location}</p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-ink/75">{m.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{m.instruments.concat(m.genres).map((g) => <Pill key={g}>{g}</Pill>)}</div>

        {/* the portfolio block — connected socials */}
        <div className="mt-5">
          <div className="flex items-center justify-between"><Label>Connected socials</Label><span className="text-[0.64rem] font-medium text-ink/35">live sync coming soon</span></div>
          <div className="mt-2 space-y-2">
            {m.instagram && <SocialRow icon="instagram" name="Instagram" handle={m.instagram.handle} a={[m.instagram.followers!, "followers"]} b={[m.instagram.posts!, "posts"]} color="#C1358B" />}
            {m.youtube && <SocialRow icon="youtube" name="YouTube" handle={m.youtube.handle} a={[m.youtube.subs!, "subscribers"]} color="#C4302B" />}
            {m.spotify && <SocialRow icon="spotify" name="Spotify" handle={m.spotify.handle} a={[m.spotify.monthly!, "monthly listeners"]} color="#1DB954" />}
          </div>
        </div>

        <div className="mt-5"><Label>A taste</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["/gallery/03-stage-guitar.jpg", "/gallery/08-stage.jpg", "/images/moments/02-openmic.webp"].map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl"><img src={src} alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center"><span className="grid h-8 w-8 place-items-center rounded-full bg-white/85 text-ink"><Ic n="play" s={14} /></span></span></div>
            ))}
          </div>
        </div>
      </div>

      {/* sticky actions */}
      <div className="pointer-events-none sticky bottom-0 flex justify-center px-5 pb-5">
        <div className="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-full border border-black/10 bg-white/95 p-1.5 shadow-[0_14px_40px_-10px_rgba(22,27,38,.4)] backdrop-blur">
          {m.fromFee && <span className="px-3 text-[0.78rem] text-ink/60">from <span className="font-semibold text-ink">{inr(m.fromFee)}</span></span>}
          <Gold full>Send booking enquiry <Ic n="arrow" s={15} /></Gold>
        </div>
      </div>
    </div>
  );
}
function SocialRow({ icon, name, handle, a, b, color }: { icon: "instagram" | "youtube" | "spotify"; name: string; handle: string; a: [string, string]; b?: [string, string]; color: string }) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: color }}><Brand n={icon} s={20} /></span>
      <div className="min-w-0 flex-1"><p className="text-[0.86rem] font-semibold text-ink">{name}</p><p className="truncate text-[0.74rem] text-ink/45">{handle}</p></div>
      <div className="flex gap-4 text-right">
        <div><p className="font-display text-[0.95rem] font-semibold text-ink">{a[0]}</p><p className="text-[0.6rem] text-ink/45">{a[1]}</p></div>
        {b && <div><p className="font-display text-[0.95rem] font-semibold text-ink">{b[0]}</p><p className="text-[0.6rem] text-ink/45">{b[1]}</p></div>}
      </div>
    </Card>
  );
}

/* ---- teacher profile (detail) ---- */
function TeacherProfile({ t, onBack }: { t: Teacher; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-cream">
      <header className="flex items-center gap-3 px-5 pb-3 pt-5"><button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full bg-black/5"><Ic n="back" s={18} /></button><h1 className="font-display text-lg font-semibold text-ink">Teacher</h1></header>
      <div className="px-5 pb-10">
        <div className="flex items-center gap-4"><Avatar initials={t.initials} size={64} /><div><div className="flex items-center gap-1.5"><p className="font-display text-xl font-semibold text-ink">{t.name}</p>{t.verified && <Verified s={16} />}</div><p className="text-[0.82rem] text-ink/55">{t.subjects.join(" · ")} teacher</p></div></div>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[[`${t.students}`, "students"], [`${t.years}y`, "teaching"], [t.mode.split(" ")[0], "mode"]].map(([n, l]) => (<Card key={l} className="p-3 text-center"><p className="font-display text-xl font-semibold text-ink">{n}</p><p className="text-[0.62rem] text-ink/45">{l}</p></Card>))}
        </div>
        <Card className="mt-4 p-4"><Label>Recent activity</Label><p className="mt-1.5 text-[0.88rem] text-ink/70">{t.activity}</p><p className="mt-0.5 text-[0.78rem] text-ink/45">{t.location} · {t.mode}</p></Card>
        <Card className="mt-3 p-4"><Label>How teaching works here</Label><p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink/70">Students connect to their teacher and receive lesson updates, practice and progress — the same model as the Musicphonetics teaching portal, in your pocket.</p></Card>
        <div className="mt-4"><Gold full>Enquire about lessons <Ic n="arrow" s={15} /></Gold></div>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  PRACTICE TAB — fast                                                         */
/* =========================================================================== */
function Practice() {
  const { data, addSession } = useStore();
  const st = useMemo(() => computeStats(data.sessions), [data.sessions]);
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) { tick.current = setInterval(() => setSecs((s) => s + 1), 1000); }
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running]);

  const mins = Math.floor(secs / 60), ss = secs % 60;
  function finish() {
    setRunning(false);
    const m = Math.max(1, Math.round(secs / 60));
    if (secs >= 30) addSession({ date: todayYMD(), minutes: m, focus: "Practice", feel: 3 });
    setSecs(0);
  }
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Label>Tap once. Start playing.</Label>
      <p className="mt-6 font-display text-6xl font-semibold tabular-nums text-ink">{String(mins).padStart(2, "0")}:{String(ss).padStart(2, "0")}</p>
      <p className="mt-1 text-[0.8rem] text-ink/45">{running ? "Keep going — you're practising." : secs > 0 ? "Paused" : "Ready when you are"}</p>
      <div className="mt-8 flex items-center gap-3">
        {secs > 0 && <button onClick={finish} className="grid h-14 w-14 place-items-center rounded-full border border-black/15 text-ink"><Ic n="check" s={24} /></button>}
        <button onClick={() => setRunning((r) => !r)} className="grid h-20 w-20 place-items-center rounded-full text-white shadow-[0_14px_34px_-8px_rgba(201,162,39,.7)]" style={{ background: GOLD }}><Ic n={running ? "pause" : "play"} s={34} /></button>
      </div>
      {secs > 0 && <p className="mt-4 text-[0.74rem] text-ink/40">Finish (✓) saves anything over 30 seconds to your streak.</p>}
      <div className="mt-10 flex gap-6">
        <div className="text-center"><p className="font-display text-2xl font-semibold text-ink">{st.streak}</p><p className="text-[0.66rem] text-ink/45">day streak</p></div>
        <div className="text-center"><p className="font-display text-2xl font-semibold text-ink">{st.weekMinutes}</p><p className="text-[0.66rem] text-ink/45">min this week</p></div>
        <div className="text-center"><p className="font-display text-2xl font-semibold text-ink">{st.totalSessions}</p><p className="text-[0.66rem] text-ink/45">sessions</p></div>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  YOU TAB                                                                     */
/* =========================================================================== */
function You({ onEnter }: { onEnter: (t?: string) => void }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <Label>Who are you here?</Label>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {ROLES.map((r) => (
            <button key={r.key} onClick={() => onEnter(r.key === "musician" || r.key === "teacher" ? "discover" : "community")} className="rounded-xl border border-black/10 p-3 text-left transition active:scale-[0.98]">
              <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "rgba(201,162,39,.14)", color: DEEP }}><Ic n={r.key === "student" ? "note" : r.key === "parent" ? "heart" : r.key === "teacher" ? "users" : "star"} s={17} /></span>
              <p className="mt-2 text-[0.84rem] font-semibold text-ink">{r.tag.replace("For ", "")}</p>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[0.72rem] text-ink/45">Choosing a role tailors your home. You can be more than one — connect accounts later.</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2" style={{ color: DEEP }}><Ic n="megaphone" s={18} /><Label>Community broadcasts</Label></div>
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink/65">Only Musicphonetics (the owner) can broadcast to the whole community — competitions, open mics, announcements. This keeps the feed trustworthy for everyone.</p>
      </Card>

      <button onClick={() => onEnter("welcome")} className="w-full py-2 text-center text-[0.82rem] font-medium" style={{ color: DEEP }}>Replay the intro</button>
      <p className="px-1 text-center text-[0.72rem] leading-relaxed text-ink/40">A new, standalone Musicphonetics experience. Live social sync, shared community and sign-in are the next steps.</p>
    </div>
  );
}

/* =========================================================================== */
/*  ROOT                                                                         */
/* =========================================================================== */
const TABS = [{ k: "community", label: "Community", icon: "community" }, { k: "discover", label: "Discover", icon: "compass" }, { k: "practice", label: "Practice", icon: "note" }, { k: "you", label: "You", icon: "user" }];

export function MpApp() {
  const [phase, setPhase] = useState<"welcome" | "app">("welcome");
  const [tab, setTab] = useState("community");
  const [musician, setMusician] = useState<Musician | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  function enter(t?: string) {
    if (t === "welcome") { setPhase("welcome"); return; }
    setPhase("app");
    if (t) setTab(t);
  }

  const shell = (inner: React.ReactNode, pad = true) => (
    <div className="min-h-[100svh] w-full bg-[#E7E0D1] sm:grid sm:place-items-center sm:p-6">
      <div className="relative mx-auto flex h-[100svh] w-full flex-col overflow-hidden bg-cream sm:h-[min(880px,92svh)] sm:max-w-[440px] sm:rounded-[2rem] sm:border sm:border-black/10 sm:shadow-[0_40px_90px_-30px_rgba(22,27,38,.5)]">
        {inner}
      </div>
    </div>
  );

  if (phase === "welcome") return shell(<Welcome onEnter={enter} />);
  if (musician) return shell(<MusicianProfile m={musician} onBack={() => setMusician(null)} />);
  if (teacher) return shell(<TeacherProfile t={teacher} onBack={() => setTeacher(null)} />);

  const titles: Record<string, string> = { community: "Community", discover: "Discover", practice: "Practice", you: "You" };
  const body =
    tab === "community" ? <Community />
    : tab === "discover" ? <Discover onMusician={setMusician} onTeacher={setTeacher} />
    : tab === "practice" ? <Practice />
    : <You onEnter={enter} />;

  return shell(
    <>
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-6">
        <h1 className="font-display text-[1.5rem] font-semibold text-ink">{titles[tab]}</h1>
        <button onClick={() => setPhase("welcome")} className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-ink" style={{ background: GOLD }}>M</button>
      </header>
      <main className={`min-h-0 flex-1 overflow-y-auto ${tab === "practice" ? "px-5" : "px-5"} pb-24`}>{body}</main>
      <nav className="flex shrink-0 items-stretch justify-around border-t border-black/[0.06] bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2">
        {TABS.map((t) => {
          const on = t.k === tab;
          return <button key={t.k} onClick={() => setTab(t.k)} className="flex flex-1 flex-col items-center gap-1 py-1.5" style={{ color: on ? DEEP : "#9A927F" }}><Ic n={t.icon} s={22} /><span className="text-[0.6rem] font-semibold">{t.label}</span></button>;
        })}
      </nav>
    </>
  );
}
