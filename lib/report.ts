// ============================================================================
// Progress report - built from a student's class updates. A report card is
// "made" every 8 completed classes (a cycle milestone) and the monthly view
// keeps adding month over month, so the family gets a growing record.
// ============================================================================
import type { ClassUpdate } from "./supabase/types";

export const CLASSES_PER_CYCLE = 8;

export interface ReportEntry { date: string; taught: string; homework: string; response: string; notes: string }
export interface MonthSection { key: string; label: string; classes: ReportEntry[] }
export interface CycleMilestone { cycle: number; from: string; to: string }

export interface ProgressReport {
  totalCompleted: number;
  cyclesCompleted: number;
  classesIntoCycle: number; // 0..7 progress toward the next report card
  firstClass: string | null;
  lastClass: string | null;
  months: MonthSection[];
  cycles: CycleMilestone[];
  latestProgress: string;
}

const monthLabel = (key: string) =>
  new Date(key + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export function buildReport(updates: ClassUpdate[]): ProgressReport {
  const completed = updates
    .filter((c) => c.class_status === "Completed")
    .sort((a, b) => a.class_date.localeCompare(b.class_date));

  const entries: ReportEntry[] = completed.map((c) => ({
    date: c.class_date,
    taught: c.taught ?? "",
    homework: c.homework ?? "",
    response: c.student_response ?? "",
    notes: c.teacher_notes ?? "",
  }));

  const monthMap = new Map<string, ReportEntry[]>();
  for (const e of entries) {
    const d = new Date(e.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    (monthMap.get(key) ?? monthMap.set(key, []).get(key)!).push(e);
  }
  const months: MonthSection[] = [...monthMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, classes]) => ({ key, label: monthLabel(key), classes }));

  const cyclesCompleted = Math.floor(entries.length / CLASSES_PER_CYCLE);
  const cycles: CycleMilestone[] = [];
  for (let i = 0; i < cyclesCompleted; i++) {
    cycles.push({ cycle: i + 1, from: entries[i * 8].date, to: entries[i * 8 + 7].date });
  }

  const latestProgress = [...entries].reverse().map((e) => e.notes || e.response).find(Boolean) ?? "";

  return {
    totalCompleted: entries.length,
    cyclesCompleted,
    classesIntoCycle: entries.length % CLASSES_PER_CYCLE,
    firstClass: entries[0]?.date ?? null,
    lastClass: entries[entries.length - 1]?.date ?? null,
    months,
    cycles,
    latestProgress,
  };
}
