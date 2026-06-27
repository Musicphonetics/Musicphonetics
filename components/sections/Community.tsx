import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TrustIcon } from "@/components/trust/TrustIcon";
import type { TrustIconKey } from "@/lib/trust";

const PILLARS: { title: string; body: string; icon: TrustIconKey }[] = [
  { title: "Parents", body: "Kept informed, involved, and confident at every step." },
  { title: "Students", body: "Surrounded by peers, performance, and encouragement." },
  { title: "Teachers", body: "Supported by systems, standards, and a shared method." },
  { title: "Technology", body: "Quietly connecting everyone behind the scenes." },
].map((p, i) => ({ ...p, icon: (["student", "performance", "teacher", "tech"] as TrustIconKey[])[i] }));

export function Community() {
  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="The community"
        title="You're not hiring a tutor. You're joining a community."
        intro="Music grows fastest when it's shared. Every Musicphonetics family is part of something larger than a weekly class."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p, i) => (
          <Reveal key={p.title} delay={(i % 4) * 70}>
            <div className="flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 shadow-card">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-feature-green/10 text-feature-green">
                <TrustIcon icon={p.icon} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
