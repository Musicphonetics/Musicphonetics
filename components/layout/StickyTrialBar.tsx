"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky mobile action bar (app pattern). One clear action that leads into the
 * programmes, matching the hero. Appears once the hero has scrolled away.
 */
export function StickyTrialBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line/15 bg-charcoal/90 backdrop-blur-md transition-transform duration-300 lg:hidden",
        show ? "translate-y-0" : "translate-y-full"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="px-4 py-3">
        <a
          href="#programmes"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-medium text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Explore programmes
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>
    </div>
  );
}
