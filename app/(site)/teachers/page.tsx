import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FacultySelection } from "@/components/sections/FacultySelection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { publishedFaculty, isFacultyPublic } from "@/lib/faculty";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export const metadata: Metadata = {
  title: "Faculty",
  description:
    "How Musicphonetics selects faculty - a seven-stage process every teacher passes before they teach a single student. Verified teacher profiles are being published.",
};

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="Every teacher is chosen, not listed."
        intro="We don't run a marketplace of strangers. Each teacher passes a seven-stage selection before they reach a student."
      />

      {/* The seven-stage selection - the real, finished content */}
      <FacultySelection eyebrow="Selection" />

      {/* Public faculty grid appears once enough teachers are ready; until then,
          a finished note (individual profiles stay reachable by direct link). */}
      {isFacultyPublic() ? (
        <Section background="white" spacing="lg">
          <Reveal>
            <p className="eyebrow">Our faculty</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Meet the teachers.</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publishedFaculty().map((m) => (
              <Link key={m.slug} href={`/teachers/${m.slug}`} className="group flex items-center gap-4 rounded-2xl border border-hairline bg-white p-5 transition hover:border-gold hover:shadow-card">
                <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#C9A227,#A8851B)] font-display text-xl font-semibold text-white">{initials(m.name)}</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-semibold text-ink">{m.name}</span>
                  <span className="block text-sm text-ink/60">{m.instruments.join(", ")}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#7A5E0F]">View profile
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Section>
      ) : (
        <Section background="white" spacing="md">
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-2xl border border-hairline bg-paper p-8 text-center">
              <p className="text-ink/70">
                Individual faculty profiles - with names, instruments, and verified
                credentials - are being published. Until then, every teacher you
                meet has already passed the process above.
              </p>
            </div>
          </Reveal>
        </Section>
      )}

      <FinalCTA
        headline="Start your music journey with Musicphonetics."
        text="Tell us what you're looking for and we'll match you with the right teacher."
      />
    </>
  );
}
