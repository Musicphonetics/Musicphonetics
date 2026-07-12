import Link from "next/link";
import { SectionHeader } from "./SectionHeader";

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold">
      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Arrow() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

const MAIN_FACTS = [
  "A teacher matched to the student, and a structured curriculum.",
  "Theory, ear training, improvisation and real stage work.",
  "Trinity and graded exam prep when the student is ready.",
];

const SECONDARY = [
  {
    slug: "foundation",
    tag: "The starting point",
    name: "Foundation",
    line: "A guided beginner pathway that builds a real foundation.",
    fee: "₹8,000",
    feeNote: "a four chapter beginner journey",
    facts: ["Best for absolute beginners.", "First notes to Main Pathway ready.", "Most students move up in a few months."],
  },
  {
    slug: "directors-circle",
    tag: "By request only",
    name: "Director's Circle",
    line: "Direct, founder level mentoring for a select few.",
    fee: "By request",
    feeNote: "limited availability",
    facts: ["Personally guided by Abhishek.", "Limited seats, about a week's wait.", "By application."],
  },
];

// Programmes, presented as a clear hierarchy: the recommended Main Pathway leads
// as a featured card, with the two other routes as supporting options.
export function FunnelPackages() {
  return (
    <section id="programmes" className="scroll-mt-16 bg-charcoal py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes"
          title="Three ways in, one clear system."
          sub="Most students follow the Main Pathway. Clear plans, clear fees, and the full details live on each plan's page."
          invert
        />

        {/* Featured: The Main Pathway */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-gold/45 bg-charcoal-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="order-2 p-8 sm:p-10 lg:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-charcoal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" /></svg>
              Most chosen
            </span>
            <h3 className="mt-4 font-display text-[1.75rem] font-medium leading-tight text-ivory sm:text-3xl">The Main Pathway</h3>
            <p className="mt-2 max-w-md text-[0.98rem] leading-relaxed text-ivory/70">
              The full Musicphonetics system, for real and lasting progress.
            </p>

            <div className="mt-6 flex items-baseline gap-2 border-t border-white/10 pt-6">
              <span className="font-display text-4xl font-medium text-ivory">₹12,000</span>
              <span className="text-sm text-ivory/60">/ month</span>
              <span className="ml-auto text-xs text-ivory/55">8 one hour classes each month</span>
            </div>

            <ul className="mt-6 space-y-2.5">
              {MAIN_FACTS.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed text-ivory/80"><Check />{f}</li>
              ))}
            </ul>

            <Link href="/programmes/main"
              className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gold px-7 text-sm font-semibold text-charcoal transition hover:brightness-105 sm:w-auto">
              See the Main Pathway
              <Arrow />
            </Link>
          </div>

          <div className="relative order-1 min-h-[240px] overflow-hidden lg:order-2 lg:min-h-full">
            <img src="/images/moments/02-openmic.webp" alt="A Musicphonetics student performing at an Open Mic evening" loading="lazy" decoding="async"
              className="h-full w-full object-cover object-[50%_35%]" />
            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(27,32,42,0.65),transparent_55%)] lg:bg-[linear-gradient(to_right,rgba(27,32,42,0.9),transparent_45%)]" />
          </div>
        </div>

        {/* Supporting routes */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {SECONDARY.map((p) => (
            <div key={p.slug} className="flex flex-col rounded-2xl border border-white/12 bg-charcoal-2/60 p-7 sm:p-8">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">{p.tag}</span>
              <h3 className="mt-2 font-display text-2xl font-medium text-ivory">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/65">{p.line}</p>

              <div className="mt-5 flex items-baseline gap-2 border-t border-white/10 pt-5">
                <span className="font-display text-2xl font-medium text-ivory">{p.fee}</span>
                {p.fee.startsWith("₹") && <span className="text-sm text-ivory/60">/ month</span>}
                <span className="ml-auto text-xs text-ivory/50">{p.feeNote}</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {p.facts.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ivory/75"><Check />{f}</li>
                ))}
              </ul>

              <Link href={`/programmes/${p.slug}`}
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-ivory underline-offset-4 transition-colors hover:text-gold hover:underline">
                See full details
                <Arrow />
              </Link>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-ivory/55">
          Every plan page explains what is included, how billing works, and the full terms before you pay.
        </p>
      </div>
    </section>
  );
}
