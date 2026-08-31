"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LessonPlanScreen, ProgressScreen, HomeScreen, JourneyScreen } from "./frames";
import { PortalReport } from "./PortalReport";

// THE MUSICPHONETICS PORTAL, as a full-screen horizontal book. Each page is a
// complete 100vw x 100svh composition. One deliberate horizontal swipe advances
// exactly one page and snaps; neighbours are never shown. Native horizontal
// scroll-snap does the paging (touch-action: pan-x, so a vertical drag simply
// scrolls the page onward and the visitor is never trapped). A thin gold line is
// the only indicator; an "Explore" cue shows on the first page until they move.

type Page =
  | { kind: "intro" }
  | { kind: "screen"; title: string; blurb: string; Comp: () => JSX.Element }
  | { kind: "report"; title: string; blurb: string }
  | { kind: "cta" };

const PAGES: Page[] = [
  { kind: "intro" },
  { kind: "screen", title: "Every lesson has a purpose.", blurb: "Every month has a direction, and every class moves the learner towards it.", Comp: LessonPlanScreen },
  { kind: "report", title: "Progress, documented.", blurb: "Every month, a clear picture of what your child learned and achieved." },
  { kind: "screen", title: "Goals, made visible.", blurb: "See what is done, what is next, and how the journey is going.", Comp: ProgressScreen },
  { kind: "screen", title: "Everything in one place.", blurb: "Classes, updates, homework, reports and fees, without the endless messages.", Comp: HomeScreen },
  { kind: "screen", title: "Parents stay informed.", blurb: "A calm, living view of your child's progress, updated after every class.", Comp: JourneyScreen },
  { kind: "cta" },
];
const N = PAGES.length;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function PortalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const scRef = useRef<HTMLDivElement>(null);
  const cool = useRef(false);
  const [idx, setIdx] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [phone, setPhone] = useState(0.85);
  const [avail, setAvail] = useState(520);

  const fit = useCallback(() => {
    const h = window.innerHeight, w = window.innerWidth;
    const a = Math.max(360, h - 320); // room below the nav + headline + progress line
    setAvail(a);
    setPhone(clamp(Math.min(a / 606, (w - 48) / 300), 0.5, 1));
  }, []);

  const goTo = useCallback((i: number) => {
    const sc = scRef.current;
    if (!sc) return;
    sc.scrollTo({ left: clamp(i, 0, N - 1) * sc.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    fit();
    const sc = scRef.current;
    if (!sc) return;
    let raf = 0;
    const onScroll = () => {
      if (sc.scrollLeft > 4) setInteracted(true);
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; setIdx(Math.round(sc.scrollLeft / Math.max(1, sc.clientWidth))); });
    };
    const onResize = () => { fit(); };
    sc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Hide the site's fixed mobile trial bar while the portal owns the screen,
    // so nothing covers the pages (the bar returns as you scroll on).
    const onWinScroll = () => {
      const sec = sectionRef.current; if (!sec) return;
      const r = sec.getBoundingClientRect();
      const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      document.body.classList.toggle("mp-portal-pinned", visible > window.innerHeight * 0.72);
    };
    onWinScroll();
    window.addEventListener("scroll", onWinScroll, { passive: true });

    // Mobile: axis-locked horizontal paging. A vertical drag is left to the
    // native page scroll (touch-action: pan-y), so the reader can always leave.
    // A clearly horizontal drag is captured: the finger drives it, then it snaps
    // to exactly one page on release. No diagonal drift, no multi-page skip.
    let x0 = 0, y0 = 0, startLeft = 0, axis: "h" | "v" | null = null, lastX = 0, lastT = 0, vx = 0;
    const onTS = (e: TouchEvent) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; startLeft = sc.scrollLeft; axis = null; lastX = t.clientX; lastT = performance.now(); vx = 0; };
    const onTM = (e: TouchEvent) => {
      const t = e.touches[0]; const dx = t.clientX - x0, dy = t.clientY - y0;
      if (axis === null) { if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v"; }
      if (axis !== "h") return;
      e.preventDefault();
      sc.scrollLeft = startLeft - dx;
      const now = performance.now(), dt = now - lastT; if (dt > 0) { vx = (t.clientX - lastX) / dt; lastX = t.clientX; lastT = now; }
    };
    const onTE = () => {
      if (axis !== "h") return;
      const w = sc.clientWidth, start = Math.round(startLeft / w);
      let target = Math.round(sc.scrollLeft / w);
      if (Math.abs(vx) > 0.3) target = start + (vx < 0 ? 1 : -1);
      target = clamp(clamp(target, start - 1, start + 1), 0, N - 1);
      sc.scrollTo({ left: target * w, behavior: "smooth" });
      axis = null;
    };
    sc.addEventListener("touchstart", onTS, { passive: true });
    sc.addEventListener("touchmove", onTM, { passive: false });
    sc.addEventListener("touchend", onTE, { passive: true });

    // Desktop: wheel/trackpad pages one at a time while the section fills the
    // viewport, and releases at the ends so the page scrolls on normally.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onWheel = (e: WheelEvent) => {
      if (!fine) return;
      const sec = sectionRef.current; if (!sec) return;
      const r = sec.getBoundingClientRect();
      if (!(r.top <= 2 && r.bottom >= window.innerHeight - 2)) return; // only when it owns the screen
      const dir = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? Math.sign(e.deltaX) : Math.sign(e.deltaY);
      if (dir === 0) return;
      const cur = Math.round(sc.scrollLeft / Math.max(1, sc.clientWidth));
      if ((dir > 0 && cur >= N - 1) || (dir < 0 && cur <= 0)) return; // release
      e.preventDefault();
      if (cool.current) return;
      cool.current = true; window.setTimeout(() => { cool.current = false; }, 480);
      goTo(cur + dir);
    };
    const onKey = (e: KeyboardEvent) => {
      const sec = sectionRef.current; if (!sec) return;
      const r = sec.getBoundingClientRect();
      if (!(r.top <= 4 && r.bottom >= window.innerHeight - 4)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.round(sc.scrollLeft / sc.clientWidth) + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(Math.round(sc.scrollLeft / sc.clientWidth) - 1); }
    };
    sc.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      sc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onWinScroll);
      sc.removeEventListener("touchstart", onTS);
      sc.removeEventListener("touchmove", onTM);
      sc.removeEventListener("touchend", onTE);
      sc.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("mp-portal-pinned");
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fit, goTo]);

  const Phone = ({ Comp }: { Comp: () => JSX.Element }) => (
    <div style={{ width: 300 * phone, height: 606 * phone }} className="relative">
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${phone})` }}><Comp /></div>
    </div>
  );

  return (
    <section ref={sectionRef} id="portal" className="no-cv relative h-[100svh] overflow-hidden bg-paper">
      <div ref={scRef} className="portal-pager flex h-full overflow-x-auto overflow-y-hidden" style={{ touchAction: "pan-y", scrollbarWidth: "none", overscrollBehaviorX: "contain" }}>
        {PAGES.map((pg, i) => (
          <div key={i} data-active={i === idx ? "" : undefined}
            className="page relative flex h-full w-full shrink-0 flex-col items-center justify-center px-6 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3rem))] text-center">
            {pg.kind === "intro" && (
              <div className="max-w-lg">
                <p data-stag className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-deep-gold">Musicphonetics Portal</p>
                <h2 data-stag className="mt-4 font-display text-[clamp(2.1rem,8vw,3.4rem)] font-semibold leading-[1.04] text-ink">
                  Your child&apos;s music journey.
                  <span className="mt-1 block font-script text-[1.12em] font-bold text-gold">Finally visible.</span>
                </h2>
                <p data-stag className="mx-auto mt-5 max-w-sm text-[1rem] leading-relaxed text-ink/60">
                  Everything from lessons and goals to progress, reports and fees, in one place.
                </p>
              </div>
            )}

            {pg.kind === "screen" && (
              <>
                <div className="max-w-md">
                  <h3 data-stag className="font-display text-[clamp(1.5rem,5.5vw,2.2rem)] font-semibold leading-tight text-ink">{pg.title}</h3>
                  <p data-stag className="mx-auto mt-2 max-w-sm text-[0.92rem] leading-snug text-ink/55">{pg.blurb}</p>
                </div>
                <div data-stag className="mt-6 flex justify-center"><Phone Comp={pg.Comp} /></div>
              </>
            )}

            {pg.kind === "report" && (
              <>
                <div className="max-w-md">
                  <h3 data-stag className="font-display text-[clamp(1.5rem,5.5vw,2.2rem)] font-semibold leading-tight text-ink">{pg.title}</h3>
                  <p data-stag className="mx-auto mt-2 max-w-sm text-[0.92rem] leading-snug text-ink/55">{pg.blurb}</p>
                </div>
                <div data-stag className="relative mt-6 w-full">
                  <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2 h-40 w-[80%] max-w-[420px] -translate-x-1/2 rounded-full bg-gold/10 blur-2xl" />
                  <div style={{ height: avail, maxWidth: 440 }} className="relative mx-auto w-full overflow-hidden rounded-[1.5rem] shadow-[0_30px_80px_-40px_rgba(22,27,38,0.55)] [mask-image:linear-gradient(to_bottom,#000_88%,transparent)]">
                    <div className="absolute inset-x-0 top-0"><PortalReport /></div>
                  </div>
                </div>
              </>
            )}

            {pg.kind === "cta" && (
              <div className="max-w-md">
                <p data-stag className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-deep-gold">The difference</p>
                <h2 data-stag className="mt-4 font-display text-[clamp(2rem,7vw,3rem)] font-semibold leading-[1.05] text-ink">Ready to begin?</h2>
                <p data-stag className="mx-auto mt-4 max-w-sm text-[1rem] leading-relaxed text-ink/60">Not just music lessons. A complete learning journey you can actually see.</p>
                <div data-stag className="mt-8">
                  <Link href="/studio" className="inline-flex items-center gap-2 rounded-full bg-charcoal px-9 py-4 text-base font-semibold text-cream shadow-[0_18px_44px_-14px_rgba(22,27,38,0.55)] transition hover:brightness-125">
                    Start their journey
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Explore cue: only the first page, only until they move. */}
            {pg.kind === "intro" && !interacted && (
              <div className="pointer-events-none absolute bottom-[max(3.4rem,calc(env(safe-area-inset-bottom)+2.6rem))] left-1/2 flex -translate-x-1/2 items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink/40">
                Explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="portal-nudge"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* thin progress line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.3rem,env(safe-area-inset-bottom))] z-20 flex justify-center">
        <div className="h-[3px] w-[38%] max-w-[220px] overflow-hidden rounded-full bg-ink/12">
          <div className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out" style={{ width: `${((idx + 1) / N) * 100}%` }} />
        </div>
      </div>

      <style jsx>{`
        .portal-pager::-webkit-scrollbar { display: none; }
        .page [data-stag] { opacity: 0; transform: translateY(12px); transition: opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1); }
        .page[data-active] [data-stag] { opacity: 1; transform: none; }
        .page[data-active] [data-stag]:nth-child(2) { transition-delay: .06s; }
        .page[data-active] [data-stag]:nth-child(3) { transition-delay: .12s; }
        .page[data-active] [data-stag]:nth-child(4) { transition-delay: .18s; }
        @keyframes portalNudge { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
        .portal-nudge { animation: portalNudge 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .page [data-stag] { opacity: 1; transform: none; transition: none; }
          .portal-nudge { animation: none; }
        }
      `}</style>
    </section>
  );
}
