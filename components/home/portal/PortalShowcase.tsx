"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PORTAL_SCREENS } from "./frames";

// THE MUSICPHONETICS STUDENT PORTAL, revealed as a full-screen takeover.
//
// As the visitor scrolls down from the hero, this section PINS to the whole
// viewport (a tall section with a sticky, 100svh stage). Each further swipe
// advances exactly one portal screen; when they reach the last one and keep
// scrolling, it releases naturally into the packages / fees / reviews flow.
// The site nav is already solid charcoal on scroll, so the pinned charcoal stage
// blends into it: it genuinely feels like stepping into a different product.
//
// Native scroll drives it (no gesture-hijack), so momentum scrolling stays
// smooth. Screens cross-fade; the active one is chosen by scroll progress.

const N = PORTAL_SCREENS.length;
const STEP_VH = 85;            // scroll travel per screen
const PHONE_W = 316;          // natural phone size (px) for fit-scaling
const PHONE_H = 606;

export function PortalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);

  // Fit the phone into the available stage height/width (never clipped).
  const fit = useCallback(() => {
    const a = areaRef.current;
    if (!a) return;
    const s = Math.min(a.clientWidth / PHONE_W, a.clientHeight / PHONE_H, 1.15);
    setScale(Math.max(0.5, s));
  }, []);

  useLayoutEffect(() => { fit(); }, [fit]);

  // Track scroll progress through the section -> active screen index.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const p = total > 0 ? scrolled / total : 0;
        // Equal band per screen (last one holds a full swipe before releasing).
        setIdx(Math.min(N - 1, Math.floor(p * N)));
        // Pinned = the section fully owns the viewport; hide site chrome then.
        const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
        document.body.classList.toggle("mp-portal-pinned", pinned);
      });
    };
    const onResize = () => { fit(); onScroll(); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); if (raf) cancelAnimationFrame(raf); document.body.classList.remove("mp-portal-pinned"); };
  }, [fit]);

  // Jump to a screen when a dot is tapped.
  const goTo = useCallback((i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const topDoc = el.getBoundingClientRect().top + window.scrollY;
    const p = (i + 0.5) / N; // centre of screen i's band
    window.scrollTo({ top: topDoc + p * total, behavior: "smooth" });
  }, []);

  const active = PORTAL_SCREENS[idx];
  const last = idx === N - 1;

  return (
    <section ref={sectionRef} id="portal" className="no-cv relative bg-charcoal" style={{ height: `${100 + N * STEP_VH}svh` }}>
      {/* Pinned full-viewport stage */}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft gold wash */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-8%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gold/[0.08] blur-[130px]" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center px-4 pt-[6.25rem] pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* caption for the active screen */}
          <div className="max-w-md text-center">
            <div className="flex items-center justify-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold">
              <span className="tabular-nums">{active.num}</span>
              <span aria-hidden="true" className="h-px w-5 bg-gold/50" />
              <span>{active.tag}</span>
            </div>
            <h3 className="mt-1.5 font-display text-[clamp(1.35rem,4.8vw,2rem)] font-semibold leading-tight text-ivory">{active.title}</h3>
            <p className="mx-auto mt-1 max-w-sm text-[0.85rem] leading-snug text-ivory/60">{active.blurb}</p>
          </div>

          {/* phone stage: all screens stacked, active one visible + fit-scaled */}
          <div ref={areaRef} className="relative mt-3 flex w-full min-h-0 flex-1 items-center justify-center">
            {PORTAL_SCREENS.map((s, k) => {
              const Screen = s.Screen;
              return (
                <div key={s.num} aria-hidden={k !== idx}
                  className="absolute transition-opacity duration-500 ease-out"
                  style={{ opacity: k === idx ? 1 : 0, transform: `scale(${scale})`, pointerEvents: k === idx ? "auto" : "none" }}>
                  <Screen />
                </div>
              );
            })}
          </div>

          {/* dots + progress */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {PORTAL_SCREENS.map((s, k) => (
              <button key={s.num} onClick={() => goTo(k)} aria-label={`Go to ${s.tag}`}
                className={"h-1.5 rounded-full transition-all " + (k === idx ? "w-6 bg-gold" : "w-1.5 bg-white/25 hover:bg-white/50")} />
            ))}
          </div>

          {/* exit cue -> the existing offer */}
          <div className="mt-3 h-9">
            {last ? (
              <div className="flex items-center gap-3">
                <a href="#programmes" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[0.8rem] font-bold text-ink transition hover:bg-[#f0d783]">
                  See the packages
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <Link href="/studio" className="text-[0.8rem] font-semibold text-ivory/75 underline decoration-gold decoration-2 underline-offset-4 hover:text-ivory">Book a trial</Link>
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ivory/40">
                Swipe to explore
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="animate-bounce"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
