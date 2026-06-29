import { Section, SectionHeading } from "@/components/ui/Section";
import { MotionReveal } from "./MotionReveal";

const ITEMS = [
  { title: "Students", body: "We bring matched, qualified students to you." },
  { title: "Parents", body: "We manage updates, expectations, and communication." },
  { title: "Payments", body: "Collected, reconciled, and paid to you on time." },
  { title: "Scheduling", body: "Slots, reminders, and rescheduling — handled." },
  { title: "Method", body: "A structured curriculum so you never improvise alone." },
  { title: "Standards", body: "Twenty-three documented standards behind every class." },
  { title: "Stage", body: "Concerts and performances we organise for your students." },
  { title: "Brand", body: "Teach under a name families already trust." },
];

export function WhatWeHandle() {
  return (
    <Section background="white" spacing="lg">
      <SectionHeading
        eyebrow="What we handle"
        title="You focus on the music. We run the rest."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => (
          <MotionReveal key={item.title} delay={(i % 4) * 80}>
            <div className="group h-full rounded-2xl border border-hairline bg-paper p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-card-hover">
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{item.body}</p>
            </div>
          </MotionReveal>
        ))}
      </div>
    </Section>
  );
}
