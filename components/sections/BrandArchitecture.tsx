import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { DIVISIONS, type DivisionIcon as DIcon } from "@/lib/programs";

function DivisionIcon({ icon }: { icon: DIcon }) {
  const c = {
    width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true,
    stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "learn": return (<svg {...c}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M7 9v5c0 1 2.2 2 5 2s5-1 5-2V9" /></svg>);
    case "teachers": return (<svg {...c}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M17 7a3 3 0 0 1 0 6" /></svg>);
    case "artists": return (<svg {...c}><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="10" r="1" /><path d="M8 15c1.5 1.5 6.5 1.5 8 0" /></svg>);
    case "studio": return (<svg {...c}><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
    case "live": return (<svg {...c}><path d="M12 3v18M8 7v10M16 7v10M4 10v4M20 10v4" /></svg>);
    case "research": return (<svg {...c}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
    case "foundation": return (<svg {...c}><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z" /><path d="M9 11l2 2 4-4" /></svg>);
    case "media": return (<svg {...c}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3z" /></svg>);
  }
}

export function BrandArchitecture() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="Built as an ecosystem"
        title="Eight divisions. One mission."
        intro="Education stays at the heart — and the company is built to grow into a connected ecosystem. Live divisions are marked; the rest are our long-term vision."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DIVISIONS.map((d, i) => (
          <Reveal key={d.name} delay={(i % 4) * 70}>
            <div
              className="group relative h-full overflow-hidden rounded-2xl border border-hairline bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
              style={{ ["--accent" as string]: d.accent }}
            >
              {/* Top accent bar grows on hover */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: d.accent }}
              />
              {/* Accent glow on hover */}
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                style={{ background: d.accent }}
              />
              <div
                className="relative grid h-12 w-12 place-items-center rounded-2xl text-white shadow-card transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(140deg, ${d.accent}, ${d.accent}cc)`,
                }}
              >
                <DivisionIcon icon={d.icon} />
              </div>
              <div className="relative mt-5 flex items-center gap-2">
                <h3 className="font-display text-base font-semibold text-ink">
                  {d.short}
                </h3>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    color: d.status === "live" ? "#1F3D2F" : d.accent,
                    background: d.status === "live" ? "rgba(31,61,47,0.12)" : `${d.accent}1f`,
                  }}
                >
                  {d.status === "live" ? "Live" : "Vision"}
                </span>
              </div>
              <p className="relative mt-0.5 text-xs font-medium text-ink/40">
                {d.name}
              </p>
              <p className="relative mt-2 text-sm leading-relaxed text-ink/65">
                {d.vision}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
