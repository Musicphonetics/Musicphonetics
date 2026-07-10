// ============================================================================
// Musicphonetics Foundation Journey - a 32-class beginner pathway (4 chapters
// of 8). Progress is DERIVED from completed classes (class_updates) + the
// student's placement (starting chapter) + an optional teacher "ready" flag.
// No data duplication: this reads class counts, it never stores them.
// ============================================================================

export const FOUNDATION = {
  name: "Foundation Journey",
  subtitle: "32-Class Beginner Pathway",
  totalClasses: 32,
  classesPerChapter: 8,
  upgradeTo: "Main Musicphonetics Pathway",
  upgradeFee: 12000,
} as const;

export interface Chapter {
  number: number;
  name: string;
  startClass: number;
  endClass: number;
  goal: string;   // internal / teacher facing
  parent: string; // what the parent sees
}

export const FOUNDATION_CHAPTERS: Chapter[] = [
  {
    number: 1, name: "Starting Right", startClass: 1, endClass: 8,
    goal: "Comfort with the instrument, posture, basic rhythm, basic sound and a practice routine.",
    parent: "Your child is learning the foundation of sound, rhythm, posture and practice discipline.",
  },
  {
    number: 2, name: "Building Basics", startClass: 9, endClass: 16,
    goal: "Basic notes / chords / scales, rhythm stability, simple patterns, homework habit, first exercise.",
    parent: "The student is moving from comfort to control - basic notes, rhythm and their first song section.",
  },
  {
    number: 3, name: "Musical Confidence", startClass: 17, endClass: 24,
    goal: "Applying basics into songs and exercises, timing, visible confidence, independent practice.",
    parent: "Your child is now building confidence and musical independence.",
  },
  {
    number: 4, name: "Ready for Next Level", startClass: 25, endClass: 32,
    goal: "Foundation review, a simple performance piece, strengths and gaps identified, Main Pathway readiness.",
    parent: "Your child is finishing the beginner foundation and getting ready for the Main Pathway.",
  },
];

export type FoundationStatus = "Not Started" | "In Progress" | "Foundation Complete" | "Upgraded";
export type ChapterState = "completed" | "in_progress" | "upcoming";

export interface FoundationProgress {
  startingChapter: number;
  effectiveClasses: number; // credited (placement) + completed, capped at 32
  totalClasses: number;
  progressPercent: number;  // 0..100
  currentChapter: Chapter;
  chapters: { chapter: Chapter; state: ChapterState }[];
  status: FoundationStatus;
  readyForUpgrade: boolean;
  workingOn: string;        // parent-facing "what we're working on"
  nextMilestone: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * @param completedInPath completed classes counted toward Foundation
 * @param startingChapter 1..4 placement (skipped chapters are credited)
 * @param teacherReady    teacher marked "ready for Main Pathway"
 * @param upgraded        already moved to Main Pathway
 */
export function computeFoundation(
  completedInPath: number,
  startingChapter = 1,
  teacherReady = false,
  upgraded = false,
): FoundationProgress {
  const start = clamp(Math.round(startingChapter) || 1, 1, 4);
  const credited = (start - 1) * FOUNDATION.classesPerChapter;
  const effective = clamp(credited + Math.max(0, Math.floor(completedInPath)), 0, FOUNDATION.totalClasses);
  const progressPercent = Math.round((effective / FOUNDATION.totalClasses) * 100);

  const completedChapters = Math.floor(effective / FOUNDATION.classesPerChapter); // 0..4
  const currentNumber = effective >= FOUNDATION.totalClasses ? 4 : Math.min(completedChapters + 1, 4);
  const currentChapter = FOUNDATION_CHAPTERS[currentNumber - 1];

  const chapters = FOUNDATION_CHAPTERS.map((chapter) => {
    let state: ChapterState = "upcoming";
    if (effective >= chapter.endClass) state = "completed";
    else if (chapter.number === currentNumber) state = "in_progress";
    return { chapter, state };
  });

  const foundationComplete = effective >= FOUNDATION.totalClasses;
  const readyForUpgrade = !upgraded && (foundationComplete || teacherReady || progressPercent >= 90);
  const status: FoundationStatus = upgraded
    ? "Upgraded"
    : foundationComplete
      ? "Foundation Complete"
      : effective > 0
        ? "In Progress"
        : "Not Started";

  const nextMilestone = foundationComplete
    ? "Main Musicphonetics Pathway"
    : (FOUNDATION_CHAPTERS[currentNumber]?.name ?? "Ready for Main Pathway");

  return {
    startingChapter: start,
    effectiveClasses: effective,
    totalClasses: FOUNDATION.totalClasses,
    progressPercent,
    currentChapter,
    chapters,
    status,
    readyForUpgrade,
    workingOn: foundationComplete ? "Foundation completed. Ready for the Main Pathway." : currentChapter.parent,
    nextMilestone,
  };
}

// Parent-facing skill indicators for the progress page. Illustrative for the
// MVP: derived from journey progress so they grow as the student advances.
export interface Skill { label: string; value: number }
export function skillIndicators(p: FoundationProgress): Skill[] {
  const g = p.progressPercent;
  const v = (base: number) => clamp(Math.round(base), 5, 100);
  return [
    { label: "Rhythm", value: v(g + 8) },
    { label: "Technique", value: v(g) },
    { label: "Theory", value: v(g - 12) },
    { label: "Confidence", value: v(g + 4) },
    { label: "Practice consistency", value: v(g - 4) },
    { label: "Performance readiness", value: v(g - 18) },
  ];
}

// Upgrade message the owner can send (kept here so it stays consistent).
export function upgradeMessage(studentName: string): string {
  const n = studentName || "your child";
  return (
    `Hi Ma'am/Sir, congratulations - ${n} has completed the Musicphonetics Foundation Journey. ` +
    `Over the last cycle the student worked through the beginner foundation chapters and is now ready for the next level. ` +
    `The recommended next step is the Main Musicphonetics Pathway, where we focus on stronger progress, theory, confidence, ` +
    `performance preparation and grade-oriented direction where applicable. From the next cycle the student can move to the ` +
    `Main Pathway at ₹12,000/month. I'll personally guide the transition so the progress continues smoothly.`
  );
}
