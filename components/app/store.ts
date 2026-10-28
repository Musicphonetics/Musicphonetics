"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Local, on-device store for the standalone practice app. Real data the user
// creates, persisted in localStorage — no backend, no synthetic filler. Fully
// self-contained; touches nothing else in the project.
// ============================================================================

const KEY = "mp-practice-app-v1";

export type Profile = {
  name: string;
  instrument: string;
  goal: string;
  targetMin: number; // daily practice target in minutes
  createdAt: string; // ISO
};

export type Session = {
  id: string;
  date: string;   // YYYY-MM-DD
  minutes: number;
  focus: string;  // what you worked on
  feel: number;   // 1–5 how it went
  note?: string;
};

export type Data = { profile: Profile | null; sessions: Session[] };

const EMPTY: Data = { profile: null, sessions: [] };

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Data;
      if (d && typeof d === "object") return { profile: d.profile ?? null, sessions: Array.isArray(d.sessions) ? d.sessions : [] };
    }
  } catch { /* ignore */ }
  return EMPTY;
}

export function useStore() {
  const [data, setData] = useState<Data>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setData(load()); setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data, hydrated]);

  const setProfile = useCallback((p: Profile) => setData((d) => ({ ...d, profile: p })), []);
  const addSession = useCallback((s: Omit<Session, "id">) =>
    setData((d) => ({ ...d, sessions: [{ ...s, id: uid() }, ...d.sessions] })), []);
  const updateSession = useCallback((id: string, patch: Partial<Session>) =>
    setData((d) => ({ ...d, sessions: d.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)) })), []);
  const removeSession = useCallback((id: string) =>
    setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) })), []);
  const reset = useCallback(() => setData(EMPTY), []);
  const importData = useCallback((d: Data) => setData({ profile: d.profile ?? null, sessions: Array.isArray(d.sessions) ? d.sessions : [] }), []);

  return { data, hydrated, setProfile, addSession, updateSession, removeSession, reset, importData };
}

/* ------------------------------------------------------------------ helpers */
export function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

export function todayYMD(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function ymdToDate(ymd: string): Date { const [y, m, dd] = ymd.split("-").map(Number); return new Date(y, m - 1, dd); }
export function shiftYMD(ymd: string, deltaDays: number): string { const d = ymdToDate(ymd); d.setDate(d.getDate() + deltaDays); return todayYMD(d); }

export function prettyDate(ymd: string): string {
  const d = ymdToDate(ymd);
  const t = todayYMD();
  if (ymd === t) return "Today";
  if (ymd === shiftYMD(t, -1)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

/* ------------------------------------------------------------ computed stats */
export type Stats = {
  totalSessions: number;
  totalMinutes: number;
  practicedToday: boolean;
  todayMinutes: number;
  streak: number;        // current consecutive days ending today
  bestStreak: number;
  last7: { ymd: string; label: string; minutes: number }[];
  weekMinutes: number;   // sum of last 7 days
};

export function computeStats(sessions: Session[]): Stats {
  const t = todayYMD();
  const minutesByDay = new Map<string, number>();
  let totalMinutes = 0;
  for (const s of sessions) {
    minutesByDay.set(s.date, (minutesByDay.get(s.date) ?? 0) + s.minutes);
    totalMinutes += s.minutes;
  }

  // last 7 days (oldest → newest)
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const ymd = shiftYMD(t, -(6 - i));
    const d = ymdToDate(ymd);
    return { ymd, label: d.toLocaleDateString("en-IN", { weekday: "narrow" }), minutes: minutesByDay.get(ymd) ?? 0 };
  });
  const weekMinutes = last7.reduce((a, b) => a + b.minutes, 0);

  // current streak ending today
  let streak = 0;
  let cur = t;
  while ((minutesByDay.get(cur) ?? 0) > 0) { streak++; cur = shiftYMD(cur, -1); }

  // best streak across all logged days
  const days = [...minutesByDay.keys()].filter((k) => (minutesByDay.get(k) ?? 0) > 0).sort();
  let best = 0, run = 0, prev = "";
  for (const day of days) {
    if (prev && shiftYMD(prev, 1) === day) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = day;
  }

  return {
    totalSessions: sessions.length,
    totalMinutes,
    practicedToday: (minutesByDay.get(t) ?? 0) > 0,
    todayMinutes: minutesByDay.get(t) ?? 0,
    streak,
    bestStreak: best,
    last7,
    weekMinutes,
  };
}

export const INSTRUMENTS = ["Guitar", "Piano", "Keyboard", "Vocals", "Ukulele", "Drums", "Violin", "Bass", "Other"];
