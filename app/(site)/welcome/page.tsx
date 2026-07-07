import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Stave } from "@/components/ui/Stave";
import { Photo } from "@/components/ui/Photo";
import { HERO_STUDENTS, LIFE_AT_MP } from "@/lib/media";
import { FOUNDER } from "@/lib/founder";

export const metadata: Metadata = {
  title: "Welcome to the family",
  description: "Your Musicphonetics journey begins now.",
  robots: { index: false, follow: false },
};

// Optional short welcome video (YouTube id). Empty → the photo panel carries
// the moment instead. Never an empty box, never "coming soon".
const WELCOME_VIDEO_ID = "";

const NEXT_STEPS = [
  { n: 1, t: "We message you immediately", d: "A WhatsApp from our team is already on its way." },
  { n: 2, t: "Your first class is scheduled", d: "A teacher matched personally to you, at a time that fits." },
  { n: 3, t: "Your personalised plan begins", d: "Structured, tracked, and built around the student." },
];

export default function WelcomePage() {
  return (
    <>
      {/* Hero - the welcome moment */}
      <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-25%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-deep-gold/15 blur-[130px]" />
        <div className="container-mp relative text-center">
          <Reveal>
            <div className="mx-auto flex justify-center"><Stave /></div>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Welcome to the family. Your music journey begins now.
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <div className="mx-auto mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-feature-green/30 px-4 py-2 text-sm font-semibold text-emerald-300">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Payment received.
              </span>
              <span className="text-sm text-paper/75">
                We&apos;ll message you on WhatsApp immediately to schedule your first class.
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* A personal message from the Director - a signed note */}
      <Section background="paper" spacing="lg">
        <Reveal>
          <figure className="mx-auto max-w-2xl rounded-3xl border border-hairline bg-white p-8 shadow-card sm:p-12">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-gold/40">
                <Image src={FOUNDER.photo} alt={FOUNDER.photoAlt} fill sizes="56px" className="object-cover object-top" />
              </div>
              <div>
                <p className="eyebrow">A personal message</p>
                <p className="font-display text-lg font-semibold text-ink">From the Director</p>
              </div>
            </div>
            <blockquote className="mt-7 space-y-4 font-display text-lg leading-relaxed text-ink/85">
              <p>
                For ten years, I&apos;ve taught one belief: talent was never the
                problem - the system was. Today, that system becomes yours.
              </p>
              <p>
                From this moment, you&apos;re not a customer. You&apos;re part of
                Musicphonetics - a family of 1,100+ students, defence families, and
                homes across Delhi who chose music taught properly. Your teacher is
                already being matched to you personally.
              </p>
              <p>
                Here&apos;s my promise: every lesson prepared, every week tracked,
                every small win noticed. We&apos;ll begin gently, build steadily,
                and one day you&apos;ll play something you never imagined you could.
              </p>
              <p>Welcome. I can&apos;t wait to hear you play.</p>
            </blockquote>
            <figcaption className="mt-6 border-t border-hairline pt-5">
              <p className="font-display text-base font-semibold text-[#7A5E0F]">- Abhishek Kumar</p>
              <p className="text-sm text-ink/60">Founder &amp; Director, Musicphonetics</p>
            </figcaption>
          </figure>
        </Reveal>

        {/* The vision - two lines */}
        <Reveal delay={120}>
          <p className="mx-auto mt-12 max-w-2xl text-center font-display text-xl leading-snug text-ink sm:text-2xl">
            We&apos;re building a standard of teaching Delhi has never had - and a
            community that performs, grows, and stays for years.
          </p>
        </Reveal>
      </Section>

      {/* A student moment */}
      <Section background="ink" spacing="lg">
        <Reveal>
          <p className="eyebrow text-center text-gold">You&apos;re in good company</p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {WELCOME_VIDEO_ID ? (
            <div className="relative col-span-full aspect-video overflow-hidden rounded-2xl">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${WELCOME_VIDEO_ID}?rel=0`}
                title="A welcome from Musicphonetics"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <Reveal className="sm:col-span-1">
              <Photo image={HERO_STUDENTS} aspect="portrait" sizes="(max-width:640px) 100vw, 30vw" rounded="rounded-2xl" className="h-full shadow-card" />
            </Reveal>
          )}
          {LIFE_AT_MP.slice(0, 2).map((img, i) => (
            <Reveal key={img.src} delay={(i + 1) * 90}>
              <Photo image={img} aspect="portrait" sizes="(max-width:640px) 100vw, 30vw" rounded="rounded-2xl" className="h-full shadow-card" />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* What happens next */}
      <Section background="white" spacing="lg">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-semibold text-ink">What happens next</h2>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-3">
          {NEXT_STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="h-full rounded-2xl border border-hairline bg-paper p-6 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-gold font-display text-sm font-semibold text-[#7A5E0F]">{s.n}</span>
                <h3 className="mt-4 text-base font-semibold text-ink">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-ink/60">
          Question about your payment or schedule?{" "}
          <Link href="/support" className="font-semibold text-[#7A5E0F] underline underline-offset-2">
            We&apos;re here - and we reply immediately
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
