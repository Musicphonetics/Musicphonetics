import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { FOUNDER } from "@/lib/founder";

const CHIPS = [
  "10+ years teaching",
  "1,100+ students taught",
  "Guitarist & vocalist",
  "Invited judge, Delhi NCR",
];

// Founder-led is the core asset - so give it a real cinematic moment and a
// story, not a stat line.
export function FounderSection() {
  return (
    <section className="bg-onyx py-14 text-paper sm:py-24">
      <div className="container-mp">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1fr] lg:gap-14">
          {/* Cinematic photo stack */}
          <Reveal>
            <div className="relative mx-auto max-w-sm lg:mx-0">
              <figure className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
                <img src="/images/founder/low-angle.webp" alt="Abhishek Kumar, founder of Musicphonetics, performing guitar" loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover object-top" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-onyx/70 via-transparent to-transparent" />
              </figure>
              {/* small inset photo */}
              <figure className="absolute -bottom-5 -right-4 hidden w-32 overflow-hidden rounded-2xl border-2 border-onyx shadow-xl sm:block">
                <img src="/images/founder/stage-fog.webp" alt="Abhishek Kumar performing on stage" loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
              </figure>
            </div>
          </Reveal>

          {/* Story */}
          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-10 bg-gold" />
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gold">The founder</span>
              </div>
              <blockquote className="mt-5 font-display text-[clamp(1.5rem,3.4vw,2.1rem)] font-medium leading-[1.18] text-paper">
                &ldquo;I started with one guitar and one student. Today it&apos;s a proper school - but every family still gets my personal sign-off.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-6 space-y-3.5 text-[0.95rem] leading-relaxed text-paper/70 sm:text-base">
                <p>
                  Ten years ago I was teaching a single student in Delhi. What bothered me was how random music classes were - a few songs, no structure, no direction, and definitely no stage.
                </p>
                <p>
                  So I built Musicphonetics to fix exactly that: a teacher matched to each student, a real method that goes step by step, and open mics where practice finally turns into confidence. Over 1,100 students later, that promise hasn&apos;t changed.
                </p>
                <p className="text-paper/85">
                  If your child joins us, you&apos;re not one of a hundred. You&apos;re mine to look after.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {CHIPS.map((c) => (
                  <span key={c} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[0.78rem] font-medium text-paper/80">{c}</span>
                ))}
              </div>
              <p className="mt-6 font-display text-base font-semibold text-gold">{FOUNDER.name}, Founder &amp; Director</p>
              <Link href="/founder" className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline-offset-4 hover:underline">
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
