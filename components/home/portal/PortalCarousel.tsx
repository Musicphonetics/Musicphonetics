"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JourneyScreen, HomeScreen, LessonPlanScreen, ProgressScreen, FeesScreen, AskScreen } from "./frames";
import { PortalReport } from "./PortalReport";

// A calm, self-contained swipe carousel. Native horizontal scroll-snap means a
// touch drag physically follows the finger and snaps on release (the Instagram
// feel), the page still scrolls normally, and nothing is hijacked. Neighbours
// peek and dim; each slide has the same minimal skeleton (number, headline, one
// line, big screenshot). The Report is the larger "wow" slide.

type Slide = { num: string; title: string; blurb: string } & (
  | { kind: "phone"; Comp: () => JSX.Element }
  | { kind: "report" }
);

const SLIDES: Slide[] = [
  { num: "01", title: "See the journey.", blurb: "Every learner has a structured path, with goals, classes and milestones.", kind: "phone", Comp: JourneyScreen },
  { num: "02", title: "Everything, in one place.", blurb: "Classes, updates, homework, reports and more, without endless WhatsApp messages.", kind: "phone", Comp: HomeScreen },
  { num: "03", title: "Every class has a purpose.", blurb: "Every month has a direction. Every class moves the learner towards it.", kind: "phone", Comp: LessonPlanScreen },
  { num: "04", title: "Know where they stand.", blurb: "See what is completed, what is next and how the journey is progressing.", kind: "phone", Comp: ProgressScreen },
  { num: "05", title: "Progress, documented.", blurb: "Every month, a clear picture of what your child learned, achieved and works on next.", kind: "report" },
  { num: "06", title: "No guesswork.", blurb: "Classes, payments and remaining sessions stay clear and connected.", kind: "phone", Comp: FeesScreen },
  { num: "07", title: "Questions? Just ask.", blurb: "Instant guidance about your curriculum, classes and Musicphonetics journey.", kind: "phone", Comp: AskScreen },
];
const N = SLIDES.length;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function PortalCarousel() {
  const scRef = useRef<HTMLDivElement>(null);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [phoneScale, setPhoneScale] = useState(0.85);
  const geo = useRef({ step: 1 });

  const measure = useCallback(() => {
    const sc = scRef.current;
    if (!sc) return;
    const vpW = sc.clientWidth;
    const desk = vpW >= 900;
    const gap = desk ? 32 : 14;
    const peek = desk ? Math.min(vpW * 0.14, 200) : 40; // visible glimpse of neighbours
    const slideW = Math.min(vpW - 2 * (gap + peek), desk ? 740 : 420);
    const pad = Math.max(0, (vpW - slideW) / 2);
    sc.style.paddingLeft = `${pad}px`;
    sc.style.paddingRight = `${pad}px`;
    innerRefs.current.forEach((el) => { const outer = el?.parentElement; if (outer) { outer.style.width = `${slideW}px`; outer.style.marginRight = `${gap}px`; } });
    geo.current.step = slideW + gap;
    const vh = window.innerHeight;
    setPhoneScale(clamp(Math.min((slideW - 24) / 300, (vh * 0.6) / 606), 0.66, desk ? 1 : 0.95));
  }, []);

  // Continuous dim/scale of each slide by distance from the viewport centre, and
  // track the centred slide for the counter and dots.
  const paint = useCallback(() => {
    const sc = scRef.current;
    if (!sc) return;
    const mid = sc.getBoundingClientRect().left + sc.clientWidth / 2;
    let best = 0, bestD = Infinity;
    innerRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = clamp(Math.abs(r.left + r.width / 2 - mid) / geo.current.step, 0, 1);
      el.style.opacity = String(1 - d * 0.62);
      el.style.transform = `scale(${1 - d * 0.06})`;
      const ad = Math.abs(r.left + r.width / 2 - mid);
      if (ad < bestD) { bestD = ad; best = i; }
    });
    setIndex(best);
  }, []);

  useEffect(() => {
    measure(); paint();
    const sc = scRef.current;
    if (!sc) return;
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };
    const onResize = () => { measure(); paint(); };
    sc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { sc.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); if (raf) cancelAnimationFrame(raf); };
  }, [measure, paint]);

  const goTo = useCallback((i: number) => {
    const el = innerRefs.current[clamp(i, 0, N - 1)]?.parentElement;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  // Desktop: click-and-drag to scroll (touch already drags natively).
  useEffect(() => {
    const sc = scRef.current;
    if (!sc) return;
    let down = false, startX = 0, startLeft = 0, moved = false;
    const pd = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; down = true; moved = false; startX = e.clientX; startLeft = sc.scrollLeft; };
    const pm = (e: PointerEvent) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; sc.scrollLeft = startLeft - dx; };
    const pu = () => { if (!down) return; down = false; if (moved) { const i = Math.round(sc.scrollLeft / geo.current.step); goTo(i); } };
    sc.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);
    return () => { sc.removeEventListener("pointerdown", pd); window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", pu); };
  }, [goTo]);

  return (
    <div className="relative">
      {/* arrows (desktop) */}
      <button onClick={() => goTo(index - 1)} aria-label="Previous" disabled={index === 0}
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-hairline bg-white/90 text-ink shadow-sm transition hover:bg-white disabled:opacity-0 lg:grid">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button onClick={() => goTo(index + 1)} aria-label="Next" disabled={index === N - 1}
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-hairline bg-white/90 text-ink shadow-sm transition hover:bg-white disabled:opacity-0 lg:grid">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {/* the snapping track */}
      <div ref={scRef} className="portal-scroller flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth" style={{ scrollbarWidth: "none", touchAction: "pan-x" }}>
        {SLIDES.map((s, i) => (
          <div key={i} className="shrink-0 snap-center">
            <div ref={(el) => { innerRefs.current[i] = el; }} className="origin-center will-change-[transform,opacity]">
              <div className="flex flex-col items-center px-1 text-center">
                <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-deep-gold">
                  <span className="tabular-nums">{s.num}</span><span aria-hidden="true" className="h-px w-5 bg-gold/50" /><span className="tabular-nums text-ink/35">07</span>
                </div>
                <h3 className="mt-2 font-display text-[clamp(1.35rem,4vw,2rem)] font-semibold leading-tight text-ink">{s.title}</h3>
                <p className="mx-auto mt-1.5 max-w-sm text-[0.9rem] leading-snug text-ink/55">{s.blurb}</p>

                <div className="mt-5 flex w-full justify-center">
                  {s.kind === "phone" ? (
                    <div className="origin-top" style={{ transform: `scale(${phoneScale})`, height: 606 * phoneScale }}>
                      <s.Comp />
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <div aria-hidden="true" className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gold/10 blur-2xl" />
                      <div className="relative mx-auto h-[min(640px,74vh)] w-full max-w-[600px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_86%,transparent)]">
                        <PortalReport />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* progress line + dots */}
      <div className="mx-auto mt-8 flex max-w-xs items-center gap-3 px-6">
        <div className="h-px flex-1 bg-ink/10">
          <div className="h-px bg-gold transition-all duration-300" style={{ width: `${((index + 1) / N) * 100}%` }} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${s.num}`}
            className={"h-1.5 rounded-full transition-all " + (i === index ? "w-6 bg-gold" : "w-1.5 bg-ink/20 hover:bg-ink/40")} />
        ))}
      </div>

      <style jsx>{`.portal-scroller::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
