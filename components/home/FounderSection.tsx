import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { FOUNDER } from "@/lib/founder";

// Founder-led is a core asset - give it a real section: photo, name and voice.
export function FounderSection() {
  return (
    <section className="bg-paper py-20 text-ink sm:py-28">
      <div className="container-mp">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          {/* Photo */}
          <Reveal>
            <figure className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-hairline shadow-card lg:mx-0">
              <Image src={FOUNDER.photo} alt={FOUNDER.photoAlt} width={640} height={780}
                className="h-full w-full object-cover object-top" />
            </figure>
          </Reveal>

          {/* Voice */}
          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-10 bg-gold" />
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">The founder</span>
              </div>
              <blockquote className="mt-5 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-medium leading-[1.2] text-ink">
                &ldquo;No teacher reaches a student without my personal sign-off. That&apos;s not a
                promise on a page - it&apos;s how every family here is handled.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
                I built Musicphonetics because music classes so often go random - songs, but
                no structure, no direction, no stage. We fixed that: a matched teacher, a real
                method, and a place to perform. If your child joins us, you&apos;re not one of a
                hundred. You&apos;re mine to look after.
              </p>
              <p className="mt-6 font-display text-base font-semibold text-[#7A5E0F]">- Abhishek Kumar, Founder &amp; Director</p>
              <Link href="/founder" className="mt-2 inline-block text-sm font-semibold text-[#7A5E0F] underline-offset-4 hover:underline">
                Read the founder&apos;s note →
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
