"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Sticky mobile CTA bar — WhatsApp-first (the primary conversion path), with a
 * small "Free trial" secondary. Appears once the hero has scrolled away.
 */
export function StickyTrialBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur-md transition-transform duration-300 lg:hidden",
        show ? "translate-y-0" : "translate-y-full"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <a
          href={whatsappLink("Hi Musicphonetics, I'd like to know more about music classes.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z" />
          </svg>
          Enquire on WhatsApp
        </a>
        <Link
          href="/start"
          className="grid min-h-[48px] shrink-0 place-items-center rounded-full border border-white/20 px-4 text-xs font-semibold text-paper/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Free trial
        </Link>
      </div>
    </div>
  );
}
