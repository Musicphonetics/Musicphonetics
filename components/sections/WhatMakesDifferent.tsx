import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TrustIcon } from "@/components/trust/TrustIcon";
import type { TrustIconKey } from "@/lib/trust";

const ITEMS: { title: string; body: string; icon: TrustIconKey }[] = [
  { title: "Structured curriculum", body: "A defined, staged path - not scattered songs.", icon: "standards" },
  { title: "Teacher verification", body: "A seven-stage quality process before any class.", icon: "verify" },
  { title: "Personal progress tracking", body: "Every student's growth is mapped and visible.", icon: "assessment" },
  { title: "Parent communication", body: "Clear, consistent updates after classes.", icon: "support" },
  { title: "Monthly reporting", body: "Structured reports, not vague reassurances.", icon: "reports" },
  { title: "Performance opportunities", body: "Concerts, stages, and recitals built in.", icon: "performance" },
  { title: "Community ecosystem", body: "Not one teacher - a connected community.", icon: "network" },
  { title: "Long-term learning", body: "Built for years of growth, not a few classes.", icon: "timeline" },
];

export function WhatMakesDifferent() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="What makes us different"
        title="Not just classes. A complete music journey."
        intro="Eight standards that separate a structured music company from a private tutor."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={(i % 4) * 70}>
            <div className="group flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-deep-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                <TrustIcon icon={item.icon} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
