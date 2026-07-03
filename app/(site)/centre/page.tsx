import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LIFE_AT_MP } from "@/lib/media";
import { whatsappLink, phoneLink, PHONE_DISPLAY } from "@/lib/data";

export const metadata: Metadata = {
  title: "South Delhi Centre",
  description:
    "Our flagship Musicphonetics centre in South Delhi — faculty-led in-person classes, ensembles, a performance stage, and exam preparation. Book a free trial.",
};

const CENTRE_TEXT =
  "Hi Musicphonetics, I'd like to visit / book a trial at the South Delhi centre.";

const OFFER = [
  {
    title: "In-person, faculty-led rooms",
    body: "Dedicated teaching rooms for private and small-group classes, taught by the same seven-stage-selected faculty that teaches at home and online.",
  },
  {
    title: "Ensembles & bands",
    body: "Spaces to play together — the part of music that practice rooms can't give. Students rehearse, perform, and grow as musicians, not just learners.",
  },
  {
    title: "A real performance stage",
    body: "Regular showcases and open mics, so progress is felt in front of an audience — the moment that keeps students coming back.",
  },
  {
    title: "Exam & pathway preparation",
    body: "Structured preparation for Trinity, ABRSM, and Rockschool grades, with the focus and facilities a graded pathway deserves.",
  },
];

export default function CentrePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <AuroraBackground />
        <div className="container-mp relative py-20 sm:py-28">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow text-gold">South Delhi Centre · Open now</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                A home for Musicphonetics in South Delhi.
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
                Our flagship centre is open — in-person classes, ensembles, and a
                performance stage, carrying the same method and faculty standard
                families trust at home and online. You can also keep learning at
                home or online; the centre simply adds another way to grow.
              </p>
            </Reveal>
            <Reveal delay={230}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/start" variant="light" size="lg">
                  Book a free trial
                </Button>
                <Button
                  href={phoneLink}
                  variant="secondary"
                  size="lg"
                  className="border-white/25 text-paper hover:border-white"
                >
                  Call {PHONE_DISPLAY}
                </Button>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-6 text-sm text-paper/60">
                Free trial, no commitment — we reply immediately.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What the centre will offer */}
      <Section background="paper" spacing="lg">
        <SectionHeading
          eyebrow="What the centre adds"
          title="Everything you get now — plus a room to play it loud."
          intro="The centre extends Musicphonetics; it doesn't replace it. Home and online classes continue exactly as they are."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {OFFER.map((o, i) => (
            <Reveal key={o.title} delay={(i % 2) * 80}>
              <div className="h-full rounded-2xl border border-hairline bg-white p-7 shadow-card">
                <h3 className="text-lg font-semibold text-ink">{o.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{o.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* What stays the same */}
      <Section background="white" spacing="md">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <p className="eyebrow">The standard travels with us</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                Same faculty. Same method. A bigger stage.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/70">
                Every teacher at the centre passes the same seven-stage
                selection. Every student follows the same structured pathway.
                The centre simply gives that work a permanent home — and an
                audience.
              </p>
              <div className="mt-7">
                <Button href={whatsappLink(CENTRE_TEXT)} external variant="primary" size="lg">
                  Book a free trial
                </Button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-4">
              {LIFE_AT_MP.slice(0, 2).map((img) => (
                <Photo
                  key={img.src}
                  image={img}
                  aspect="portrait"
                  sizes="(max-width: 1024px) 45vw, 28vw"
                  rounded="rounded-2xl"
                  className="shadow-card"
                />
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      <FinalCTA
        headline="Visit our South Delhi centre."
        text="Book a free trial at the centre, at home, or online — we'll match a teacher and confirm your plan."
      />
    </>
  );
}
