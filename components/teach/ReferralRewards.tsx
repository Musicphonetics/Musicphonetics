import { Section, SectionHeading } from "@/components/ui/Section";
import { MotionReveal } from "./MotionReveal";

const REWARDS = [
  {
    title: "Refer a teacher who stays",
    body: "Know a teacher who'd fit our standard? If they join and stay, you earn a one-time referral bonus.",
  },
  {
    title: "Refer a student who enrols",
    body: "Send a family our way. When they enrol, you earn a one-time bonus.",
  },
];

export function ReferralRewards() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Referral rewards"
        title="Grow the faculty — earn for it."
        intro="Simple and single-level: one-time bonuses for referrals that work out. No downlines, no recruiting off recruits."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {REWARDS.map((r, i) => (
          <MotionReveal key={r.title} delay={i * 100}>
            <div className="flex h-full items-start gap-4 rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-[#7A5E0F]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M5 8l7-5 7 5M5 8a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{r.body}</p>
                <span className="mt-3 inline-block rounded-full bg-feature-green/10 px-2.5 py-0.5 text-xs font-semibold text-feature-green">One-time bonus · single level</span>
              </div>
            </div>
          </MotionReveal>
        ))}
      </div>
    </Section>
  );
}
