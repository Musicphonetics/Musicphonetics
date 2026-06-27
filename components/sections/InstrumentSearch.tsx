"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InstrumentIcon } from "@/components/ui/InstrumentIcon";
import { INSTRUMENTS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const OTHERS = { value: "__others__", label: "Something else…", icon: null as null };

/**
 * Spotlight-style instrument search. Selecting an instrument immediately
 * launches the existing onboarding (deep-linked), skipping the instrument step.
 */
export function InstrumentSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = INSTRUMENTS.filter((i) => i.label.toLowerCase().includes(q));
    return [...matched, OTHERS];
  }, [query]);

  useEffect(() => setHi(0), [query]);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function select(value: string) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
    router.push(value === "__others__" ? "/start" : `/start?instrument=${encodeURIComponent(value)}`);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[hi]; if (r) select(r.value); }
    else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-5 shadow-card-hover backdrop-blur-md focus-within:border-gold/50">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-gold">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search instrument…"
          aria-label="Search for an instrument to learn"
          aria-expanded={open}
          aria-controls={listId}
          role="combobox"
          className="min-h-[60px] w-full bg-transparent text-base text-paper placeholder:text-paper/45 focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] text-paper/40 sm:block">↵</kbd>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="mp-glass absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-2xl p-1.5 shadow-card-hover"
        >
          {results.map((r, i) => (
            <li key={r.value} role="option" aria-selected={hi === i}>
              <button
                type="button"
                onMouseEnter={() => setHi(i)}
                onClick={() => select(r.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors",
                  hi === i ? "bg-gold/15 text-paper" : "text-paper/80"
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/12 bg-white/5 text-gold">
                  {r.icon ? <InstrumentIcon name={r.icon} size={18} /> : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </span>
                <span className="text-sm font-semibold">{r.label}</span>
                {hi === i && <span className="ml-auto text-xs text-gold">Start →</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
