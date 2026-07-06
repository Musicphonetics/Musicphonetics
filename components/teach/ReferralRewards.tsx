import { Section, SectionHeading } from "@/components/ui/Section";
import { MotionReveal } from "./MotionReveal";
import { formatINR } from "@/lib/utils";
import { REFERRAL_BONUS } from "@/lib/teach-config";

export function ReferralRewards() {
  const bonusText = REFERRAL_BONUS ? formatINR(REFERRAL_BONUS) : "a one-time bonus";

  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Refer & earn"
        title="Know a great teacher? Bring them in."
        intro="Single-tier and simple: when a teacher you personally refer joins and completes 3 months, you earn a one-time bonus. No chains, no earning from recruits-of-recruits."
      />
      <MotionReveal>
        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-hairline bg-white p-8 text-center shadow-card sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-[#7A5E0F]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M5 8l7-5 7 5M5 8a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <p className="mt-5 font-display text-2xl font-semibold text-ink">
            Refer a teacher who stays 3 months — earn {bonusText}.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/65">
            One bonus for one teacher you personally bring in who sticks. That&apos;s the
            whole scheme — deliberately flat, deliberately honest.
          </p>
          <span className="mt-5 inline-block rounded-full bg-feature-green/10 px-3 py-1 text-xs font-semibold text-feature-green">
            Single-tier · one-time · no downlines
          </span>
        </div>
      </MotionReveal>
    </Section>
  );
}
