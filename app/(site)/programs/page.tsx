import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { whatsappLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Learning paths for every stage: one-to-one home and online lessons, Trinity preparation, the Director's Circle, and future group, academy, and workshop programs.",
};

interface ProgramDetail {
  title: string;
  status: string;
  statusTone: "gold" | "green" | "muted";
  body: string;
  points: string[];
}

const PROGRAM_DETAILS: ProgramDetail[] = [
  {
    title: "One-to-One Lessons",
    status: "Current primary route",
    statusTone: "gold",
    body: "Personal home classes across Delhi NCR, built entirely around one student. The teacher, pace, and repertoire are matched to the learner.",
    points: ["Home classes across Delhi NCR", "Fully personalised pacing", "Matched teacher"],
  },
  {
    title: "Online Lessons",
    status: "Available now",
    statusTone: "gold",
    body: "The same structured method, delivered live online for students who prefer to learn from anywhere.",
    points: ["Live one-to-one", "Learn from anywhere", "Same method & standard"],
  },
  {
    title: "Trinity Preparation",
    status: "Exam pathway",
    statusTone: "green",
    body: "Structured support for graded exams, integrated into the wider method so exam readiness never feels like cramming.",
    points: ["Graded milestones", "Mock assessments", "Confidence for the exam room"],
  },
  {
    title: "The Director's Circle",
    status: "Premium",
    statusTone: "green",
    body: "Learn directly from Director Abhishek by prior booking — for serious learners who want the highest standard from day one.",
    points: ["Director-led classes", "By prior booking", "Highest standard"],
  },
  {
    title: "Group Classes & Academy Batches",
    status: "Coming as demand grows",
    statusTone: "muted",
    body: "Group and academy programs open based on demand, batch size, location, and teacher availability. Tell us during enquiry to join the interest list.",
    points: ["Future batches", "Location-based", "Join the waitlist"],
  },
  {
    title: "Workshops & Camps",
    status: "Seasonal",
    statusTone: "muted",
    body: "Focused seasonal programs — summer batches, performance preparation, and short intensives announced through the year.",
    points: ["Summer batches", "Performance prep", "Short intensives"],
  },
];

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Learning paths for every stage."
        intro="One-to-one personal learning is our current primary route. The brand is built to grow into group, academy, and seasonal programs as demand grows."
      />

      <Section background="white" spacing="lg">
        <div className="grid gap-5 sm:grid-cols-2">
          {PROGRAM_DETAILS.map((program, i) => (
            <Reveal key={program.title} delay={(i % 2) * 90}>
              <Card hover className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold text-ink">
                    {program.title}
                  </h2>
                  <Badge tone={program.statusTone}>{program.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {program.body}
                </p>
                <ul className="mt-5 space-y-2">
                  {program.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-ink/75">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-1">
                  <Button
                    href={whatsappLink(
                      `Hi Musicphonetics, I'd like to know more about ${program.title}.`
                    )}
                    external
                    variant="secondary"
                  >
                    Enquire on WhatsApp
                  </Button>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 rounded-2xl border border-hairline bg-mist p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-ink/70">
              <span className="font-semibold text-ink">Future-ready: </span>
              Group and academy programs open based on demand, batch size,
              location, and teacher availability. Our current primary route is
              one-to-one personal learning — but the brand is built to expand.
            </p>
          </div>
        </Reveal>
      </Section>

      <FinalCTA
        headline="Not sure which path fits?"
        text="Tell us who the classes are for and your goal. We'll recommend the right one."
      />
    </>
  );
}
