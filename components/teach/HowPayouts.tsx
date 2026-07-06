import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PAYOUTS } from "@/lib/teach-config";

export function HowPayouts() {
  return (
    <Section background="white" spacing="lg">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="How payouts work"
            title="70/30. Transparent. On time."
          />
          {/* The split, shown plainly */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-hairline">
            <div className="flex">
              <div className="flex-[0.7] bg-gold px-4 py-5 text-center text-ink">
                <p className="font-display text-3xl font-semibold">70%</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider">You</p>
              </div>
              <div className="flex-[0.3] bg-ink px-4 py-5 text-center text-paper">
                <p className="font-display text-3xl font-semibold">30%</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-paper/70">Us</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/65">
            Fees vary by student and arrangement — the split does not. No hidden cuts, ever.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PAYOUTS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 70}>
              <div className="flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-feature-green/10 text-feature-green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
