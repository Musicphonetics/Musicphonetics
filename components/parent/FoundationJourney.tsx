"use client";

import { FOUNDATION, upgradeMessage, type FoundationProgress } from "@/lib/foundation";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

// The Foundation Journey - a motivating, parent-facing view of the 32-class
// beginner pathway. Never a spreadsheet; a journey.
export function FoundationJourney({ p, studentName, compact }: {
  p: FoundationProgress; studentName: string; compact?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gold/40 bg-white">
      <div className="bg-gradient-to-br from-ink to-[#10141d] p-5 text-paper">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">{FOUNDATION.name}</p>
        <p className="mt-0.5 text-xs text-paper/60">{FOUNDATION.subtitle}</p>

        {/* Progress bar */}
        <div className="mt-4 flex items-baseline justify-between">
          <p className="font-display text-2xl font-semibold">
            {p.effectiveClasses}<span className="text-base font-normal text-paper/60"> / {p.totalClasses} classes</span>
          </p>
          <p className="text-sm font-semibold text-gold">{p.progressPercent}%</p>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/12">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-deep-gold transition-all" style={{ width: `${p.progressPercent}%` }} />
        </div>

        {/* Chapter markers */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {p.chapters.map(({ chapter, state }) => (
            <div key={chapter.number} className="text-center">
              <div className={cn("mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-bold",
                state === "completed" ? "bg-gold text-ink" : state === "in_progress" ? "bg-white/15 text-gold ring-2 ring-gold" : "bg-white/[0.06] text-paper/40")}>
                {state === "completed" ? "✓" : chapter.number}
              </div>
              <p className={cn("mt-1.5 text-[10px] leading-tight", state === "upcoming" ? "text-paper/40" : "text-paper/80")}>{chapter.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Current focus */}
      <div className="p-5">
        {p.readyForUpgrade ? (
          <div className="rounded-xl border border-gold/50 bg-gold/[0.08] p-4">
            <p className="font-display text-base font-semibold text-ink">🎉 Next Level Unlocked</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/75">
              {studentName ? `${studentName.split(" ")[0]} has` : "Your child has"} completed the Foundation Journey and is ready for the
              <b> Main Musicphonetics Pathway</b> - stronger progress, theory, confidence and performance preparation.
            </p>
            <a href={whatsappLink(upgradeMessage(studentName))} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-[#0f131c]">
              Talk to Abhishek about the next step
            </a>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">Current chapter</p>
            <p className="mt-0.5 font-display text-lg font-semibold text-ink">
              Chapter {p.currentChapter.number} · {p.currentChapter.name}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{p.workingOn}</p>
            <p className="mt-3 text-sm text-ink/60">Next milestone: <b className="text-[#7A5E0F]">{p.nextMilestone}</b></p>
          </>
        )}

        {!compact && !p.readyForUpgrade && (
          <div className="mt-5 space-y-2 border-t border-hairline pt-4">
            {p.chapters.map(({ chapter, state }) => (
              <div key={chapter.number} className="flex items-start gap-3">
                <span className={cn("mt-0.5 text-sm", state === "completed" ? "text-gold" : state === "in_progress" ? "text-[#7A5E0F]" : "text-ink/30")}>
                  {state === "completed" ? "✅" : state === "in_progress" ? "🔄" : "⬜"}
                </span>
                <div>
                  <p className={cn("text-sm font-semibold", state === "upcoming" ? "text-ink/45" : "text-ink")}>
                    Chapter {chapter.number}: {chapter.name}
                  </p>
                  <p className={cn("text-xs leading-relaxed", state === "upcoming" ? "text-ink/35" : "text-ink/65")}>{chapter.parent}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
