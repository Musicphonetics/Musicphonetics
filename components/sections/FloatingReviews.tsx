"use client";

import { useEffect, useState } from "react";
import { HERO_REVIEWS } from "@/lib/data";
import { cn } from "@/lib/utils";

function Stars() {
  return (
    <span className="text-sm tracking-tight text-gold" aria-label="5 out of 5 stars">
      {"★★★★★"}
    </span>
  );
}

function ReviewCard({
  offset,
  delay,
  position,
}: {
  offset: number;
  delay: number;
  position: string;
}) {
  const [i, setI] = useState(offset);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    // Stamp the VERIFIED badge shortly after appearing
    const s = setTimeout(() => setStamped(true), 500);
    // Rotate to a new review on an interval (re-stamps each time)
    const rot = setInterval(() => {
      setStamped(false);
      setI((prev) => (prev + 1) % HERO_REVIEWS.length);
      setTimeout(() => setStamped(true), 450);
    }, 5200);
    return () => {
      clearTimeout(s);
      clearInterval(rot);
    };
  }, []);

  const r = HERO_REVIEWS[i];

  return (
    <div
      className={cn(
        "mp-glass mp-float pointer-events-none absolute w-60 rounded-2xl p-4 shadow-card-hover",
        position
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <Stars />
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-feature-green/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 transition-all",
            stamped ? "mp-stamp opacity-100" : "opacity-0"
          )}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Verified
        </span>
      </div>
      <p className="mt-2 text-sm leading-snug text-paper/90">“{r.quote}”</p>
      <p className="mt-2 text-xs text-paper/55">{r.author}</p>
    </div>
  );
}

/** Up to two floating, rotating verified-review cards. Desktop only. */
export function FloatingReviews({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <ReviewCard offset={0} delay={0} position="right-[2%] top-[14%]" />
      <ReviewCard offset={2} delay={1400} position="left-[1%] bottom-[16%]" />
    </div>
  );
}
