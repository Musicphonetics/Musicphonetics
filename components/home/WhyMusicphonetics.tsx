import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";

// Big icons, big easy text - the convincing "why us" at a glance, built for
// visitors arriving from a reel who scan in seconds.
const REASONS = [
  {
    t: "Real teachers, matched to you",
    d: "Not whoever is free. A teacher chosen for your child's age, instrument and goal.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.5 20v-1a4 4 0 0 0-3-3.87M16.5 4.13a3.5 3.5 0 0 1 0 6.74" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    t: "Progress you can actually see",
    d: "Class notes, homework and clear direction after every session. No guessing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19V5M4 19h16M8 16l3-4 3 2 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    t: "Stage time that builds confidence",
    d: "Open mics and student showcases every few months, so learning turns into performing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3ZM6 11a6 6 0 0 0 12 0M12 18v3M8 21h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    t: "A real centre in South Delhi + online",
    d: "Learn at our South Delhi centre, at home, or online anywhere across Delhi NCR.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
    ),
  },
];

export function WhyMusicphonetics() {
  return (
    <section className="bg-white py-20 text-ink sm:py-32">
      <div className="container-mp">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left - heading + big-icon reasons */}
          <div>
            <Reveal>
              <p className="eyebrow">Why Musicphonetics</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-[1.1] text-ink sm:text-4xl lg:text-[2.9rem]">
                Why families across Delhi choose us.
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink/70">
                Not random tuition. A warm, structured way to learn music, with real
                teachers and real stages.
              </p>
            </Reveal>

            <div className="mt-9 space-y-6">
              {REASONS.map((r, i) => (
                <Reveal key={r.t} delay={(i % 4) * 80}>
                  <div className="flex items-start gap-4 sm:gap-5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#C9A227]/12 text-[#7A5E0F] [&_svg]:h-7 [&_svg]:w-7">
                      {r.icon}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ink sm:text-[1.35rem]">{r.t}</h3>
                      <p className="mt-1 text-base leading-relaxed text-ink/70">{r.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-9">
                <WhatsAppCTA label="Talk to us on WhatsApp" message={WA_MSG.why} />
              </div>
            </Reveal>
          </div>

          {/* Right - a real session photo */}
          <Reveal delay={100}>
            <figure className="relative overflow-hidden rounded-3xl border border-hairline shadow-card lg:sticky lg:top-24">
              <img
                src="/images/moments/05-group.webp"
                alt="Musicphonetics students and teacher together in class"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm font-medium text-white drop-shadow">
                Real students, real classes, celebrated together.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
