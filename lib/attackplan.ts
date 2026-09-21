// ============================================================================
// "Attack plan" — a completion planner. Given a number of classes (e.g. a paid
// block of 16), a start date and the weekdays you can teach, it lays out the
// exact class dates and the finish date. With a deadline it tells you whether
// the pace clears it and, if not, the minimum classes/week that would.
// ============================================================================

const MS_DAY = 86400000;

const toDate = (iso: string) => new Date(iso + "T00:00:00");
const toISO = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD local
export const addDays = (iso: string, n: number) => toISO(new Date(toDate(iso).getTime() + n * MS_DAY));
export const daysBetween = (aISO: string, bISO: string) => Math.round((toDate(bISO).getTime() - toDate(aISO).getTime()) / MS_DAY);
export const todayISO = () => toISO(new Date());

export interface PlanClass { n: number; dateISO: string; }

export interface AttackPlan {
  classes: number;
  perWeek: number;
  weekdays: number[];        // 0=Sun … 6=Sat
  startISO: string;
  finishISO: string | null;
  weeks: number;             // calendar weeks the plan spans
  items: PlanClass[];
  deadlineISO: string | null;
  onTime: boolean | null;    // null when no deadline
  slackDays: number | null;  // vs deadline: + early, − late
  feasible: boolean;         // all classes could be placed within the horizon
}

// Even, predictable weekday spreads (Monday-first, Sunday only when needed).
const SPREADS: Record<number, number[]> = {
  1: [3],                 // Wed
  2: [1, 4],              // Mon, Thu
  3: [1, 3, 5],           // Mon, Wed, Fri
  4: [1, 2, 4, 5],        // Mon, Tue, Thu, Fri
  5: [1, 2, 3, 4, 5],     // Mon–Fri
  6: [1, 2, 3, 4, 5, 6],  // Mon–Sat
  7: [0, 1, 2, 3, 4, 5, 6],
};

export function recommendWeekdays(perWeek: number): number[] {
  const n = Math.max(1, Math.min(7, Math.round(perWeek)));
  return SPREADS[n];
}

// Whole calendar weeks from start to deadline (inclusive), at least 1.
export function weeksUntil(startISO: string, deadlineISO: string): number {
  return Math.max(1, Math.ceil((daysBetween(startISO, deadlineISO) + 1) / 7));
}

// Fewest classes/week whose evenly-spread days actually finish `classes` by the
// deadline. Simulated (not just classes ÷ weeks) so the answer is never a day
// short because of where the weekdays fall. Returns 7 if even daily can't do it.
export function requiredPerWeek(classes: number, startISO: string, deadlineISO: string): number {
  for (let pw = 1; pw <= 7; pw++) {
    if (buildPlan(classes, startISO, recommendWeekdays(pw), deadlineISO).onTime) return pw;
  }
  return 7;
}

export function buildPlan(
  classes: number,
  startISO: string,
  weekdays: number[],
  deadlineISO: string | null = null,
): AttackPlan {
  const days = [...new Set(weekdays)].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  const n = Math.max(0, Math.floor(classes || 0));
  const items: PlanClass[] = [];

  if (n > 0 && days.length > 0) {
    const set = new Set(days);
    let cursor = startISO;
    let guard = 0;
    while (items.length < n && guard < 730) {
      if (set.has(toDate(cursor).getDay())) items.push({ n: items.length + 1, dateISO: cursor });
      cursor = addDays(cursor, 1);
      guard++;
    }
  }

  const finishISO = items.length ? items[items.length - 1].dateISO : null;
  const feasible = items.length === n;
  const weeks = finishISO ? Math.max(1, Math.ceil((daysBetween(startISO, finishISO) + 1) / 7)) : 0;
  const slackDays = finishISO && deadlineISO ? daysBetween(finishISO, deadlineISO) : null;

  return {
    classes: n,
    perWeek: days.length,
    weekdays: days,
    startISO,
    finishISO,
    weeks,
    items,
    deadlineISO,
    onTime: slackDays == null ? null : slackDays >= 0,
    slackDays,
    feasible,
  };
}

export interface PlanWeek { label: string; items: PlanClass[]; }

// Group the dated classes into calendar weeks (Monday-first) for display.
export function groupByWeek(items: PlanClass[]): PlanWeek[] {
  const weeks = new Map<string, PlanClass[]>();
  for (const it of items) {
    const d = toDate(it.dateISO);
    const monOffset = (d.getDay() + 6) % 7;
    const monISO = addDays(it.dateISO, -monOffset);
    (weeks.get(monISO) ?? weeks.set(monISO, []).get(monISO)!).push(it);
  }
  return [...weeks.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monISO, list]) => {
      const end = addDays(monISO, 6);
      const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
      return {
        label: `${toDate(monISO).toLocaleDateString("en-IN", opt)} – ${toDate(end).toLocaleDateString("en-IN", opt)}`,
        items: list,
      };
    });
}

export const prettyDate = (iso: string | null) =>
  iso ? toDate(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";
