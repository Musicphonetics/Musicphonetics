"use client";

import { useEffect, useState } from "react";

/**
 * Cycles through a list of words with a soft fade/slide.
 * Pauses under reduced-motion (shows the first word statically).
 */
export function RotatingWords({
  words,
  interval = 2200,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={className} aria-live="polite">
      {words.map((word, i) => (
        <span
          key={word}
          className="absolute left-0 transition-all duration-500"
          style={{
            opacity: i === index ? 1 : 0,
            transform: i === index ? "translateY(0)" : "translateY(0.4em)",
          }}
          aria-hidden={i !== index}
        >
          {word}
        </span>
      ))}
      {/* Reserve width using the longest word (invisible) */}
      <span className="invisible">
        {words.reduce((a, b) => (a.length >= b.length ? a : b), "")}
      </span>
    </span>
  );
}
