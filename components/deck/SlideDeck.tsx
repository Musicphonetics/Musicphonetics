"use client";

import { useEffect, useState } from "react";

// Wraps the bespoke slides: flags <html data-deck> (full-page mandatory snap,
// scoped to this page) and renders a right-side dot rail that tracks the active
// slide and jumps between them. Window stays the scroller, so nav/ticker work.
export function SlideDeck({ children }: { children: React.ReactNode }) {
  const [slides, setSlides] = useState<HTMLElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-deck", "1");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));
    setSlides(els);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0) setActive(i);
        }
      }),
      { threshold: [0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => { io.disconnect(); root.removeAttribute("data-deck"); };
  }, []);

  return (
    <>
      {children}
      {slides.length > 1 && (
        <div className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex">
          {slides.map((_, i) => (
            <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} aria-current={i === active}
              onClick={() => slides[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={"rounded-full border transition-all duration-300 " + (i === active ? "h-3 w-3 border-gold bg-gold shadow-[0_0_12px_rgba(231,203,110,0.8)]" : "h-2 w-2 border-white/40 bg-transparent hover:bg-white/50")} />
          ))}
        </div>
      )}
    </>
  );
}
