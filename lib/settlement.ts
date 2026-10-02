// ============================================================================
// Settled chapters. A student's timeline can be split into labelled, dated
// chapters — e.g. Guitar, then History (different fee & timing), then Guitar
// again. Each *closed* chapter has a from/to date and a label; everything that
// falls inside one is accounted under that chapter, and everything outside all
// of them is the current, active account tracked in paid cycles.
// ============================================================================

export interface SettledChapter {
  from: string | null;   // YYYY-MM-DD, null = open start
  to: string | null;     // YYYY-MM-DD, null = open end
  label: string;         // e.g. "History", "Guitar"
  note?: string | null;
}

interface StudentLike {
  settlements?: unknown;
  // legacy single-cutoff (supabase/class_subject_and_settlement.sql, first pass)
  settled_until?: string | null;
  settlement_note?: string | null;
}

function toChapter(x: unknown): SettledChapter | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const label = typeof o.label === "string" && o.label.trim() ? o.label.trim() : "Settled";
  const from = typeof o.from === "string" && o.from ? o.from : null;
  const to = typeof o.to === "string" && o.to ? o.to : null;
  if (!from && !to) return null; // a chapter needs at least one bound
  const note = typeof o.note === "string" ? o.note : null;
  return { from, to, label, note };
}

// Every closed chapter for a student, oldest first. Falls back to the legacy
// single `settled_until` cutoff so earlier settlements keep working.
export function chaptersOf(s: StudentLike): SettledChapter[] {
  const raw = Array.isArray(s.settlements) ? s.settlements : [];
  const list = raw.map(toChapter).filter((c): c is SettledChapter => c !== null);
  if (list.length === 0 && s.settled_until) {
    list.push({ from: null, to: s.settled_until, label: "Settled", note: s.settlement_note ?? null });
  }
  return list.sort((a, b) => (a.from || a.to || "").localeCompare(b.from || b.to || ""));
}

export function inChapter(dateISO: string | null | undefined, c: SettledChapter): boolean {
  if (!dateISO) return false;
  if (c.from && dateISO < c.from) return false;
  if (c.to && dateISO > c.to) return false;
  return true;
}

// The closed chapter a date falls in, or null when the date is in the active
// (current) account.
export function chapterFor(dateISO: string | null | undefined, chapters: SettledChapter[]): SettledChapter | null {
  return chapters.find((c) => inChapter(dateISO, c)) ?? null;
}

export function isActiveDate(dateISO: string | null | undefined, chapters: SettledChapter[]): boolean {
  return chapters.length === 0 || !chapterFor(dateISO, chapters);
}

export const chapterRange = (c: SettledChapter): string => {
  const d = (iso: string | null) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);
  const f = d(c.from), t = d(c.to);
  if (f && t) return `${f} – ${t}`;
  if (t) return `up to ${t}`;
  if (f) return `from ${f}`;
  return "";
};
