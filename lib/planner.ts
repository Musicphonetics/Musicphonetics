import type { WeeklySlot } from "@/lib/supabase/types";

// Shared logic for the teacher weekly planner: the current week, how each
// student is doing against their target, and a readable schedule summary.

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Monday-first order for pickers and the week board.
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const iso = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD, local

// Monday 00:00 of the week containing `d`.
export function weekStartMonday(d = new Date()): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = x.getDay(); // 0=Sun
  const diff = (dow + 6) % 7; // days since Monday
  x.setDate(x.getDate() - diff);
  return x;
}

export function weekDatesISO(start = weekStartMonday()): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return iso(d);
  });
}

export function weekRangeLabel(start = weekStartMonday()): string {
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("en-IN", opt)} to ${end.toLocaleDateString("en-IN", opt)}`;
}

// 24h "HH:MM" to a friendly "5:00 pm".
export function prettyTime(t?: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const ap = h < 12 ? "am" : "pm";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m || 0).padStart(2, "0")} ${ap}`;
}

// "Mon, Thu · 5:00 pm" (groups a common time; lists distinct times otherwise).
export function slotsSummary(slots?: WeeklySlot[] | null): string {
  const list = (slots ?? []).filter((s) => s && typeof s.day === "number");
  if (!list.length) return "";
  const days = [...list].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7)).map((s) => DOW[s.day]);
  const times = Array.from(new Set(list.map((s) => s.time).filter(Boolean)));
  const timePart = times.length === 1 ? ` · ${prettyTime(times[0])}` : "";
  return days.join(", ") + timePart;
}

export type Standing = "none" | "behind" | "ontrack" | "ahead";

// Where a student stands this week. `todayDow` (0=Sun) lets us treat a slow
// start as "behind" only once the week is underway (Wednesday onward).
export function standing(done: number, target: number, todayDow = new Date().getDay()): Standing {
  const t = Math.max(1, target || 2);
  if (done > t) return "ahead";
  if (done >= t) return "ontrack";
  if (done === 0) return "none";
  // partial: behind if the week is past its midpoint and the target is at risk
  const midweek = todayDow === 0 || todayDow >= 4; // Thu, Fri, Sat, Sun
  return midweek ? "behind" : "ontrack";
}

export const STANDING_META: Record<Standing, { label: string; dot: string; text: string }> = {
  none: { label: "Not started", dot: "bg-red-500", text: "text-red-600" },
  behind: { label: "Behind", dot: "bg-amber-500", text: "text-amber-600" },
  ontrack: { label: "On track", dot: "bg-feature-green", text: "text-feature-green" },
  ahead: { label: "Ahead", dot: "bg-feature-green", text: "text-feature-green" },
};
