import { Reveal } from "@/components/ui/Reveal";

// ============================================================================
// InfrastructureLayers — scroll 3. Reframes the business as a four-layer stack
// and makes the existing portal read as the "platform layer" (evidence), not a
// prototype. Honest status on every layer: Live / Building / Direction.
// ============================================================================

type Layer = {
  name: string;
  line: string;
  items: string[];
  status: "Live" | "Building" | "Direction";
};

const LAYERS: Layer[] = [
  {
    name: "Network",
    line: "The same infrastructure, opened to other educators.",
    items: ["Schools", "Academies", "Independent teachers", "Institutions", "International"],
    status: "Direction",
  },
  {
    name: "Intelligence",
    line: "An AI layer around the lesson — assisting, never replacing, the teacher.",
    items: ["Competency scoring", "Adaptive plans", "Practice intelligence", "Performance analysis", "Teacher insights"],
    status: "Building",
  },
  {
    name: "Platform",
    line: "The software running the school today — the portal you can log into.",
    items: ["Teacher OS", "Parent OS", "Student records", "Attendance", "Billing & cycles", "Analytics"],
    status: "Live",
  },
  {
    name: "Education",
    line: "A real, premium, one-to-one music school. The ground truth.",
    items: ["Matched teachers", "Structured curriculum", "Real students", "Quarterly stages"],
    status: "Live",
  },
];

const STATUS: Record<Layer["status"], { cls: string; dot: string }> = {
  Live: { cls: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20", dot: "bg-emerald-500" },
  Building: { cls: "bg-gold/10 text-[#7A5E0F] border-gold/30", dot: "bg-gold" },
  Direction: { cls: "bg-ink/[0.04] text-ink/55 border-hairline", dot: "bg-ink/30" },
};

export function InfrastructureLayers() {
  return (
    <section id="platform" className="scroll-mt-28 relative overflow-hidden bg-paper py-20 sm:py-28">
      <div className="container-mp">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The architecture</p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.1rem)] font-medium leading-[1.08] text-ink">
              A music school on the outside. An education platform underneath.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[1rem] leading-relaxed text-ink/60">
              Four layers, built in order. Two are already running the school today. Two are the
              direction we&apos;re building toward — on top of the same foundation.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {LAYERS.map((l, i) => {
            const s = STATUS[l.status];
            const solid = l.status === "Live";
            return (
              <Reveal key={l.name} delay={i * 70}>
                <div
                  className={`rounded-2xl border p-5 sm:p-6 ${solid ? "border-hairline bg-white shadow-card" : "border-dashed border-ink/15 bg-white/50"}`}
                  style={{ marginLeft: `${i * 10}px`, marginRight: `${(LAYERS.length - 1 - i) * 10}px` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                      <h3 className="font-display text-xl font-semibold text-ink">{l.name}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide ${s.cls}`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[0.94rem] leading-relaxed text-ink/65">{l.line}</p>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {l.items.map((it) => (
                      <span key={it} className={`rounded-full px-3 py-1 text-[0.76rem] font-medium ${solid ? "bg-mist text-ink/75" : "border border-dashed border-ink/15 text-ink/45"}`}>
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-ink/55">
            The teacher and parent portals you can open today <span className="font-semibold text-ink">are</span> the
            platform layer — real, working software, not a mockup. Everything above it is being built on the same base.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
