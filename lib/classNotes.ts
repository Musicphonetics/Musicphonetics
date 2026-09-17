// Shared vocabulary for the learning notes a teacher records on a class and the
// family reads on the portal home: an accuracy score, where the student
// struggled, and how much practice is needed. Keeps the teacher form and the
// parent card describing the same thing the same way.

export type PracticeLevelKey = "light" | "moderate" | "focused" | "intensive";

export interface PracticeLevel {
  key: PracticeLevelKey;
  label: string;
  hint: string;   // suggested daily practice, shown to the family
  dot: string;    // tailwind bg for the indicator
  text: string;   // tailwind text colour
  chip: string;   // tailwind bg tint for pills
}

export const PRACTICE_LEVELS: PracticeLevel[] = [
  { key: "light",     label: "Light",     hint: "10 min a day",    dot: "bg-emerald-500", text: "text-emerald-700", chip: "bg-emerald-500/12" },
  { key: "moderate",  label: "Moderate",  hint: "15-20 min a day", dot: "bg-gold",        text: "text-[#7A5E0F]",   chip: "bg-gold/15" },
  { key: "focused",   label: "Focused",   hint: "25-30 min a day", dot: "bg-orange-500",  text: "text-orange-600",  chip: "bg-orange-500/12" },
  { key: "intensive", label: "Intensive", hint: "40+ min a day",   dot: "bg-red-500",     text: "text-red-600",     chip: "bg-red-500/12" },
];

export function practiceLevel(key?: string | null): PracticeLevel | null {
  if (!key) return null;
  return PRACTICE_LEVELS.find((p) => p.key === key) ?? null;
}

export interface AccuracyMeta {
  label: string;
  tone: string;   // tailwind text colour
  bar: string;    // tailwind bg for the meter fill
  track: string;  // tailwind bg for the meter track tint
}

// A friendly read on the accuracy score, so a number becomes a feeling.
export function accuracyMeta(pct: number): AccuracyMeta {
  if (pct >= 90) return { label: "Excellent", tone: "text-emerald-700", bar: "bg-emerald-500", track: "bg-emerald-500/12" };
  if (pct >= 75) return { label: "Good", tone: "text-[#7A5E0F]", bar: "bg-gold", track: "bg-gold/15" };
  if (pct >= 60) return { label: "Getting there", tone: "text-orange-600", bar: "bg-orange-500", track: "bg-orange-500/12" };
  return { label: "Needs practice", tone: "text-red-600", bar: "bg-red-500", track: "bg-red-500/12" };
}

// A one-line headline for how the class went, from accuracy + effort.
export function classHeadline(accuracy: number | null | undefined): string {
  if (accuracy == null) return "Here's how the last class went";
  if (accuracy >= 90) return "A brilliant class";
  if (accuracy >= 75) return "A strong class";
  if (accuracy >= 60) return "Good progress this class";
  return "A building-blocks class";
}
