"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// A controlled, immersive "book". No native page scroll — ONE wheel/touch/key
// gesture advances exactly ONE chapter, with a lock so rapid input can't skip.
// Chapters are stacked (see .chapter CSS); only the active one is interactive.
export function ChapterDeck({ children, labels, themes }: { children: React.ReactNode; labels: string[]; themes?: ("light" | "dark")[] }) {
  const chapters = Children.toArray(children);
  const n = chapters.length;
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const lock = useRef(false);
  const touchY = useRef(0);
  const wheelAccum = useRef(0);
  const [menu, setMenu] = useState(false);

  const go = useCallback((next: number) => {
    if (lock.current) return;
    const t = Math.max(0, Math.min(n - 1, next));
    if (t === idxRef.current) return;
    idxRef.current = t; setIdx(t); setMenu(false);
    lock.current = true;
    window.setTimeout(() => { lock.current = false; }, 1000);
  }, [n]);

  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lock.current) return;
      wheelAccum.current += e.deltaY;
      if (Math.abs(wheelAccum.current) < 40) return;
      const dir = wheelAccum.current > 0 ? 1 : -1;
      wheelAccum.current = 0;
      go(idxRef.current + dir);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(idxRef.current + 1); }
      else if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(idxRef.current - 1); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(n - 1); }
    };
    const onTS = (e: TouchEvent) => { touchY.current = e.touches[0].clientY; };
    const onTM = (e: TouchEvent) => { if (Math.abs(touchY.current - e.touches[0].clientY) > 10) e.preventDefault(); };
    const onTE = (e: TouchEvent) => {
      const dy = touchY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 45) go(idxRef.current + (dy > 0 ? 1 : -1));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove", onTM, { passive: false });
    window.addEventListener("touchend", onTE, { passive: true });
    return () => {
      html.style.overflow = prevOverflow; document.body.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", onTE);
    };
  }, [go, n]);

  const two = (k: number) => String(k + 1).padStart(2, "0");
  const light = (themes?.[idx] ?? "dark") === "light";
  const fg = light ? "text-ink" : "text-paper";
  const fgSoft = light ? "text-ink/70" : "text-paper/70";

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-[#0a0d14] text-paper">
      {chapters.map((ch, i) => (
        <div key={i} aria-hidden={i !== idx} className={"chapter " + (i === idx ? "chapter-active" : i < idx ? "chapter-prev" : "chapter-next")}>
          {ch}
        </div>
      ))}

      {/* Minimal top bar: brand + chapter menu toggle */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="pointer-events-auto flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/50 bg-gold/10 font-display text-base font-bold text-gold">♪</span>
          <span className={"font-display text-base font-bold " + fg}>Musicphonetics</span>
        </Link>
        <button onClick={() => setMenu((m) => !m)} className={"pointer-events-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] " + fgSoft + " hover:opacity-100"}>
          <span className="tabular-nums">{two(idx)} / {two(n - 1)}</span>
          <span className="flex flex-col gap-[3px]"><span className="h-px w-5 bg-current" /><span className="h-px w-5 bg-current" /></span>
        </button>
      </div>

      {/* Chapter menu overlay */}
      {menu && (
        <div className="absolute inset-0 z-50 flex flex-col justify-center bg-[#0a0d14]/95 px-8 backdrop-blur-sm" onClick={() => setMenu(false)}>
          <nav className="mx-auto w-full max-w-md space-y-1" onClick={(e) => e.stopPropagation()}>
            {labels.map((l, i) => (
              <button key={l} onClick={() => go(i)} className={"flex w-full items-baseline gap-4 border-b border-white/10 py-3 text-left transition " + (i === idx ? "text-gold" : "text-paper/70 hover:text-paper")}>
                <span className="font-display text-sm tabular-nums opacity-60">{two(i)}</span>
                <span className="font-display text-2xl font-bold">{l}</span>
              </button>
            ))}
          </nav>
          <button onClick={() => setMenu(false)} className="mx-auto mt-8 text-xs uppercase tracking-widest text-paper/50">Close ✕</button>
        </div>
      )}

      {/* Right-side progress rail */}
      <div className="absolute right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 sm:flex">
        {chapters.map((_, i) => (
          <button key={i} aria-label={`Chapter ${i + 1}`} onClick={() => go(i)}
            className={"rounded-full transition-all duration-300 " + (i === idx ? "h-6 w-1.5 bg-gold" : "h-1.5 w-1.5 " + (light ? "bg-ink/25 hover:bg-ink/50" : "bg-white/30 hover:bg-white/60"))} />
        ))}
      </div>

      {/* Swipe hint (first chapter only) */}
      {idx === 0 && (
        <button onClick={() => go(1)} className={"absolute bottom-6 left-1/2 z-40 -translate-x-1/2 animate-bounce text-xs font-semibold uppercase tracking-[0.2em] " + fgSoft}>
          Swipe ↓
        </button>
      )}
    </div>
  );
}
