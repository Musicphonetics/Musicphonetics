"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// A normalised calendar item, classes and free-form events both map to this.
export interface CalEvent {
  id: string;
  date: string;            // YYYY-MM-DD
  start?: string | null;   // HH:MM[:SS]
  end?: string | null;
  title: string;
  sub?: string;
  kind: "class" | "event";
  cancelled?: boolean;
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const iso = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
const todayISO = () => iso(new Date());
const hm = (t?: string | null) => (t ? t.slice(0, 5) : "");
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function Chip({ e }: { e: CalEvent }) {
  return (
    <div className={cn("truncate rounded px-1.5 py-0.5 text-[11px] leading-tight",
      e.cancelled ? "bg-mist text-ink/40 line-through"
        : e.kind === "class" ? "bg-gold/15 text-[#7A5E0F]" : "bg-forest/12 text-forest")}>
      {e.start && <span className="font-semibold tabular-nums">{hm(e.start)} </span>}{e.title}
    </div>
  );
}

export function CalendarView({ events, initialView = "month" }: { events: CalEvent[]; initialView?: "month" | "week" }) {
  const [view, setView] = useState<"month" | "week">(initialView);
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const m: Record<string, CalEvent[]> = {};
    for (const e of events) (m[e.date] ||= []).push(e);
    for (const k in m) m[k].sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    return m;
  }, [events]);

  // Build the visible days.
  const days = useMemo(() => {
    if (view === "week") {
      const start = addDays(anchor, -anchor.getDay());
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [view, anchor]);

  const move = (dir: number) => {
    setSelected(null);
    if (view === "week") setAnchor((a) => addDays(a, dir * 7));
    else setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + dir, 1));
  };

  const heading = view === "week"
    ? `${days[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
    : `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;

  const today = todayISO();
  const selEvents = selected ? (byDate[selected] || []) : [];

  return (
    <div className="rounded-2xl border border-hairline bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-3.5">
        <div className="flex items-center gap-1.5">
          <button onClick={() => move(-1)} aria-label="Previous" className="grid h-8 w-8 place-items-center rounded-lg border border-hairline text-ink/70 hover:bg-mist">‹</button>
          <button onClick={() => { setAnchor(new Date()); setSelected(today); }} className="rounded-lg border border-hairline px-3 py-1.5 text-sm font-semibold text-ink/70 hover:bg-mist">Today</button>
          <button onClick={() => move(1)} aria-label="Next" className="grid h-8 w-8 place-items-center rounded-lg border border-hairline text-ink/70 hover:bg-mist">›</button>
          <p className="ml-2 font-display text-lg font-semibold text-ink">{heading}</p>
        </div>
        <div className="inline-flex rounded-full border border-hairline p-1">
          {(["week", "month"] as const).map((v) => (
            <button key={v} onClick={() => { setView(v); setSelected(null); }}
              className={cn("rounded-full px-3.5 py-1 text-sm font-semibold capitalize transition", view === v ? "bg-ink text-paper" : "text-ink/60 hover:text-ink")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <div className="p-2 sm:p-3">
          <div className="grid grid-cols-7 gap-1">
            {WD.map((d) => <div key={d} className="px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink/45">{d}</div>)}
            {days.map((d) => {
              const key = iso(d);
              const inMonth = d.getMonth() === anchor.getMonth();
              const evs = byDate[key] || [];
              const isToday = key === today;
              return (
                <button key={key} onClick={() => setSelected(key)}
                  className={cn("min-h-[74px] rounded-lg border p-1 text-left align-top transition sm:min-h-[92px]",
                    selected === key ? "border-gold ring-1 ring-gold" : "border-hairline hover:border-ink/25",
                    inMonth ? "bg-white" : "bg-mist/40")}>
                  <div className={cn("mb-1 grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                    isToday ? "bg-ink text-paper" : inMonth ? "text-ink/70" : "text-ink/30")}>{d.getDate()}</div>
                  <div className="space-y-0.5">
                    {evs.slice(0, 3).map((e) => <Chip key={e.id} e={e} />)}
                    {evs.length > 3 && <div className="px-1 text-[10px] font-semibold text-ink/45">+{evs.length - 3} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-hairline">
          {days.map((d) => {
            const key = iso(d);
            const evs = byDate[key] || [];
            const isToday = key === today;
            return (
              <div key={key} className={cn("flex gap-3 p-3", isToday && "bg-gold/[0.05]")}>
                <div className="w-12 shrink-0 text-center">
                  <p className="text-[11px] font-semibold uppercase text-ink/45">{WD[d.getDay()]}</p>
                  <p className={cn("mx-auto mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm font-semibold tabular-nums", isToday ? "bg-ink text-paper" : "text-ink")}>{d.getDate()}</p>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
                  {evs.length === 0 ? <p className="text-sm text-ink/35">, </p> : evs.map((e) => (
                    <div key={e.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
                      e.cancelled ? "border-hairline bg-mist" : e.kind === "class" ? "border-gold/30 bg-gold/[0.06]" : "border-forest/25 bg-forest/[0.05]")}>
                      {e.start && <span className="shrink-0 text-xs font-semibold tabular-nums text-ink/60">{hm(e.start)}{e.end ? `–${hm(e.end)}` : ""}</span>}
                      <span className={cn("truncate text-sm font-medium", e.cancelled ? "text-ink/40 line-through" : "text-ink")}>{e.title}</span>
                      {e.sub && <span className="truncate text-xs text-ink/50">· {e.sub}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected-day detail (month view) */}
      {view === "month" && selected && (
        <div className="border-t border-hairline p-4">
          <p className="text-sm font-semibold text-ink">
            {new Date(selected + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {selEvents.length === 0 ? (
            <p className="mt-1.5 text-sm text-ink/50">No classes or events.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {selEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-2.5 rounded-lg border border-hairline px-3 py-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", e.cancelled ? "bg-ink/30" : e.kind === "class" ? "bg-gold" : "bg-forest")} />
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-ink/60">{e.start ? `${hm(e.start)}${e.end ? `–${hm(e.end)}` : ""}` : "All day"}</span>
                  <span className={cn("truncate text-sm font-medium", e.cancelled ? "text-ink/40 line-through" : "text-ink")}>{e.title}</span>
                  {e.sub && <span className="truncate text-xs text-ink/50">· {e.sub}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
