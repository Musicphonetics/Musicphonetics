"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// A focused horizontal carousel: one full-width card in view at a time, swipe to
// move, dots below. Used inside a slide so fees / reviews fit one screen and the
// viewer flips through them one at a time.
export function DeckCarousel({ children, count }: { children: React.ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const step = () => {
    const el = ref.current; if (!el) return 0;
    const card = el.querySelector<HTMLElement>("[data-card]");
    return card ? card.offsetWidth + 16 : el.scrollWidth / Math.max(1, count);
  };
  const onScroll = () => { const el = ref.current; if (!el) return; setActive(Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / (step() || 1))))); };
  const to = (i: number) => ref.current?.scrollTo({ left: i * step(), behavior: "smooth" });

  return (
    <div>
      <div ref={ref} onScroll={onScroll} className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {count > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button key={i} type="button" aria-label={`Show ${i + 1}`} onClick={() => to(i)}
              className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-gold" : "w-1.5 bg-white/25 hover:bg-white/40")} />
          ))}
        </div>
      )}
    </div>
  );
}
