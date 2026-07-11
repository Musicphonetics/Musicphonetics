import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { FOUNDER } from "@/lib/founder";

const CHIPS = ["10+ years teaching", "1,100+ students taught", "Guitarist & vocalist", "Invited judge, Delhi NCR"];

// Founder-led is the core asset - a clean portrait and a real story.
export function FounderSection() {
  return (
    <section className="bg-white py-14 text-ink sm:py-20">
      <div className="container-mp">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          {/* Clean founder portrait + a small inset */}
          <Reveal>
            <div className="relative mx-auto max-w-sm lg:mx-0">
              <figure className="overflow-hidden rounded-3xl border border-hairline shadow-card">
                <img src={FOUNDER.photo} alt={FOUNDER.photoAlt} width={1024} height={1536} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover object-top" />
              </figure>
              <figure className="absolute -bottom-5 -right-4 hidden w-32 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:block">
                <img src="/images/moments/06-speech.webp" alt="Abhishek Kumar speaking at an event" loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
              </figure>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-10 bg-gold" />
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">The founder</span>
              </div>
              <blockquote className="mt-5 font-display text-[clamp(1.5rem,3.4vw,2.1rem)] font-medium leading-[1.18] text-ink">
                &ldquo;I started with one guitar and one student. Today it&apos;s a proper school - but every family still gets my personal sign-off.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-6 space-y-3.5 text-[0.95rem] leading-relaxed text-ink/70 sm:text-base">
                <p>Ten years ago I was teaching a single student in Delhi. What bothered me was how random music classes were - a few songs, no structure, no direction, and no stage.</p>
                <p>So I built Musicphonetics to fix exactly that: a teacher matched to each student, a real method that goes step by step, and open mics where practice finally turns into confidence. Over 1,100 students later, that promise hasn&apos;t changed.</p>
                <p className="font-medium text-ink">If your child joins us, you&apos;re not one of a hundred. You&apos;re mine to look after.</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {CHIPS.map((c) => (
                  <span key={c} className="rounded-full border border-hairline bg-paper px-3 py-1.5 text-[0.78rem] font-medium text-ink/75">{c}</span>
                ))}
              </div>
              <p className="mt-6 font-display text-base font-semibold text-[#7A5E0F]">{FOUNDER.name}, Founder &amp; Director</p>
              <Link href="/founder" className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7A5E0F] underline-offset-4 hover:underline">
                Read the full story
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
