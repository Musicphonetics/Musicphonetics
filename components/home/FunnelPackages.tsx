import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { WA_MSG } from "@/lib/home-config";
import { cn } from "@/lib/utils";

// Fee-in-chat: the ladder is shown, the flagship anchors the eye, and the number
// is confirmed personally on WhatsApp once we understand the student.
const PROGRAMMES = [
  {
    slug: "main",
    name: "The Main Pathway",
    ribbon: "Most chosen",
    tagline: "The full Musicphonetics system, for real and lasting progress.",
    points: [
      "A matched teacher and a structured curriculum",
      "Technique, theory, ear training, improvisation and stage confidence",
      "Trinity / grade preparation where the student wants it",
      "Progress tracked, with founder oversight",
    ],
    flagship: true,
  },
  {
    slug: "foundation",
    name: "Foundation",
    tagline: "A guided beginner pathway to build a real foundation before the Main Pathway.",
    points: [
      "Best for absolute beginners",
      "Structured chapters, from first notes to ready-for-the-Main-Pathway",
      "Most students move up to the Main Pathway after a few months",
    ],
  },
  {
    slug: "directors-circle",
    name: "Director's Circle",
    tagline: "Direct, founder-level mentoring for a select few.",
    points: [
      "By request only, limited availability",
      "An exclusive, personally guided pathway",
    ],
    byRequest: true,
  },
];

export function FunnelPackages() {
  return (
    <section id="programmes" className="scroll-mt-20 bg-ink py-20 text-paper sm:py-28">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes"
          title="Choose the path that fits the student."
          sub="Every path starts with a short conversation, so we match the right teacher and confirm the fit before anything begins."
          invert
        />

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {PROGRAMMES.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80}>
              <Card p={p} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-xl text-center">
            <p className="text-sm leading-relaxed text-paper/65">
              Fees are shared personally on WhatsApp once we understand the student - so the
              fee fits the plan, not a price list.
            </p>
            <div className="mt-4 flex justify-center">
              <WhatsAppCTA label="Ask about fees on WhatsApp" message={WA_MSG.fees} variant="outline" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Card({ p }: { p: (typeof PROGRAMMES)[number] }) {
  const flagship = "flagship" in p && p.flagship;
  return (
    <div className={cn(
      "relative flex h-full flex-col rounded-3xl border p-7 transition-all sm:p-8",
      flagship
        ? "border-gold/60 bg-gradient-to-b from-gold/[0.10] to-white/[0.02] shadow-[0_0_60px_-14px_rgba(201,162,39,0.45)] lg:-translate-y-3"
        : "border-white/10 bg-white/[0.03]",
    )}>
      {"ribbon" in p && p.ribbon && (
        <span className="absolute -top-3 left-7 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">{p.ribbon}</span>
      )}
      {"byRequest" in p && p.byRequest && (
        <span className="mb-3 w-fit rounded-full border border-gold/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold">By request</span>
      )}

      <h3 className={cn("font-display font-semibold leading-tight text-paper", flagship ? "text-2xl" : "text-xl")}>{p.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-paper/70">{p.tagline}</p>

      <ul className="mt-6 flex-1 space-y-2.5">
        {p.points.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-paper/80">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("mt-0.5 shrink-0", flagship ? "text-gold" : "text-paper/45")}>
              <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>

      <Link href={`/programmes/${p.slug}`}
        className={cn(
          "mt-7 inline-flex min-h-[50px] w-full items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-all active:scale-[0.98]",
          flagship ? "bg-gold text-ink shadow-card hover:bg-deep-gold" : "border border-white/25 text-paper hover:border-white",
        )}>
        See details →
      </Link>
    </div>
  );
}
