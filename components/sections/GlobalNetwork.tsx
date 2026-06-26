import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { WorldMapShape } from "@/components/ui/WorldMap";
import { cn } from "@/lib/utils";

interface Place {
  name: string;
  x: number; // px on 1000-wide canvas
  y: number; // px on 480-tall canvas
  hub?: boolean;
  region?: string;
  labelSide?: "left" | "right";
}

const INDIA: Place = { name: "India", x: 700, y: 210, hub: true, region: "india", labelSide: "left" };

const EXPANSION: Place[] = [
  { name: "Dubai", x: 645, y: 205, region: "dubai", labelSide: "left" },
  { name: "United Kingdom", x: 498, y: 112, region: "united-kingdom", labelSide: "left" },
  { name: "Canada", x: 208, y: 98, region: "canada", labelSide: "right" },
  { name: "Malaysia", x: 765, y: 272, region: "malaysia", labelSide: "right" },
  { name: "Singapore", x: 778, y: 296, region: "singapore", labelSide: "right" },
  { name: "Australia", x: 862, y: 360, region: "australia", labelSide: "right" },
];

const ALL = [INDIA, ...EXPANSION];
const pct = (v: number, total: number) => `${(v / total) * 100}%`;

function arc(a: Place, b: Place) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - 55;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export function GlobalNetwork() {
  return (
    <Section background="ink" spacing="lg">
      <SectionHeading
        eyebrow="Global network"
        title="Built to scale, region by region."
        intro="Musicphonetics is founded in India and built for structured music learning across cities, countries, and online classrooms."
        invert
      />

      <Reveal>
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-8">
          <div className="relative mx-auto aspect-[1000/480] w-full max-w-4xl">
            {/* Map silhouette */}
            <WorldMapShape className="absolute inset-0 h-full w-full" />

            {/* Connecting lines */}
            <svg viewBox="0 0 1000 480" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {EXPANSION.map((p) => (
                <path
                  key={p.name}
                  d={arc(INDIA, p)}
                  fill="none"
                  stroke="#C9A227"
                  strokeWidth={1.2}
                  strokeOpacity={0.35}
                  strokeDasharray="3 4"
                />
              ))}
            </svg>

            {/* Pins + labels */}
            {ALL.map((p) => (
              <div
                key={p.name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: pct(p.x, 1000), top: pct(p.y, 480) }}
              >
                {p.region ? (
                  <Link href={`/teachers/${p.region}`} className="group block" aria-label={`${p.name} region`}>
                    <Pin place={p} />
                  </Link>
                ) : (
                  <Pin place={p} />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-paper/65">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" /> Live — India &amp; online
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gold/40 ring-1 ring-gold/50" /> Planned expansion
            </span>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function Pin({ place }: { place: Place }) {
  return (
    <span className="relative flex items-center justify-center">
      {place.hub && (
        <span className="absolute inline-flex h-7 w-7 animate-ping rounded-full bg-gold/40" />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full transition-transform group-hover:scale-125",
          place.hub
            ? "h-3.5 w-3.5 bg-gold shadow-[0_0_12px_rgba(201,162,39,0.9)]"
            : "h-2.5 w-2.5 bg-gold/50 ring-2 ring-gold/40"
        )}
      />
      <span
        className={cn(
          "absolute whitespace-nowrap text-[11px] font-medium transition-colors sm:text-xs",
          place.hub ? "text-gold" : "text-paper/70 group-hover:text-paper",
          place.labelSide === "left" ? "right-5" : "left-5"
        )}
      >
        {place.name}
      </span>
    </span>
  );
}
