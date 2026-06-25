import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Reveal } from "@/components/ui/Reveal";

export function BrandPhilosophy() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-32">
      <AuroraBackground />
      <div className="container-mp relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow text-gold">An education-first music company</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
              This is bigger than lessons. It&apos;s the beginning of a{" "}
              <span className="mp-shimmer">music movement</span>.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/75">
              Teaching is the foundation — and everything grows from it. The
              long-term vision is an ecosystem where students, teachers, artists,
              creators, schools, and music businesses all connect through one
              trusted platform.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-paper/55">
              Education remains the heart of the company. Founded in India,
              designed for global growth.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
