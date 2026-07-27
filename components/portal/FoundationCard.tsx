// Reusable, data-driven Foundation progress card (EXPLORE / PLAY / MAKE MUSIC /
// PERFORM — 4 stages × 8 = 32 classes). Progress is DERIVED from completed
// countable classes; the learning content (now learning / songs / milestone) is
// teacher-entered, per student and therefore per instrument. Works for parent
// (motivating) and teacher (operational) views. Supports future grades via the
// `grade` prop. Purely presentational — pass it computed data.
import { type FoundationProgress } from "@/lib/foundation";
import { cn } from "@/lib/utils";

const INSTRUMENT_EMOJI: Record<string, string> = {
  keyboard: "🎹", piano: "🎹", guitar: "🎸", ukulele: "🎸", bass: "🎸",
  violin: "🎻", vocals: "🎤", voice: "🎤", singing: "🎤", drums: "🥁",
};
function emojiFor(instrument?: string | null): string {
  const k = (instrument || "").toLowerCase().trim();
  for (const key of Object.keys(INSTRUMENT_EMOJI)) if (k.includes(key)) return INSTRUMENT_EMOJI[key];
  return "🎵";
}

export function FoundationCard({
  instrument, foundation, currentTopic, songs = [], nextMilestone, grade = 1, maxSongs = 6,
}: {
  instrument?: string | null;
  foundation: FoundationProgress;
  currentTopic?: string | null;
  songs?: string[];
  nextMilestone?: string | null;
  grade?: number;
  maxSongs?: number;
}) {
  const emoji = emojiFor(instrument);
  const shownSongs = songs.slice(0, maxSongs);
  const moreSongs = Math.max(0, songs.length - shownSongs.length);
  const nowLearning = (currentTopic || "").trim() || foundation.currentChapter.parent;
  const milestone = (nextMilestone || "").trim() || (foundation.status === "Foundation Complete" ? "Ready for the Main Pathway" : foundation.nextMilestone);

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
      {/* Header */}
      <div className="border-b border-hairline bg-gradient-to-br from-gold/[0.08] to-transparent p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A5E0F]">
          {(instrument || "Music").toUpperCase()} • FOUNDATION
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold text-ink">Grade {grade} — My First Music Journey {emoji}</h3>

        <div className="mt-4 flex items-end justify-between">
          <p className="font-display text-2xl font-semibold text-ink">
            {foundation.effectiveClasses} <span className="text-base font-normal text-ink/55">of {foundation.totalClasses} classes</span>
          </p>
          <p className="font-display text-2xl font-semibold text-[#7A5E0F]">{foundation.progressPercent}%</p>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-mist">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-deep-gold transition-all" style={{ width: `${foundation.progressPercent}%` }} />
        </div>
      </div>

      {/* Stages */}
      <div className="divide-y divide-hairline">
        {foundation.chapters.map(({ chapter, state, completed }) => (
          <div key={chapter.number} className="flex items-center gap-3 px-5 py-3">
            <StageIcon state={state} />
            <span className={cn("flex-1 text-sm font-semibold uppercase tracking-wide",
              state === "upcoming" ? "text-ink/35" : "text-ink")}>
              {chapter.number}. {chapter.name}
            </span>
            <span className={cn("font-mono text-sm tabular-nums",
              state === "completed" ? "text-feature-green" : state === "in_progress" ? "text-[#7A5E0F]" : "text-ink/35")}>
              {completed}/8
            </span>
          </div>
        ))}
      </div>

      {/* Learning content */}
      <div className="space-y-4 p-5">
        <Block label="Now learning" icon="🎵">
          <p className="text-sm text-ink">{nowLearning}</p>
        </Block>

        <Block label="Songs learned" icon="⭐">
          {shownSongs.length === 0 ? (
            <p className="text-sm text-ink/50">The first songs will appear here soon.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {shownSongs.map((s, i) => (
                <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-sm text-ink">
                  <span className="text-[#7A5E0F]">⭐</span>{s}
                </li>
              ))}
              {moreSongs > 0 && <li className="inline-flex items-center rounded-full bg-ink/[0.05] px-3 py-1 text-sm text-ink/60">+{moreSongs} more</li>}
            </ul>
          )}
        </Block>

        {milestone && (
          <Block label="Next milestone" icon="🎯">
            <p className="text-sm text-ink">{milestone}</p>
          </Block>
        )}
      </div>
    </div>
  );
}

function Block({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">{icon} {label}</p>
      {children}
    </div>
  );
}

function StageIcon({ state }: { state: "completed" | "in_progress" | "upcoming" }) {
  if (state === "completed") {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-feature-green/15 text-feature-green">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
      </span>
    );
  }
  if (state === "in_progress") {
    return <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/20 text-[#7A5E0F]"><span className="h-2 w-2 rounded-full bg-current" /></span>;
  }
  return <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-hairline text-ink/30"><span className="h-2 w-2 rounded-full border border-current" /></span>;
}
