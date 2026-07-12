import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const INSIDE = [
  { t: "Every class, written up", d: "What was taught, the homework and what's next, after each class." },
  { t: "Live progress tracking", d: "See exactly where your child is on their journey." },
  { t: "Monthly reports", d: "Attendance, performance and your teacher's honest feedback." },
  { t: "Pay & renew online", d: "Handle fees securely, right from the portal." },
];

// Show parents what they actually get once they log in - a real screenshot of
// the portal in a phone frame, next to what's inside.
export function NightPortalShowcase() {
  return (
    <section className="bg-charcoal py-24 md:py-32">
      <div className="container-mp">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Phone screenshot */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-[280px]">
              <span aria-hidden="true" className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-gold/15 blur-3xl" />
              <div className="relative rounded-[2.2rem] border-[6px] border-[#0b0e15] bg-[#0b0e15] p-1 shadow-[0_40px_90px_-30px_rgba(22,27,38,0.5)]">
                <img src="/images/portal-preview.webp" alt="The Musicphonetics parent portal, a child's learning journey, class updates and fees"
                  loading="lazy" decoding="async" className="w-full rounded-[1.8rem]" />
              </div>
            </div>
          </Reveal>

          {/* What's inside */}
          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-10 bg-gold" />
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gold">Your parent portal</span>
              </div>
              <h2 className="mt-4 font-display text-[clamp(1.7rem,4.5vw,2.4rem)] font-medium leading-tight text-ivory">
                Know exactly how your child is doing.
              </h2>
              <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ivory/65 sm:text-base">
                The moment your child joins, you get your own login, a calm, clear window into their music, updated by their teacher every single class.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <ul className="mt-6 space-y-3.5">
                {INSIDE.map((x) => (
                  <li key={x.t} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span>
                      <span className="block text-[0.95rem] font-semibold text-ivory">{x.t}</span>
                      <span className="block text-sm text-ivory/60">{x.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/parent/login"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-feature-green px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#16472f]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                Parent / Student login
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
