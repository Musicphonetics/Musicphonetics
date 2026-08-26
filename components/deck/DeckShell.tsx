"use client";

import { useEffect, useState } from "react";

// Turns the homepage into a full-page "deck": one flick / one dot = one page.
// It flags <html data-deck> (which switches the site's gentle proximity snap to
// full mandatory page-snap, scoped to this page only, see globals.css) and
// renders a right-side dot rail that tracks and jumps between panels. The window
// stays the scroller, so the navbar, ticker and footer keep working normally.
export function DeckShell({ children }: { children: React.ReactNode }) {
  const [panels, setPanels] = useState<HTMLElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-deck", "1");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));
    setPanels(els);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = els.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        });
      },
      { threshold: 0.55 },
    );
    els.forEach((el) => io.observe(el));
    return () => { io.disconnect(); root.removeAttribute("data-deck"); };
  }, []);

  const jump = (i: number) => panels[i]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      {children}
      {panels.length > 1 && (
        <div className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex">
          {panels.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => jump(i)}
              aria-label={`Go to section ${i + 1}`}
              aria-current={i === active}
              className={
                "rounded-full border transition-all duration-300 " +
                (i === active ? "h-3 w-3 border-gold bg-gold shadow-[0_0_10px_rgba(231,203,110,0.7)]" : "h-2 w-2 border-white/40 bg-transparent hover:bg-white/40")
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
