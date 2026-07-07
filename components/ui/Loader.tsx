"use client";

import { useEffect, useState } from "react";

/**
 * Premium one-time loading reveal: animated seal + soundwave + brand line.
 * - Shows once per browser session (sessionStorage), so navigation is instant.
 * - Skipped entirely under reduced-motion.
 * - Overlay only; the real page renders underneath (SEO-safe).
 */
export function Loader() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem("mp-loaded") === "true") return;

    setShow(true);
    document.body.style.overflow = "hidden";

    // Kept deliberately brief - reel visitors want the hero instantly. A quick
    // premium flash that masks the first hero image loading, not a wall.
    const leaveAt = setTimeout(() => setLeaving(true), 500);
    const doneAt = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("mp-loaded", "true");
      document.body.style.overflow = "";
    }, 850);

    return () => {
      clearTimeout(leaveAt);
      clearTimeout(doneAt);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-ink transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="flex flex-col items-center">
        {/* Animated seal */}
        <span className="grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-deep-gold">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V6l10-2v11" stroke="#C9A227" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="2.4" stroke="#C9A227" strokeWidth="1.6" />
            <circle cx="16" cy="15" r="2.4" stroke="#C9A227" strokeWidth="1.6" />
          </svg>
        </span>

        {/* Soundwave (visual only) */}
        <div className="mt-6 flex h-8 items-end gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-gold/80"
              style={{
                animation: "mp-wave 1s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
                height: "100%",
              }}
            />
          ))}
        </div>

        <p className="mt-6 font-display text-lg font-semibold text-paper">
          Musicphonetics
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-paper/50">
          Music should never feel random
        </p>
      </div>
    </div>
  );
}
