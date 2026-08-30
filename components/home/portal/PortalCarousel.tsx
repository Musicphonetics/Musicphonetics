"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PORTAL_SCREENS } from "./frames";

// One swipe = one portal capability. A native horizontal scroll-snap track (fast,
// no scroll-hijack, leaves the vertical page scroll untouched). Dots + captions
// track the active screen; arrows appear on larger screens.
export function PortalCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = PORTAL_SCREENS.length;

  const goTo = useCallback((k: number) => {
    const track = trackRef.current;
    if (!track) return;
    const t = Math.max(0, Math.min(n - 1, k));
    const child = track.children[t] as HTMLElement | undefined;
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [n]);

  // Track the most-centred slide as the user swipes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bestD = Infinity;
        Array.from(track.children).forEach((c, k) => {
          const el = c as HTMLElement;
          const cMid = el.offsetLeft - track.offsetLeft + el.clientWidth / 2;
          const d = Math.abs(cMid - mid);
          if (d < bestD) { bestD = d; best = k; }
        });
        setI(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => { track.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const active = PORTAL_SCREENS[i];

  return (
    <div>
      {/* Caption for the active screen (above the phones, so it reads first) */}
      <div className="mx-auto mb-6 max-w-md px-2 text-center">
        <div className="flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
          <span className="tabular-nums">{active.num}</span>
          <span aria-hidden="true" className="h-px w-6 bg-gold/50" />
          <span>{active.tag}</span>
        </div>
        <h3 className="mt-2 font-display text-[clamp(1.4rem,4.5vw,2rem)] font-semibold leading-tight text-ivory">{active.title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-relaxed text-ivory/60">{active.blurb}</p>
      </div>

      <div className="relative">
        {/* arrows (desktop) */}
        <button onClick={() => goTo(i - 1)} aria-label="Previous screen" disabled={i === 0}
          className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-ivory/80 backdrop-blur transition hover:bg-white/10 disabled:opacity-30 lg:grid">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button onClick={() => goTo(i + 1)} aria-label="Next screen" disabled={i === n - 1}
          className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-ivory/80 backdrop-blur transition hover:bg-white/10 disabled:opacity-30 lg:grid">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* scroll-snap track */}
        <div ref={trackRef}
          className="portal-track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[calc(50%-150px)] pb-2"
          style={{ scrollbarWidth: "none" }}>
          {PORTAL_SCREENS.map((s, k) => {
            const Screen = s.Screen;
            return (
              <div key={s.num} className="snap-center shrink-0 transition-opacity duration-500" style={{ opacity: k === i ? 1 : 0.45 }}>
                <Screen />
              </div>
            );
          })}
        </div>
      </div>

      {/* dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {PORTAL_SCREENS.map((s, k) => (
          <button key={s.num} onClick={() => goTo(k)} aria-label={`Go to ${s.tag}`}
            className={"h-1.5 rounded-full transition-all " + (k === i ? "w-6 bg-gold" : "w-1.5 bg-white/25 hover:bg-white/50")} />
        ))}
      </div>

      <style jsx>{`.portal-track::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
