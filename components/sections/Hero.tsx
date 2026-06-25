import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { RotatingWords } from "@/components/ui/RotatingWords";
import { ConstellationCanvas } from "@/components/ui/ConstellationCanvas";
import { BRAND } from "@/lib/data";

const NETWORK_LEGEND = [
  { label: "Students", color: "#C9A227" },
  { label: "Teachers", color: "#E7D08A" },
  { label: "Artists", color: "#7FB59B" },
  { label: "Schools", color: "#F6F4EF" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-gold/10 blur-3xl"
      />
      <div className="container-mp grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="eyebrow">
              {BRAND.region} · Founded in India, built for the world
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
              Building the future of{" "}
              <span className="text-deep-gold">music education.</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="relative mt-5 h-7 text-lg font-medium text-ink/80 sm:text-xl">
              <RotatingWords
                words={[
                  "One student at a time.",
                  "One structured method.",
                  "One trusted network.",
                  "One music movement.",
                ]}
                className="relative inline-block"
              />
            </p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
              Musicphonetics is an education-first music company. Structured,
              director-led learning today — growing into a global ecosystem of
              students, teachers, artists, and schools.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <Button href="/#pathways" size="lg" variant="primary">
                  Discover your pathway
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href="/#ecosystem" size="lg" variant="secondary">
                  Explore the ecosystem
                </Button>
              </Magnetic>
            </div>
          </Reveal>
          <Reveal delay={360}>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { v: `${BRAND.yearsExperience}`, l: "Years" },
                { v: BRAND.studentsTaught, l: "Students taught" },
                { v: "Director-led", l: "Method" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-2xl font-semibold text-ink">
                    {s.v}
                  </dt>
                  <dd className="text-xs uppercase tracking-wider text-ink/50">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Immersive network visual — a window into the ecosystem */}
        <Reveal delay={200}>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-ink shadow-card-hover sm:aspect-[4/5]">
            <ConstellationCanvas className="absolute inset-0 h-full w-full" />
            {/* Gradient veil for legibility */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent"
            />
            <div className="absolute left-5 top-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                The Musicphonetics network
              </p>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <p className="mb-3 text-sm text-paper/70">
                Every point — a student, teacher, artist, or school — connected
                through one trusted platform.
              </p>
              <div className="flex flex-wrap gap-3">
                {NETWORK_LEGEND.map((n) => (
                  <span
                    key={n.label}
                    className="flex items-center gap-1.5 text-xs text-paper/80"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: n.color }}
                    />
                    {n.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
