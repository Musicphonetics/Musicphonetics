import Image from "next/image";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { FOUNDER } from "@/lib/founder";
import { RECOGNITION } from "@/lib/media";

// Two recognition photos, captioned - chief-judge + shared stage (Shaan).
const RECOG = [
  RECOGNITION.find((r) => r.src.includes("04-award")),
  RECOGNITION.find((r) => r.src.includes("01-celeb")),
].filter(Boolean) as typeof RECOGNITION;

export function FounderFeature() {
  return (
    <section id="founder" className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <AuroraBackground />
      <div className="container-mp relative">
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Founder portrait */}
          <Reveal>
            <div className="relative mx-auto max-w-sm">
              <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] border border-gold/30" />
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/12 shadow-card-hover">
                <Image
                  src={FOUNDER.photo}
                  alt={FOUNDER.photoAlt}
                  width={1024}
                  height={1536}
                  className="h-full w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="font-display text-xl font-semibold text-paper">{FOUNDER.name}</p>
                  <p className="text-sm text-gold">Founder &amp; Director</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* The spine - verbatim */}
          <div>
            <Reveal>
              <p className="eyebrow text-gold">The founder</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Ten years. 1,100 students. One conviction.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-paper/80 sm:text-lg">
                <p>
                  After teaching more than 1,100 students one-to-one - and a year
                  shaping music for a school of a thousand - Abhishek Kumar saw what
                  most miss: talent was never the problem. The system was. So he
                  built one.
                </p>
                <p>
                  Today, Musicphonetics is that system - structured, personal, and
                  held to written standards. 200+ of his students have completed
                  graded music exams, recognised with Trinity College London. He has
                  been invited as chief judge at major events, shared the stage with
                  artists including Shaan, and is trusted by families most teachers
                  never reach - from Delhi&apos;s defence officers to its most
                  discerning homes.
                </p>
                <p>
                  One guitar. One student. One standard - carried into every lesson,
                  at home, online, and at our South Delhi centre.
                </p>
              </div>
              <p className="mt-5 font-display text-base text-gold">- Abhishek Kumar, Founder &amp; Director</p>
            </Reveal>

            {/* Compact recognition row */}
            <Reveal delay={180}>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
                {RECOG.map((img) => (
                  <figure key={img.src} className="overflow-hidden rounded-2xl border border-white/10">
                    <Photo image={img} aspect="landscape" sizes="(max-width:640px) 50vw, 220px" rounded="rounded-none" />
                    <figcaption className="bg-white/[0.04] px-3 py-2 text-[11px] leading-tight text-paper/70">
                      {img.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-8">
                <Button href="/founder" variant="light" size="lg">Read the full story</Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
