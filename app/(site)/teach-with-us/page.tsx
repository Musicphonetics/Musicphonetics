import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { TeachForm } from "@/components/sections/TeachForm";

export const metadata: Metadata = {
  title: "Teach with us",
  description:
    "You teach. We run everything else. Join Musicphonetics and let us handle leads, scheduling, payments, and parent communication.",
};

const WE_HANDLE = [
  { title: "Leads", body: "A steady flow of matched, qualified students." },
  { title: "Scheduling", body: "Slots, reminders, and rescheduling handled for you." },
  { title: "Payments", body: "Fees, invoices, and follow-ups taken care of." },
  { title: "Parent communication", body: "We manage updates and expectations." },
  { title: "Student matching", body: "You're matched to students who fit your strengths." },
  { title: "Brand trust", body: "Teach under a name parents already trust." },
];

const WE_EXPECT = [
  { title: "Standard", body: "A genuine commitment to the Musicphonetics method." },
  { title: "Reliability", body: "Show up on time, every time. Consistency builds trust." },
  { title: "Verification", body: "Complete our verification before teaching." },
  { title: "Communication", body: "Keep us and parents in the loop, clearly and kindly." },
  { title: "Respect for method", body: "Teach structure, not scattered songs." },
];

export default function TeachWithUsPage() {
  return (
    <>
      <PageHero
        eyebrow="Teach with us"
        title="You teach. We run everything else."
        intro="Focus on what you do best — teaching music well. Musicphonetics handles the business so you can grow as an educator."
      >
        <Button href="#apply" variant="primary" size="lg">
          Apply to teach
        </Button>
      </PageHero>

      {/* What we handle */}
      <Section background="white" spacing="lg">
        <SectionHeading
          eyebrow="What Musicphonetics handles"
          title="The whole operating layer — so you don't have to."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WE_HANDLE.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 80}>
              <Card hover className="h-full">
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {item.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* What we expect */}
      <Section background="paper" spacing="lg">
        <SectionHeading
          eyebrow="What we expect"
          title="A shared standard, held by everyone."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WE_EXPECT.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 80}>
              <div className="flex h-full gap-4 rounded-2xl border border-hairline bg-white p-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 font-display font-semibold text-deep-gold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/65">
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Apply */}
      <Section id="apply" background="white" spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading
            eyebrow="Apply to teach"
            title="Tell us about yourself."
            intro="Share a few details and we'll begin the verification conversation. Strong fundamentals and reliability matter more than anything."
          />
          <Reveal delay={120}>
            <TeachForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
