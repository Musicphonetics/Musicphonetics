import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { TERMS_GLANCE } from "@/lib/teach-config";

export function NonNegotiable() {
  return (
    <Section background="ink" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* The one rule */}
        <Reveal>
          <p className="eyebrow text-gold">The one non-negotiable</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            One rule keeps this whole thing premium.
          </h2>
          <div className="mt-7 rounded-2xl border border-gold/30 bg-gold/[0.07] p-6">
            <p className="text-lg leading-relaxed text-paper/90">
              The <span className="font-semibold text-gold">daily class sheet</span> is mandatory.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              It&apos;s how we protect students, prove delivery, pay you correctly,
              and hold the standard that makes this brand worth joining. Miss it
              and payouts pause. Keep it, and everything else just works.
            </p>
          </div>
        </Reveal>

        {/* Terms at a glance */}
        <Reveal delay={120}>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/55">Terms at a glance</p>
            <ul className="mt-5 space-y-3">
              {TERMS_GLANCE.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm leading-relaxed text-paper/80">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button href="/teach-with-us/terms" variant="light" size="md">
                Read the full terms
              </Button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-paper/50">
              The 6-month non-solicitation covers our students, parents, materials
              and contacts — not your right to teach elsewhere. Full clauses are
              published and{" "}
              <Link href="/teach-with-us/terms" className="underline underline-offset-2 hover:text-paper/80">
                independently reviewable
              </Link>.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
