import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { ROADMAP, ROADMAP_DISCLAIMER } from "@/lib/geo";
import { cn } from "@/lib/utils";

type Tone = "live" | "soon" | "future";

const MARKERS: { name: string; x: number; y: number; tone: Tone }[] = [
  { name: "Delhi NCR", x: 64, y: 40, tone: "live" },
  { name: "Mumbai", x: 60, y: 49, tone: "soon" },
  { name: "Pune", x: 60, y: 52, tone: "soon" },
  { name: "Hyderabad", x: 63, y: 51, tone: "soon" },
  { name: "Bengaluru", x: 63, y: 56, tone: "soon" },
  { name: "Chennai", x: 65, y: 56, tone: "soon" },
  { name: "Kolkata", x: 68, y: 45, tone: "soon" },
  { name: "Dubai", x: 56, y: 46, tone: "future" },
  { name: "Kuala Lumpur", x: 73, y: 57, tone: "future" },
  { name: "Singapore", x: 74, y: 60, tone: "future" },
  { name: "London", x: 46, y: 28, tone: "future" },
  { name: "Toronto", x: 20, y: 32, tone: "future" },
  { name: "Sydney", x: 85, y: 80, tone: "future" },
];

const groupTone: Record<Tone, "green" | "gold" | "sample"> = {
  live: "green",
  soon: "gold",
  future: "sample",
};

export function Roadmap() {
  return (
    <Section background="green" spacing="lg">
      <SectionHeading
        eyebrow="The roadmap"
        title="From India to the world."
        intro="Great teaching should not depend on geography."
        invert
      />

      {/* Map */}
      <Reveal>
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-6 sm:p-10">
          <div
            aria-hidden="true"
            className="relative aspect-[2/1] w-full rounded-2xl"
            style={{
              backgroundImage:
                "radial-gradient(rgba(246,244,239,0.16) 1.3px, transparent 1.3px)",
              backgroundSize: "20px 20px",
            }}
          >
            {MARKERS.map((m) => (
              <div
                key={m.name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                <span className="relative flex h-3 w-3">
                  {m.tone === "live" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex h-3 w-3 rounded-full ring-2 ring-feature-green",
                      m.tone === "live" && "bg-gold",
                      m.tone === "soon" && "bg-gold/90",
                      m.tone === "future" && "bg-paper/45"
                    )}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Status cards */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {ROADMAP.map((group, i) => (
          <Reveal key={group.key} delay={i * 100}>
            <div className="h-full rounded-2xl border border-white/12 bg-white/5 p-6">
              <Badge tone={groupTone[group.tone]}>{group.label}</Badge>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.cities.map((city) => (
                  <li
                    key={city}
                    className="rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-paper/85"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-sm text-paper/55">{ROADMAP_DISCLAIMER}</p>
    </Section>
  );
}
