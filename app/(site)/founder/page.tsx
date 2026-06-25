import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { FounderTimeline } from "@/components/sections/FounderTimeline";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { personJsonLd } from "@/lib/seo";
import { BRAND, whatsappLink } from "@/lib/data";
import {
  FOUNDER,
  FOUNDER_HIGHLIGHTS,
  FOUNDER_STORY,
} from "@/lib/founder";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Founder · Abhishek Kumar",
  description:
    "After teaching 1,100+ one-on-one students over a decade, Abhishek Kumar built Musicphonetics to fix what limits music education: inconsistent systems, not talented teachers.",
};

export default function FounderPage() {
  return (
    <>
      <JsonLd data={personJsonLd()} />

      {/* Cinematic hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <AuroraBackground />
        <div className="container-mp relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <p className="eyebrow text-gold">The founder</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                {FOUNDER.name}
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-3 text-lg text-gold">{FOUNDER.role}</p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
                Not someone selling music classes — someone who spent years
                understanding music education from the ground level, then built a
                better system from what he learned.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={whatsappLink()} external variant="light" size="lg">
                  Start your journey
                </Button>
                <Button href="/method" variant="secondary" size="lg" className="border-white/25 text-paper hover:border-white">
                  Explore the Method
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="relative mx-auto max-w-sm">
              <div
                aria-hidden="true"
                className="absolute -left-4 -top-4 h-full w-full rounded-3xl border border-gold/40"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/12 shadow-card-hover">
                <Image
                  src={FOUNDER.photo}
                  alt={FOUNDER.photoAlt}
                  width={1024}
                  height={1536}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Highlights strip */}
      <Section background="white" spacing="md">
        <Reveal>
          <p className="eyebrow text-center">By the numbers, and the record</p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FOUNDER_HIGHLIGHTS.map((h, i) => (
            <Reveal key={h} delay={(i % 3) * 70}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-hairline bg-paper p-5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold text-ink">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-ink/80">{h}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Cinematic story chapters */}
      <section className="bg-paper">
        {FOUNDER_STORY.map((chapter, i) => (
          <div
            key={chapter.key}
            className={cn(
              "border-b border-hairline",
              i % 2 === 1 ? "bg-mist" : "bg-paper"
            )}
          >
            <div className="container-mp py-16 sm:py-20">
              <Reveal>
                <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr] lg:gap-12">
                  <div>
                    <span className="font-display text-6xl font-semibold text-gold/25">
                      0{i + 1}
                    </span>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-deep-gold">
                      {chapter.label}
                    </p>
                    {chapter.key === "future" && (
                      <Badge tone="sample" className="mt-3">
                        Long-term vision
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                      {chapter.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink/70">
                      {chapter.body.map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        ))}
      </section>

      {/* Timeline */}
      <FounderTimeline />

      <FinalCTA
        headline={`Learn under the standard ${BRAND.founder} built.`}
        text="Tell us your instrument and goal. We'll guide you toward the right teacher and path."
      />
    </>
  );
}
