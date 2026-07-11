"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// One login button for the whole site. Tap it and it asks who you are -
// parent/student or teacher - then sends you to the right portal.
export function LoginChooser({ align = "center", tone = "dark" }: { align?: "center" | "start"; tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const light = tone === "light";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${light ? "border-ink/20 bg-white text-ink hover:border-ink/40" : "border-white/20 bg-white/[0.04] text-paper hover:border-white/40"}`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Login
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={open ? "rotate-180 transition-transform" : "transition-transform"}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {open && (
        <div className={`absolute z-40 mt-2 w-64 overflow-hidden rounded-2xl border p-1.5 shadow-2xl ${light ? "border-hairline bg-white" : "border-white/12 bg-onyx-1"} ${align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"}`}>
          <p className={`px-3 pb-1.5 pt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${light ? "text-ink/45" : "text-paper/45"}`}>Who&apos;s logging in?</p>
          <Link href="/parent/login" onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left ${light ? "hover:bg-mist" : "hover:bg-white/5"}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="17" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.6" /></svg>
            </span>
            <span>
              <span className={`block text-sm font-semibold ${light ? "text-ink" : "text-paper"}`}>Parent / Student</span>
              <span className={`block text-xs ${light ? "text-ink/55" : "text-paper/55"}`}>Classes, progress &amp; fees</span>
            </span>
          </Link>
          <Link href="/teacher/login" onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left ${light ? "hover:bg-mist" : "hover:bg-white/5"}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/[0.1] text-[#7A5E0F]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M7 9.5V15c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V9.5M21 7v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </span>
            <span>
              <span className={`block text-sm font-semibold ${light ? "text-ink" : "text-paper"}`}>Teacher</span>
              <span className={`block text-xs ${light ? "text-ink/55" : "text-paper/55"}`}>Your students &amp; class updates</span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
