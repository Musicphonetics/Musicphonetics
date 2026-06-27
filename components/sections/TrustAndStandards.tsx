import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { STANDARDS_COUNT } from "@/lib/standards-data";

const TRUST_BUILDERS = [
  { stat: "10+ yrs", label: "Teaching experience" },
  { stat: "Long-term", label: "Families who stay" },
  { stat: "Verified", label: "Teacher selection" },
  { stat: "Tracked", label: "Student progress" },
  { stat: "Performance", label: "Culture built-in" },
  { stat: `${STANDARDS_COUNT}`, label: "Institutional standards" },
];

export function TrustAndStandards() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Endorsements, trust & features"
        title="Trust isn't claimed. It's built into how we work."
        intro="Parents stay with Musicphonetics because the experience is consistent, accountable, and standards-backed."
      />

      {/* Trust builders */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {TRUST_BUILDERS.map((t, i) => (
          <Reveal key={t.label} delay={(i % 6) * 60}>
            <div className="rounded-2xl border border-hairline bg-white p-5 text-center shadow-card">
              <p className="font-display text-xl font-semibold text-ink">{t.stat}</p>
              <p className="mt-1 text-xs text-ink/55">{t.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Standards as a trust layer */}
      <Reveal>
        <div className="mt-8 overflow-hidden rounded-3xl border border-hairline bg-ink text-paper">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                The Standards Library
              </p>
              <h3 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
                Built on {STANDARDS_COUNT} institutional standards.
              </h3>
              <p className="mt-3 max-w-xl text-paper/70">
                Covering teaching, child safety, progress, quality, parent
                communication, teacher conduct, and student growth — written,
                reviewed, and improved. Proof, not promises.
              </p>
            </div>
            <div className="lg:text-right">
              <Button href="/standards" variant="light" size="lg">
                Explore Standards
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
