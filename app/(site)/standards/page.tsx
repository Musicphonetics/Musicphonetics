import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { STANDARDS, STANDARD_CATEGORIES, STANDARDS_COUNT } from "@/lib/standards-data";

export const metadata: Metadata = {
  title: "The Standards Library",
  description:
    "The Musicphonetics Standards Library — twenty-three institutional standards covering teaching, child safety, progress, quality, parent communication, teacher conduct, and student growth.",
};

export default function StandardsPage() {
  return (
    <>
      {/* Institutional hero */}
      <section className="relative overflow-hidden border-b border-white/5 bg-ink py-20 text-paper sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-deep-gold/12 blur-3xl" />
        <div className="container-mp relative">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The Musicphonetics Standards Library</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-6xl">
              The Standards Library
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/70">
              Every lesson. Every policy. Every process — written, reviewed, and
              improved. The standards behind a serious music education
              institution.
            </p>
            <p className="mt-8 font-display text-xl font-semibold text-gold">
              Twenty-three Standards. One institution.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Category sections */}
      <Section background="paper" spacing="lg">
        <div className="space-y-16">
          {STANDARD_CATEGORIES.map((cat) => {
            const docs = STANDARDS.filter((s) => s.category === cat).sort((a, b) => a.num - b.num);
            return (
              <div key={cat}>
                <Reveal>
                  <div className="flex items-baseline gap-3 border-b border-hairline pb-4">
                    <h2 className="font-display text-2xl font-semibold text-ink">{cat}</h2>
                    <span className="text-sm text-ink/40">{docs.length}</span>
                  </div>
                </Reveal>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {docs.map((d, i) => (
                    <Reveal key={d.slug} delay={(i % 3) * 70}>
                      <Link
                        href={`/standards/${d.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover"
                      >
                        <span className="font-display text-sm font-semibold text-deep-gold">
                          № {String(d.num).padStart(2, "0")}
                        </span>
                        <h3 className="mt-2 text-lg font-semibold text-ink group-hover:text-deep-gold">
                          {d.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">
                          {d.summary}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-deep-gold">
                          Read
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-14 text-sm text-ink/50">
          {STANDARDS_COUNT} standards, version-controlled and reviewed regularly.
          Full documents available on request.
        </p>
      </Section>

      <FinalCTA
        headline="Standards are our proof. Music classes are the point."
        text="Start your music journey with Musicphonetics."
      />
    </>
  );
}
