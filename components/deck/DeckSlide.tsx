"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// One cinematic full-screen slide. GUARANTEED FIT: it's exactly one screen tall,
// pads clear of the fixed header (ticker+nav) and the bottom trial bar, centres
// its content, and if content ever exceeds the space on a tiny phone it scrolls
// INSIDE the slide, so nothing is ever cut. When it becomes the active slide it
// gets .is-active, which fires the background depth-in and the staggered reveals.
export function DeckSlide({ children, className, bg, contentClassName, align = "center", maxW = "max-w-lg" }: {
  children: React.ReactNode; className?: string; bg?: React.ReactNode; contentClassName?: string;
  align?: "center" | "end"; maxW?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting && e.intersectionRatio >= 0.5),
      { threshold: [0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} data-slide className={cn("deck-slide relative flex h-[100svh] flex-col overflow-hidden", active && "is-active", className)}>
      {bg && <div className="deck-bg pointer-events-none absolute inset-0">{bg}</div>}
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pt-[calc(4rem+1.75rem+0.75rem)] pb-[calc(5rem+0.75rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={cn("w-full", maxW, align === "end" ? "mb-2 mt-auto" : "m-auto", contentClassName)}>{children}</div>
      </div>
    </section>
  );
}
