// Reusable, data-driven Foundation progress card (EXPLORE / PLAY / MAKE MUSIC /
// PERFORM, 4 stages × 8 = 32 classes). Progress is DERIVED from completed
// countable classes; the learning content (now learning / songs / milestone) is
// teacher-entered, per student and therefore per instrument. Works for parent
// (motivating) and teacher (operational) views. Supports future grades via the
// `grade` prop. Purely presentational, pass it computed data.
import { type FoundationProgress, type ChapterState, FOUNDATION } from "@/lib/foundation";
import { cn } from "@/lib/utils";

// What actually happens, class by class, inside each 8-class stage, so parents
// understand the journey rather than just seeing "8 classes". Written for
// families, in plain language, keyed by stage number.
const STAGE_DETAIL: Record<number, { promise: string; classes: string[] }> = {
  1: {
    promise: "Getting comfortable, holding the instrument, making a clean first sound, and building a daily practice habit.",
    classes: [
      "Meet the instrument: posture, hand position and how sound is made",
      "First clean notes and a steady counting pulse",
      "Simple rhythm patterns and clapping/counting together",
      "Building finger strength and accuracy, one step at a time",
      "The first short exercise, played slowly and correctly",
      "Ear warm-ups, hearing high vs low, loud vs soft",
      "Setting up a real practice routine for home",
      "Stage review, a confident, comfortable beginner",
    ],
  },
  2: {
    promise: "Starting to actually play, real notes, chords or scales, steady rhythm, and the first piece of a song.",
    classes: [
      "First proper notes / chords / scales for the instrument",
      "Changing smoothly between notes or chords",
      "Keeping rhythm steady while playing",
      "Reading simple patterns and following along",
      "The first section of a real song",
      "Playing to a count and staying in time",
      "Homework habit, practising the right things at home",
      "Stage review, the first recognisable playing",
    ],
  },
  3: {
    promise: "Making real music, playing full songs with timing and visibly growing confidence.",
    classes: [
      "Putting the basics together into complete songs",
      "Playing with correct timing from start to finish",
      "Adding expression, dynamics, feel and smoothness",
      "A second song to widen the repertoire",
      "Practising independently, spotting their own mistakes",
      "Playing along with a backing or the teacher",
      "Polishing a favourite piece to performance quality",
      "Stage review, confident, musical and independent",
    ],
  },
  4: {
    promise: "Preparing to perform, polishing a performance piece and getting ready for the Main Pathway.",
    classes: [
      "Choosing and shaping a performance piece",
      "Full run-throughs, start to finish, with confidence",
      "Strengthening any weak spots identified along the way",
      "Foundation review, everything learned so far",
      "A first performance for family or the teacher",
      "Understanding strengths and what to grow next",
      "Introduction to what the Main Pathway looks like",
      "Foundation complete, ready for the next level",
    ],
  },
};

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
        <h3 className="mt-1 font-display text-xl font-semibold text-ink">Grade {grade}, My First Music Journey {emoji}</h3>

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

      {/* What the journey is */}
      <div className="border-b border-hairline bg-mist/40 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">The journey, explained</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/75">
          The Foundation is a <b className="text-ink">{FOUNDATION.totalClasses}-class beginner path</b>, built as
          four stages of {FOUNDATION.classesPerChapter} classes each. Every stage has a clear purpose, from the very
          first sound to a confident performance. Here is exactly what happens along the way.
        </p>
      </div>

      {/* Stages, elaborated so parents understand every class */}
      <div className="divide-y divide-hairline">
        {foundation.chapters.map(({ chapter, state, completed }) => {
          const detail = STAGE_DETAIL[chapter.number];
          return (
            <div key={chapter.number} className={cn("px-5 py-4", state === "in_progress" && "bg-gold/[0.05]")}>
              <div className="flex items-center gap-3">
                <StageIcon state={state} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold uppercase tracking-wide", state === "upcoming" ? "text-ink/45" : "text-ink")}>
                    Stage {chapter.number} · {chapter.name}
                  </p>
                  <p className="text-[11px] text-ink/50">
                    Classes {chapter.startClass}–{chapter.endClass}
                    <StageStatus state={state} />
                  </p>
                </div>
                <span className={cn("shrink-0 font-mono text-sm tabular-nums",
                  state === "completed" ? "text-feature-green" : state === "in_progress" ? "text-[#7A5E0F]" : "text-ink/35")}>
                  {completed}/{FOUNDATION.classesPerChapter}
                </span>
              </div>

              <p className={cn("mt-2.5 text-sm leading-relaxed", state === "upcoming" ? "text-ink/55" : "text-ink/80")}>
                {detail?.promise ?? chapter.parent}
              </p>

              {detail && (
                <ol className="mt-3 space-y-1.5">
                  {detail.classes.map((c, i) => {
                    const classNo = chapter.startClass + i;
                    const done = foundation.effectiveClasses >= classNo;
                    return (
                      <li key={classNo} className="flex items-start gap-2.5 text-[13px] leading-snug">
                        <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                          done ? "bg-feature-green/15 text-feature-green" : state === "in_progress" ? "bg-gold/15 text-[#7A5E0F]" : "bg-ink/[0.06] text-ink/40")}>
                          {done
                            ? <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                            : classNo}
                        </span>
                        <span className={cn(done ? "text-ink/80" : "text-ink/60")}>
                          <span className="font-medium text-ink/45">Class {classNo}:</span> {c}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          );
        })}
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

function StageStatus({ state }: { state: ChapterState }) {
  if (state === "completed") return <span className="ml-2 font-semibold text-feature-green">· Completed</span>;
  if (state === "in_progress") return <span className="ml-2 font-semibold text-[#7A5E0F]">· Happening now</span>;
  return <span className="ml-2 text-ink/40">· Coming up</span>;
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
