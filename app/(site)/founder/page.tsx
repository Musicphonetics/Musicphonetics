import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { FounderTimeline } from "@/components/sections/FounderTimeline";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Photo } from "@/components/ui/Photo";
import { FOUNDER_GALLERY } from "@/lib/media";
import { JsonLd } from "@/components/seo/JsonLd";
import { personJsonLd } from "@/lib/seo";
import { BRAND, whatsappLink } from "@/lib/data";
import {
  FOUNDER,
  FOUNDER_HIGHLIGHTS,
  FOUNDER_STORY,
  FOUNDER_SOCIALS,
} from "@/lib/founder";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Founder · Abhishek Kumar",
  description:
    "The story of Musicphonetics - a testimony that began in 2015 with one guitar, three chords, and one student. Faith first, music second, business third.",
  openGraph: {
    title: "The Founder · Abhishek Kumar - Musicphonetics",
    description:
      "Why Musicphonetics exists: a faculty-led standard built by founder Abhishek Kumar after teaching 1,100+ students across Delhi NCR.",
  },
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
              <p className="eyebrow text-gold">A testimony · not a résumé</p>
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
                The story of Musicphonetics is, first, a testimony. Faith first,
                music second, business third - a journey that began in 2015 with
                one guitar, three chords, and one student.
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

      {/* Recognition - real photography */}
      <Section background="paper" spacing="md">
        <Reveal>
          <p className="eyebrow text-center">Recognition</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            On stage, on panels, and among the people who shape the craft.
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {FOUNDER_GALLERY.map((img, i) => (
            <Reveal key={img.src} delay={(i % 3) * 80}>
              <figure className="group relative overflow-hidden rounded-2xl shadow-card">
                <Photo
                  image={img}
                  aspect="portrait"
                  sizes="(max-width: 640px) 100vw, 30vw"
                  rounded="rounded-2xl"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium leading-snug text-paper">
                  {img.caption}
                </figcaption>
              </figure>
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

      {/* Connect */}
      <Section background="white" spacing="md">
        <div className="rounded-3xl border border-hairline bg-paper p-8 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="eyebrow">Connect with the founder</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                {FOUNDER.name}
              </h2>
              <p className="mt-1 text-sm text-ink/60">{FOUNDER.role}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {FOUNDER_SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                >
                  {s.label}
                  <span className="ml-2 font-normal text-ink/45">{s.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <FinalCTA
        headline={`Learn under the standard ${BRAND.founder} built.`}
        text="Tell us your instrument and goal. We'll guide you toward the right teacher and path."
      />
    </>
  );
}
