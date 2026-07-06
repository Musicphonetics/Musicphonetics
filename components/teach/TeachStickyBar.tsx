"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Smooth-scroll to a section id, respecting reduced-motion.
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function TeachStickyBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop — slim sticky top bar */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-40 hidden border-b border-white/10 bg-ink/95 backdrop-blur-md transition-transform duration-300 lg:block",
          show ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container-mp flex items-center justify-between py-3">
          <p className="text-sm text-paper/85">
            <span className="font-semibold text-gold">Teach with Musicphonetics</span>
            <span className="text-paper/50"> · You keep 70%. We run everything else.</span>
          </p>
          <button
            type="button"
            onClick={() => scrollToId("apply")}
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-ink transition-all hover:bg-deep-gold hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Apply to Teach
          </button>
        </div>
      </div>

      {/* Mobile — fixed bottom CTA bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur-md transition-transform duration-300 lg:hidden",
          show ? "translate-y-0" : "translate-y-full"
        )}
      >
        <button
          type="button"
          onClick={() => scrollToId("apply")}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Apply to Teach →
        </button>
      </div>
    </>
  );
}
