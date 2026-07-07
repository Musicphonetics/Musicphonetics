"use client";

import { useMemo, useState } from "react";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Reveal } from "@/components/ui/Reveal";
import { ECOSYSTEM_NODES, ECO_LEGEND } from "@/lib/founder";
import type { EcoNode } from "@/lib/founder";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<EcoNode["status"], string> = {
  current: "bg-gold",
  growing: "bg-emerald-400",
  vision: "bg-paper/40",
};

const STATUS_RING: Record<EcoNode["status"], string> = {
  current: "ring-gold/50",
  growing: "ring-emerald-400/40",
  vision: "ring-white/10",
};

// Split nodes into two concentric rings: real-today on the inner ring,
// long-term vision on the outer ring.
function useRings() {
  return useMemo(() => {
    const inner = ECOSYSTEM_NODES.filter((n) => n.status !== "vision");
    const outer = ECOSYSTEM_NODES.filter((n) => n.status === "vision");
    const place = (nodes: EcoNode[], radius: number, offset = 0) =>
      nodes.map((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2 + offset;
        return {
          ...node,
          x: 50 + radius * Math.cos(angle),
          y: 50 + radius * Math.sin(angle),
        };
      });
    return [...place(inner, 26), ...place(outer, 44, 0.24)];
  }, []);
}

export function Ecosystem() {
  const nodes = useRings();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="ecosystem" className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <AuroraBackground />
      <div className="container-mp relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold">The Musicphonetics Ecosystem</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              One trusted platform. Many connected initiatives.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-paper/70">
              Education is the centre. Over time, everything else connects to it.
              Hover any node to explore - some are real today, others are part of
              the long-term vision.
            </p>
          </div>
        </Reveal>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
          {ECO_LEGEND.map((l) => (
            <span key={l.status} className="flex items-center gap-2 text-sm text-paper/70">
              <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[l.status])} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Desktop / tablet: radial interactive network */}
        <Reveal>
          <div className="relative mx-auto mt-10 hidden aspect-square w-full max-w-3xl sm:block">
            {/* Connecting lines */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {nodes.map((n, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={n.x}
                  y2={n.y}
                  stroke="currentColor"
                  className={cn(
                    "text-gold transition-opacity duration-300",
                    active === null
                      ? "opacity-15"
                      : active === i
                      ? "opacity-80"
                      : "opacity-5"
                  )}
                  strokeWidth={active === i ? 0.5 : 0.3}
                />
              ))}
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="0.2" />
            </svg>

            {/* Center node */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="mp-glass grid h-28 w-28 place-items-center rounded-full text-center shadow-card-hover ring-2 ring-gold/40 sm:h-32 sm:w-32">
                <span className="px-2 font-display text-sm font-semibold leading-tight text-gold sm:text-base">
                  Music&shy;phonetics
                </span>
              </div>
            </div>

            {/* Nodes */}
            {nodes.map((n, i) => (
              <button
                key={n.label}
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ring-1 transition-all duration-300",
                  "mp-glass text-paper/85",
                  STATUS_RING[n.status],
                  active === i ? "z-10 scale-110 text-paper shadow-card-hover" : "scale-100"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[n.status])} />
                  {n.label}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Mobile: readable grid fallback */}
        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:hidden">
          {ECOSYSTEM_NODES.map((n) => (
            <div
              key={n.label}
              className="mp-glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-paper/85"
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[n.status])} />
              {n.label}
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-paper/45">
          Future initiatives are shown as part of the long-term vision, not
          existing operations.
        </p>
      </div>
    </section>
  );
}
