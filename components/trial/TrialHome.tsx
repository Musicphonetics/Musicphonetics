"use client";

import Link from "next/link";
import { Loading } from "@/components/portal/kit";
import { useTrial, STAGES, currentStep, EXPECT, firstNameOf, type TrialSession } from "./shared";

// The Trial Portal home — a premium, warm assessment dashboard (light theme).
export function TrialHome() {
  const { session: s, loading } = useTrial();
  if (loading) return <Loading />;
  return <TrialHomeView s={s} />;
}

export function TrialHomeView({ s }: { s: TrialSession | null }) {
  const cur = currentStep(s?.stage);
  const first = firstNameOf(s) || "there";
  const levelRaw = (s?.experience_level || "Beginner").replace(/^complete\s+/i, "").replace(/^know a little$/i, "some experience").replace(/^played before$/i, "experienced");
  const level = levelRaw.charAt(0).toUpperCase() + levelRaw.slice(1);
  const stepNo = Math.min(cur + 1, STAGES.length);

  const NEXT: Record<number, { t: string; note: string }> = {
    1: { t: "Build your profile", note: "Takes 2–3 minutes" },
    2: { t: "Book your trial class", note: "Pick a date & time — confirmed instantly" },
    3: { t: "Your trial is confirmed", note: "See what to expect" },
    4: { t: "Share your trial feedback", note: "It unlocks your learning pathway" },
    5: { t: "View your learning pathway", note: "Your personalised plan is ready" },
    6: { t: "You're all set", note: "Start your Musicphonetics journey" },
  };
  const next = NEXT[cur] || NEXT[1];

  return (
    <div className="space-y-5">
      {/* Hero — no photo, warm gradient */}
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#FBF6E9] via-white to-[#F4ECD8] p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-gold/15 blur-2xl" />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A5E0F]">Welcome to Musicphonetics</p>
        <h1 className="relative mt-3 font-display text-3xl font-bold leading-[1.1] text-ink sm:text-4xl">
          {first},<br />welcome to your<br />musical <span className="italic text-[#7A5E0F]">journey.</span>
        </h1>
        <p className="relative mt-4 max-w-md text-sm leading-relaxed text-ink/65 sm:text-base">
          We&rsquo;re excited to guide you from your trial to the right learning pathway.
        </p>
        <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-sm font-semibold text-ink">
          🎵 {s?.instrument || "Guitar"} · {level}
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
            const done = i < cur, current = i === cur;
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
                  {done ? "Done ✓" : current ? "Now" : "Upcoming"}
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
          <div className="font-bold leading-tight text-ink">{next.t}</div>
          <div className="text-xs text-ink/55">{next.note}</div>
        </div>
        <Link href="/trial/journey" className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">Continue →</Link>
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
