"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", id: "overview" },
  { label: "Classes", id: "classes" },
  { label: "Stories", id: "stories" },
  { label: "Reviews", id: "reviews" },
  { label: "Standards", id: "standards" },
  { label: "Partners", id: "partners" },
];

/** Sticky, scrollable in-page tabs. Mobile only. */
export function MobileTabs() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="sticky top-16 z-30 border-y border-hairline bg-paper/95 backdrop-blur-md lg:hidden" aria-label="Sections">
      <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            onClick={() => setActive(t.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              active === t.id ? "bg-ink text-paper" : "text-ink/55"
            )}
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
