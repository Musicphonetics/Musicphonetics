"use client";

import Link from "next/link";
import { useState } from "react";
import { REGIONS } from "@/lib/teachers";
import { cn } from "@/lib/utils";

/**
 * Interactive region map. Click a region to view its teachers.
 * Active = India (live). Others show "Launching soon" — no faked expansion.
 */
export function RegionMap() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
      {/* Map canvas */}
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-feature-green p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="relative aspect-[2/1] w-full rounded-2xl"
          style={{
            backgroundImage:
              "radial-gradient(rgba(246,244,239,0.18) 1.4px, transparent 1.4px)",
            backgroundSize: "16px 16px",
          }}
        >
          {REGIONS.map((r) => {
            const active = r.status === "active";
            const isHover = hover === r.slug;
            return (
              <Link
                key={r.slug}
                href={`/teachers/${r.slug}`}
                onMouseEnter={() => setHover(r.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(r.slug)}
                onBlur={() => setHover(null)}
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                aria-label={`${r.name} — ${active ? "view teachers" : "launching soon"}`}
              >
                <span className="relative flex items-center justify-center">
                  {active && (
                    <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-gold/50" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex h-4 w-4 rounded-full ring-2 ring-feature-green transition-transform",
                      active ? "bg-gold" : "bg-paper/50",
                      isHover && "scale-125"
                    )}
                  />
                  {/* Tooltip */}
                  <span
                    className={cn(
                      "pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-paper transition-opacity",
                      isHover ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {r.name} · {active ? "Live" : "Soon"}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Region list */}
      <ul className="space-y-2.5">
        {REGIONS.map((r) => {
          const active = r.status === "active";
          return (
            <li key={r.slug}>
              <Link
                href={`/teachers/${r.slug}`}
                onMouseEnter={() => setHover(r.slug)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                  hover === r.slug
                    ? "border-gold bg-gold/5"
                    : "border-hairline bg-white"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      active ? "bg-gold" : "bg-ink/25"
                    )}
                  />
                  <span className="font-medium text-ink">{r.name}</span>
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    active ? "text-feature-green" : "text-ink/45"
                  )}
                >
                  {active ? "Live" : "Launching soon"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
