"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { JourneyScreen, HomeScreen, LessonPlanScreen, ProgressScreen, FeesScreen, AskScreen } from "./frames";
import { PortalReport } from "./PortalReport";

// THE MUSICPHONETICS STUDENT PORTAL, revealed as a cinematic, scroll-scrubbed
// product story. The section pins to the viewport; the visitor's own scroll
// scrubs a continuous timeline (like scrubbing a video), so each screen scales,
// rises and cross-fades into the next: it feels like going deeper into one
// system, not flipping through cards. The Monthly Report is the climax, a
// full-width document that scrolls through itself. After the seventh reveal the
// section releases into the existing packages / reviews / CTA flow.
//
// Performance: the screens render ONCE; a single rAF loop writes transforms
// straight to the DOM (no per-frame React). prefers-reduced-motion falls back to
// a plain stacked layout.

const PHONE_W = 316;
const PHONE_H = 606;
const PER_UNIT = 60; // svh of scroll travel per unit of chapter weight

type Chapter =
  | { kind: "intro"; weight: number }
  | { kind: "screen"; weight: number; num: string; title: string; blurb: string; Comp: () => JSX.Element }
  | { kind: "report"; weight: number; num: string; title: string; blurb: string }
  | { kind: "outro"; weight: number };

const CHAPTERS: Chapter[] = [
  { kind: "intro", weight: 0.8 },
  { kind: "screen", weight: 1, num: "01", title: "See the journey.", blurb: "Every learner has a structured path, with goals, classes and milestones.", Comp: JourneyScreen },
  { kind: "screen", weight: 1, num: "02", title: "Everything, in one place.", blurb: "Classes, updates, homework, reports and support, without digging through endless messages.", Comp: HomeScreen },
  { kind: "screen", weight: 1, num: "03", title: "Every class has a purpose.", blurb: "Every month has a direction. Every class moves the learner towards it.", Comp: LessonPlanScreen },
  { kind: "screen", weight: 1, num: "04", title: "Know where they stand.", blurb: "Parents should not have to ask how it is going. They can see it.", Comp: ProgressScreen },
  { kind: "report", weight: 2.2, num: "05", title: "Progress, documented.", blurb: "Every month, a clear picture of what your child learned, achieved and works on next." },
  { kind: "screen", weight: 1, num: "06", title: "No guesswork.", blurb: "See what you have paid for, how many classes remain and when the next fee is due.", Comp: FeesScreen },
  { kind: "screen", weight: 1, num: "07", title: "Questions? Just ask.", blurb: "Instant guidance about the curriculum, classes and the Musicphonetics learning system.", Comp: AskScreen },
  { kind: "outro", weight: 0.8 },
];

