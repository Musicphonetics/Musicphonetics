import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { VISION_REGIONS } from "@/lib/founder";
import { cn } from "@/lib/utils";

export function GlobalVision() {
  return (
    <Section background="green" spacing="lg">
      <SectionHeading
        eyebrow="Global vision"
        title="Founded in India. Designed for global growth."
        intro="The platform is built to scale - from Delhi NCR, to online learners anywhere, toward regional leadership and, in time, international growth."
        invert
      />

      <Reveal>
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-6 sm:p-10">
          {/* Stylised dotted world canvas */}
          <div
            aria-hidden="true"
            className="relative aspect-[2/1] w-full rounded-2xl"
            style={{
              backgroundImage:
                "radial-gradient(rgba(246,244,239,0.18) 1.4px, transparent 1.4px)",
              backgroundSize: "18px 18px",
            }}
          >
            {VISION_REGIONS.map((r) => (
              <div
                key={r.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
              >
                <span className="relative flex h-3.5 w-3.5">
                  {r.status === "current" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex h-3.5 w-3.5 rounded-full ring-2 ring-feature-green",
                      r.status === "current" ? "bg-gold" : "bg-paper/50"
                    )}
                  />
                </span>
              </div>
            ))}
          </div>

          {/* Region labels */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VISION_REGIONS.map((r) => (
              <div key={r.label} className="rounded-xl border border-white/12 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-paper">{r.label}</span>
                  <Badge tone={r.status === "current" ? "gold" : "sample"}>
                    {r.status === "current" ? "Today" : "Roadmap"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-paper/65">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <p className="mt-6 text-sm text-paper/55">
        Roadmap regions represent long-term vision - not current international
        operations.
      </p>
    </Section>
  );
}
