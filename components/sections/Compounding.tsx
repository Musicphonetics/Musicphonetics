"use client";

import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

// Qualitative ability (0–100) per month. Illustrates the *principle* that
// consistent, structured practice compounds — no fabricated metrics.
const STRUCTURED = [2, 8, 14, 22, 31, 41, 52, 62, 71, 79, 85, 90, 94];
const RANDOM = [2, 5, 8, 11, 14, 16, 19, 21, 23, 25, 27, 29, 31];

const PAD_X = 7;
const PAD_TOP = 6;
const PAD_BOTTOM = 52;
const X = (m: number) => PAD_X + (m / 12) * (100 - PAD_X * 2);
const Y = (a: number) => PAD_BOTTOM - (a / 100) * (PAD_BOTTOM - PAD_TOP);

const toPath = (arr: number[]) =>
  arr.map((a, m) => `${m === 0 ? "M" : "L"} ${X(m).toFixed(2)} ${Y(a).toFixed(2)}`).join(" ");

const MILESTONES = [
  { m: 1, label: "Month 1", text: "Comfort with the instrument" },
  { m: 3, label: "Month 3", text: "Playing complete songs" },
  { m: 6, label: "Month 6", text: "Confidence in performance" },
  { m: 12, label: "Month 12", text: "A strong musical foundation" },
];

export function Compounding() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section background="ink" spacing="lg">
      <SectionHeading
        eyebrow="The power of compounding"
        title={
          <>
            Small lessons. <span className="mp-shimmer">Massive growth.</span>
          </>
        }
        intro="Structured, consistent practice doesn't add up — it compounds. The gap between scattered learning and a real method widens every single month."
        invert
      />

      <div ref={ref} className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
        {/* Graph */}
        <div className="relative rounded-3xl border border-white/12 bg-white/5 p-5 sm:p-7">
          <svg viewBox="0 0 100 58" className="w-full" role="img" aria-label="Musical ability over 12 months: structured learning compounds far above random learning.">
            {/* Axes */}
            <line x1={PAD_X} y1={PAD_BOTTOM} x2={100 - PAD_X} y2={PAD_BOTTOM} stroke="rgba(246,244,239,0.25)" strokeWidth="0.3" />
            <line x1={PAD_X} y1={PAD_TOP} x2={PAD_X} y2={PAD_BOTTOM} stroke="rgba(246,244,239,0.25)" strokeWidth="0.3" />

            {/* Random curve */}
            <path
              d={toPath(RANDOM)}
              fill="none"
              stroke="rgba(246,244,239,0.45)"
              strokeWidth="0.8"
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: drawn ? 0 : 1,
                transition: "stroke-dashoffset 1.6s ease-out",
              }}
            />
            {/* Structured curve */}
            <path
              d={toPath(STRUCTURED)}
              fill="none"
              stroke="#C9A227"
              strokeWidth="1.3"
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: drawn ? 0 : 1,
                transition: "stroke-dashoffset 1.9s ease-out",
                filter: "drop-shadow(0 0 2px rgba(201,162,39,0.5))",
              }}
            />

            {/* Milestone points */}
            {MILESTONES.map((ms) => (
              <g key={ms.m}>
                <circle
                  cx={X(ms.m)}
                  cy={Y(STRUCTURED[ms.m])}
                  r={active === ms.m ? 2 : 1.4}
                  fill="#161B26"
                  stroke="#C9A227"
                  strokeWidth="0.7"
                  className="cursor-pointer transition-all"
                  style={{ opacity: drawn ? 1 : 0, transition: "opacity 0.4s ease 1.6s" }}
                  onMouseEnter={() => setActive(ms.m)}
                  onMouseLeave={() => setActive(null)}
                  tabIndex={0}
                  onFocus={() => setActive(ms.m)}
                  onBlur={() => setActive(null)}
                />
              </g>
            ))}
          </svg>

          {/* Axis labels */}
          <div className="mt-1 flex justify-between px-3 text-xs text-paper/45">
            <span>Month 1</span>
            <span>6</span>
            <span>12</span>
          </div>
          <p className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-wider text-paper/40">
            Musical ability
          </p>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-5">
            <span className="flex items-center gap-2 text-sm text-paper/80">
              <span className="h-2.5 w-5 rounded-full bg-gold" /> Structured Musicphonetics learning
            </span>
            <span className="flex items-center gap-2 text-sm text-paper/55">
              <span className="h-2.5 w-5 rounded-full bg-paper/40" /> Random learning
            </span>
          </div>
        </div>

        {/* Milestone reveal */}
        <div className="space-y-3">
          {MILESTONES.map((ms) => (
            <button
              key={ms.m}
              type="button"
              onMouseEnter={() => setActive(ms.m)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(ms.m)}
              onBlur={() => setActive(null)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                active === ms.m
                  ? "border-gold bg-gold/10"
                  : "border-white/12 bg-white/5"
              )}
            >
              <span className="font-display text-sm font-semibold text-gold">
                {ms.label}
              </span>
              <span className="text-sm text-paper/80">{ms.text}</span>
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
