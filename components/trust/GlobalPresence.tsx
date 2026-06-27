"use client";

import { useState } from "react";
import { TrustSubsection } from "./TrustSubsection";
import { WorldMapShape } from "@/components/ui/WorldMap";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

interface Place { name: string; x: number; y: number; hub?: boolean; }

const PLACES: Place[] = [
  { name: "India", x: 70, y: 44, hub: true },
  { name: "Dubai", x: 64.5, y: 43 },
  { name: "United Kingdom", x: 49.8, y: 23 },
  { name: "Canada", x: 20.8, y: 20 },
  { name: "Malaysia", x: 76.5, y: 56 },
  { name: "Singapore", x: 77.8, y: 61 },
  { name: "Australia", x: 86, y: 75 },
];

export function GlobalPresence() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <TrustSubsection
      eyebrow="Section 08 · Global Presence"
      title="Built to operate internationally."
      intro="Teaching across cities. Expanding globally — with the systems already in place to support it. Hover a marker to explore."
    >
      <Reveal>
        <div className="relative mx-auto aspect-[1000/480] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-midnight">
          <WorldMapShape
            className="absolute inset-0 h-full w-full"
            fill="rgba(246,244,239,0.04)"
            stroke="rgba(246,244,239,0.12)"
          />
          {PLACES.map((p) => {
            const active = hover === p.name || p.hub;
            return (
              <button
                key={p.name}
                type="button"
                onMouseEnter={() => setHover(p.name)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.name)}
                onBlur={() => setHover(null)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                aria-label={p.name}
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    p.hub ? "h-3.5 w-3.5 bg-gold shadow-[0_0_14px_rgba(201,162,39,0.9)]" : "h-2.5 w-2.5",
                    !p.hub && (active ? "bg-gold shadow-[0_0_12px_rgba(201,162,39,0.8)]" : "bg-paper/30 ring-1 ring-gold/30")
                  )}
                />
                <span
                  className={cn(
                    "absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium transition-opacity",
                    p.hub ? "text-gold opacity-100" : active ? "text-paper opacity-100" : "text-paper/50 opacity-0"
                  )}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>
      <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-paper/60">
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> Live — India &amp; online</span>
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-paper/30 ring-1 ring-gold/30" /> Future expansion</span>
      </div>
    </TrustSubsection>
  );
}
