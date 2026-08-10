"use client";

import Link from "next/link";
import { Loading } from "@/components/portal/kit";
import { useTrial, STAGES, ORDER, EXPECT, instrumentImage, firstNameOf, type TrialSession } from "./shared";

// The Trial Portal home — a premium, warm assessment dashboard (light theme).
export function TrialHome() {
  const { session: s, loading } = useTrial();
  if (loading) return <Loading />;
  return <TrialHomeView s={s} />;
}

export function TrialHomeView({ s }: { s: TrialSession | null }) {

  const stageIdx = s ? (ORDER[s.stage] ?? 0) : 0;
  const first = firstNameOf(s) || "there";
  const levelRaw = (s?.experience_level || "Beginner").replace(/^complete\s+/i, "").replace(/^know a little$/i, "some experience").replace(/^played before$/i, "experienced");
  const level = levelRaw.charAt(0).toUpperCase() + levelRaw.slice(1);
  const stepNo = Math.min(stageIdx + 1, STAGES.length);

  // What the family should do next.
  const preDone = !!(s?.pre_assessment && Object.keys(s.pre_assessment).length > 0) || stageIdx >= 1;
  const nextStep = !preDone
    ? { t: "Complete your Pre-Assessment", note: "Takes 2–3 minutes", href: "/trial/journey" }
    : stageIdx < 3
      ? { t: "We're arranging your trial", note: "Your teacher is being matched", href: "/trial/journey" }
      : (s?.director_review || s?.recommendation)
        ? { t: "View your recommendation", note: "Your personalised pathway is ready", href: "/trial/journey" }
        : { t: "Your assessment is in progress", note: "We'll update you here", href: "/trial/journey" };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline shadow-card">
        <img src={instrumentImage(s?.instrument)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/20" />
        <div className="relative max-w-[78%] p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold leading-[1.1] text-ink sm:text-4xl">
            {first},<br />welcome to your<br />musical <span className="italic text-[#7A5E0F]">journey.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/65 sm:text-base">
            We&rsquo;re excited to guide you from your trial to the right learning pathway.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-ink">
            🎵 {s?.instrument || "Guitar"} · {level}
          </div>
        </div>
      </div>

      {/* Journey */}
      <div className="rounded-3xl border border-hairline bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink/70">Your trial journey</h2>
          <span className="text-sm font-semibold text-[#7A5E0F]">Step {stepNo} of {STAGES.length}</span>
        </div>
        <ol className="mt-4 space-y-1.5">
          {STAGES.map((st, i) => {
            const done = i < stageIdx, current = i === stageIdx;
            return (
              <li key={st.key} className={"flex items-center gap-3 rounded-2xl px-3 py-3 " + (current ? "bg-gold/10 ring-1 ring-gold/40" : "")}>
                <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold " +
                  (done ? "bg-gold text-ink" : current ? "bg-gold/25 text-[#7A5E0F]" : "bg-ink/[0.05] text-ink/40")}>
                  {done ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={"block text-sm font-bold " + (done || current ? "text-ink" : "text-ink/45")}>{st.label}</span>
                  {(current || done) && <span className="block text-xs text-ink/50">{done ? "Completed" : st.sub}</span>}
                </span>
                <span className={"shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold " +
                  (done ? "text-feature-green" : current ? "bg-gold text-ink" : "text-ink/35")}>
                  {done ? "Done ✓" : current ? "In progress" : "Upcoming"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Next step */}
      <div className="flex items-center gap-4 rounded-3xl border border-hairline bg-white p-5 shadow-card">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/12 text-xl">📋</span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#7A5E0F]">Next step</div>
          <div className="font-bold leading-tight text-ink">{nextStep.t}</div>
          <div className="text-xs text-ink/55">{nextStep.note}</div>
        </div>
        <Link href={nextStep.href} className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
          Continue →
        </Link>
      </div>

      {/* What to expect */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-bold text-ink">What to expect next</h2>
          <Link href="/trial/journey" className="text-sm font-semibold text-[#7A5E0F]">See all</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {EXPECT.map((e) => (
            <div key={e.t} className="rounded-2xl border border-hairline bg-white p-4 text-center shadow-card">
              <div className="text-2xl">{e.icon}</div>
              <div className="mt-2 text-xs font-bold leading-tight text-ink">{e.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
