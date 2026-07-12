import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WA_MSG } from "@/lib/home-config";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

// Fees are the same size on every card; the flagship wins on border + elevation
// + ribbon, never on a louder number. Mobile order lands the eye on Main first.
export function FunnelPackages() {
  return (
    <section id="programmes" className="scroll-mt-16 bg-charcoal py-24 md:py-32">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes"
          title="Choose the path that fits the student."
          sub="Clear plans, clear fees — and a short conversation first, so we match the right teacher before anything begins."
          invert
        />

        <div className="mt-12 grid items-center gap-5 md:grid-cols-3">
          {/* FLAGSHIP — Main */}
          <Reveal className="order-1 md:order-2">
            <div className="relative z-10 flex h-full flex-col rounded-2xl border border-gold bg-charcoal-2 p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] md:-my-2 md:scale-[1.05]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-charcoal px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ivory ring-1 ring-gold/40">Most chosen</span>
              <h3 className="font-display text-2xl font-medium text-ivory">The Main Pathway</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/65">The full Musicphonetics system — for real, lasting progress.</p>
              <Fee amount="₹12,000" note="8 one-hour classes" />
              <Bullets items={[
                "A matched teacher and a structured curriculum",
                "Technique, theory, ear training, improvisation and stage confidence",
                "Trinity / graded-exam preparation when the student wants it",
                "Progress tracked, with founder oversight",
              ]} />
              <div className="mt-7 space-y-3">
                <a href={whatsappLink(WA_MSG.main)} target="_blank" rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-md bg-gold px-6 py-3 font-medium text-charcoal transition hover:brightness-105">
                  Start with a free trial
                </a>
                <Details slug="main" pay="main" />
              </div>
            </div>
          </Reveal>

          {/* Foundation */}
          <Reveal className="order-2 md:order-1">
            <QuietCard
              tag="The starting point" name="Foundation"
              line="A guided beginner pathway that builds a real foundation."
              amount="₹8,000" note="a 4-chapter beginner journey"
              items={[
                "Best for absolute beginners",
                "Four chapters, from first notes to ready for the Main Pathway",
                "Most students move up after a few months",
              ]}
              cta={<OutlineCTA href={whatsappLink(WA_MSG.trial)}>Book a free trial</OutlineCTA>}
              details={<Details slug="foundation" pay="foundation" />}
            />
          </Reveal>

          {/* Director's Circle */}
          <Reveal className="order-3">
            <QuietCard
              tag="By request only" name="Director's Circle"
              line="Direct, founder-level mentoring for a select few."
              amount="By request" note="limited availability"
              items={[
                "Personally guided by Abhishek",
                "Limited seats, about a one-week waiting list",
                "An exclusive pathway, by application",
              ]}
              cta={<OutlineCTA href={whatsappLink(WA_MSG.directors)}>Request access on WhatsApp</OutlineCTA>}
              details={<Details slug="directors-circle" />}
            />
          </Reveal>
        </div>

        <Reveal>
          <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-ivory/60">
            Not sure which fits? Message us the student&apos;s age, instrument and goal — we&apos;ll match
            the right teacher and the right plan first.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function QuietCard({ tag, name, line, amount, note, items, cta, details }: {
  tag: string; name: string; line: string; amount: string; note: string; items: string[]; cta: React.ReactNode; details: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/12 bg-charcoal-2/60 p-7">
      <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-gold">{tag}</span>
      <h3 className="mt-2 font-display text-2xl font-medium text-ivory">{name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ivory/65">{line}</p>
      <Fee amount={amount} note={note} />
      <Bullets items={items} />
      <div className="mt-7 space-y-3">{cta}{details}</div>
    </div>
  );
}

function Fee({ amount, note }: { amount: string; note: string }) {
  return (
    <div className="mt-5 border-t border-white/10 pt-5">
      <p className="font-display text-[1.7rem] leading-none text-ivory">
        {amount}{amount.startsWith("₹") && <span className="ml-1 text-sm font-normal text-muted">/ month</span>}
      </p>
      <p className="mt-1.5 text-xs text-muted">{note}</p>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex-1 space-y-2.5">
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2.5 text-sm text-ivory/75">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {b}
        </li>
      ))}
    </ul>
  );
}

function OutlineCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex w-full items-center justify-center rounded-md border border-ivory/25 px-6 py-3 font-medium text-ivory transition hover:border-gold hover:text-gold">
      {children}
    </a>
  );
}

function Details({ slug, pay }: { slug: string; pay?: string }) {
  return (
    <p className="text-center text-sm">
      <Link href={`/programmes/${slug}`} className="text-ivory/70 underline-offset-4 hover:text-gold hover:underline">See full details →</Link>
      {pay && <><span className="text-ivory/30"> · </span><Link href={`/pay?plan=${pay}`} className="text-xs text-muted hover:text-gold">apply &amp; pay online</Link></>}
    </p>
  );
}