const TOTAL_W = CHAPTERS.reduce((s, c) => s + c.weight, 0);
const smoother = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function PortalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const reportWinRef = useRef<HTMLDivElement>(null);
  const reportInnerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [num, setNum] = useState("01");
  const [reduce, setReduce] = useState(false);

  // Cumulative band geometry for each chapter.
  const bands = useMemo(() => {
    let acc = 0;
    return CHAPTERS.map((c) => {
      const start = acc / TOTAL_W;
      acc += c.weight;
      const end = acc / TOTAL_W;
      const center = (start + end) / 2;
      const half = (end - start) / 2;
      return { start, end, center, influence: half * 1.7 };
    });
  }, []);

  useEffect(() => { setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  useEffect(() => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;

    const fit = () => {
      const h = window.innerHeight, w = window.innerWidth;
      setScale(clamp(Math.min((h - 300) / PHONE_H, (w - 36) / PHONE_W), 0.5, 1.12));
    };
    fit();

    let raf = 0;
    let lastNum = "";
    const frame = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, total);
      const p = total > 0 ? scrolled / total : 0;

      let bestVis = 0, bestNum = "";
      CHAPTERS.forEach((c, i) => {
        const wrap = wraps.current[i];
        if (!wrap) return;
        const b = bands[i];
        const u = (p - b.center) / b.influence;
        const au = Math.abs(u);
        const vis = 1 - smoother(0.55, 1.12, au);
        if (vis <= 0.008) { wrap.style.visibility = "hidden"; wrap.style.opacity = "0"; return; }
        wrap.style.visibility = "visible";
        wrap.style.opacity = String(vis);
        wrap.style.pointerEvents = vis > 0.6 ? "auto" : "none";
        if (c.kind === "report") {
          const win = reportWinRef.current, inner = reportInnerRef.current;
          if (win && inner) {
            const maxScroll = Math.max(0, inner.offsetHeight - win.clientHeight);
            const sp = clamp((u + 0.55) / 1.1, 0, 1);
            inner.style.transform = `translateY(${-sp * maxScroll}px)`;
          }
          wrap.style.transform = `translateY(${-u * 18}px)`;
        } else {
          const depth = u < 0 ? 0.9 + 0.1 * (1 + clamp(u, -1, 0)) : 1 + 0.08 * clamp(u, 0, 1);
          wrap.style.transform = `translateY(${-u * 26}px) scale(${depth})`;
        }
        if (vis > bestVis) { bestVis = vis; bestNum = (c.kind === "screen" || c.kind === "report") ? c.num : ""; }
      });

      if (bestNum !== lastNum) { lastNum = bestNum; setNum(bestNum); }
      if (railRef.current) railRef.current.style.height = `${Math.round(p * 100)}%`;
      document.body.classList.toggle("mp-portal-pinned", rect.top <= 1 && rect.bottom >= window.innerHeight - 1);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { fit(); onScroll(); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      document.body.classList.remove("mp-portal-pinned");
    };
  }, [reduce, bands]);

  // ---- reduced-motion / no-JS friendly fallback: a plain stacked layout ----
  if (reduce) {
    return (
      <section id="portal" className="no-cv bg-charcoal py-20">
        <div className="container-mp">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gold">The Musicphonetics Student Portal</p>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,5vw,2.6rem)] font-medium text-ivory">Your child&apos;s music journey. Finally, visible.</h2>
          </div>
          <div className="mt-12 space-y-16">
            {CHAPTERS.map((c, i) => c.kind === "screen" ? (
              <div key={i} className="text-center">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">{c.num} · {c.title}</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ivory/60">{c.blurb}</p>
                <div className="mt-6 flex justify-center"><c.Comp /></div>
              </div>
            ) : c.kind === "report" ? (
              <div key={i} className="text-center">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">{c.num} · {c.title}</p>
                <div className="mt-6"><PortalReport /></div>
              </div>
            ) : null)}
          </div>
        </div>
      </section>
    );
  }

  // ---- the cinematic scrubbed reveal --------------------------------------
  return (
    <section ref={sectionRef} id="portal" className="no-cv relative bg-charcoal" style={{ height: `${100 + TOTAL_W * PER_UNIT}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-8%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gold/[0.08] blur-[130px]" />
        </div>

        {/* subtle progress rail (right) */}
        <div className="pointer-events-none absolute right-4 top-1/2 z-30 hidden h-40 w-px -translate-y-1/2 bg-white/10 sm:block">
          <div ref={railRef} className="w-px bg-gold" style={{ height: "0%" }} />
        </div>
        {/* subtle counter (bottom) */}
        {num && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[1.4rem] z-30 text-center text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold/80">
            <span className="tabular-nums">{num}</span> <span className="text-ivory/30">/ 07</span>
          </div>
        )}

        {/* stacked chapters */}
        <div className="absolute inset-0">
          {CHAPTERS.map((c, i) => (
            <div key={i} ref={(el) => { wraps.current[i] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-[6.5rem] pb-[calc(1.25rem+env(safe-area-inset-bottom))] will-change-[transform,opacity]"
              style={{ opacity: 0 }}>
              {c.kind === "intro" && (
                <div className="max-w-lg text-center">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold">The Musicphonetics Student Portal</p>
                  <h2 className="mt-4 font-display text-[clamp(2rem,7vw,3.4rem)] font-semibold leading-[1.03] text-ivory">
                    What if you could<br /><span className="text-gold">see your child learn?</span>
                  </h2>
                  <p className="mx-auto mt-4 max-w-sm text-[0.95rem] leading-relaxed text-ivory/60">We don&apos;t just teach music. We build a journey you can watch unfold. Scroll to step inside.</p>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ivory/40">
                    Scroll to enter
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="animate-bounce"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </div>
              )}

              {c.kind === "screen" && (
                <>
                  <div className="max-w-md text-center">
                    <h3 className="font-display text-[clamp(1.4rem,5vw,2.1rem)] font-semibold leading-tight text-ivory">{c.title}</h3>
                    <p className="mx-auto mt-1.5 max-w-sm text-[0.85rem] leading-snug text-ivory/60">{c.blurb}</p>
                  </div>
                  <div className="mt-4 origin-center" style={{ transform: `scale(${scale})` }}><c.Comp /></div>
                </>
              )}

              {c.kind === "report" && (
                <>
                  <div className="max-w-md text-center">
                    <h3 className="font-display text-[clamp(1.4rem,5vw,2.1rem)] font-semibold leading-tight text-ivory">{c.title}</h3>
                    <p className="mx-auto mt-1.5 max-w-sm text-[0.85rem] leading-snug text-ivory/60">{c.blurb}</p>
                  </div>
                  <div ref={reportWinRef} className="relative mt-4 w-full max-w-[600px] flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_7%,#000_93%,transparent)]">
                    <div ref={reportInnerRef} className="absolute inset-x-0 top-0 will-change-transform"><PortalReport /></div>
                  </div>
                </>
              )}

              {c.kind === "outro" && (
                <div className="max-w-lg text-center">
                  <h2 className="font-display text-[clamp(1.9rem,6.5vw,3rem)] font-semibold leading-[1.05] text-ivory">More than 8 classes.</h2>
                  <p className="mx-auto mt-4 max-w-md text-[0.98rem] leading-relaxed text-ivory/65">Personal mentorship, a structured curriculum, and a system that lets you see the journey, every step of the way.</p>
                  <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a href="#programmes" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-[#f0d783]">
                      See the packages
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>
                    <Link href="/studio" className="text-sm font-semibold text-ivory/80 underline decoration-gold decoration-2 underline-offset-[6px] hover:text-ivory">Book a free trial</Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
