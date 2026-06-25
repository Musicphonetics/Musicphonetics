import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { BRAND } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* Soft gold wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-gold/10 blur-3xl"
      />
      <div className="container-mp grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">
              {BRAND.region} · Structured music education
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Music, taught the way it deserves to be — one student at a time.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
              Personal music education guided by a director-led method,
              delivered through carefully selected teachers for students,
              parents, and growing musicians.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/#pathways" size="lg" variant="primary">
                Discover your pathway
              </Button>
              <Button href="/method" size="lg" variant="secondary">
                Explore the Method
              </Button>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-8 text-sm text-ink/55">
              {BRAND.yearsExperience} years · {BRAND.studentsTaught} students
              taught · Home, online, and future academy pathways
            </p>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="relative">
            <ImagePlaceholder
              label="Real lesson moment"
              aspect="portrait"
              className="shadow-card-hover"
            />
            {/* Floating accent card */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-hairline bg-white px-5 py-4 shadow-card sm:block">
              <p className="font-display text-2xl font-semibold text-ink">
                Director-led
              </p>
              <p className="text-xs text-ink/55">Method, not scattered songs</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
