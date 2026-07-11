import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { HOME_PACKAGES } from "@/lib/home-config";
import { cn } from "@/lib/utils";

// Detail-page slug + pay-plan key per package (they differ for the Director's Circle).
const MAP: Record<string, { slug: string; payKey?: string }> = {
  main: { slug: "main", payKey: "main" },
  foundation: { slug: "foundation", payKey: "foundation" },
  directors: { slug: "directors-circle" },
};

// Show fees openly, in a swipeable ladder. The flagship anchors the eye; every
// payable plan leads straight into Apply & pay.
const ORDER = ["main", "foundation", "directors"];

export function FunnelPackages() {
  const cards = ORDER.map((k) => HOME_PACKAGES.find((p) => p.key === k)!).filter(Boolean);
  return (
    <section id="programmes" className="scroll-mt-20 bg-onyx py-14 sm:py-24">
      <div className="container-mp">
        <SectionHeader
          eyebrow="Programmes & fees"
          title="Clear plans. Clear fees."
          sub="No hidden pricing - pick the plan that fits, apply and pay online, or ask us anything on WhatsApp first."
          invert
        />
      </div>

      <Reveal>
        <div
          role="region"
          aria-label="Programmes and fees"
          tabIndex={0}
          className="mt-8 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:px-8"
        >
          {cards.map((p) => <Card key={p.key} p={p} />)}
          <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
        </div>
      </Reveal>

      <div className="container-mp">
        <p className="mt-4 flex items-center gap-2 text-xs text-paper/60">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 7l5 5-5 5M5 7l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Swipe to compare plans
        </p>
      </div>
    </section>
  );
}

function Card({ p }: { p: (typeof HOME_PACKAGES)[number] }) {
  const m = MAP[p.key];
  const flagship = !!p.featured;
  return (
    <div className={cn(
      "relative flex w-[85vw] max-w-[340px] shrink-0 snap-center flex-col rounded-3xl border p-6 sm:w-[360px] sm:p-7",
      flagship
        ? "border-gold/60 bg-gradient-to-b from-gold/[0.12] to-white/[0.02] shadow-[0_0_60px_-16px_rgba(201,162,39,0.5)]"
        : "border-white/10 bg-onyx-1",
    )}>
      {p.badge && (
        <span className={cn("mb-3 w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
          flagship ? "bg-gold text-ink" : "border border-gold/40 text-gold")}>{p.badge}</span>
      )}

      <h3 className="font-display text-xl font-semibold leading-tight text-paper">{p.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-paper/65">{p.tagline}</p>

      {/* Fee */}
      <div className="mt-4 flex items-end gap-1">
        <span className="font-display text-3xl font-semibold text-paper">{p.price ?? "By request"}</span>
        {p.price && <span className="pb-1 text-sm text-paper/55">/ month</span>}
      </div>
      {p.cadence && <p className="mt-0.5 text-xs text-paper/50">{p.cadence}</p>}

      <ul className="mt-5 flex-1 space-y-2.5">
        {p.bullets.slice(0, 4).map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-paper/80">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("mt-0.5 shrink-0", flagship ? "text-gold" : "text-paper/45")}>
              <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="mt-6 space-y-2.5">
        {m.payKey && p.payAmount ? (
          <Link href={`/pay?plan=${m.payKey}&amt=${p.payAmount}`}
            className={cn("flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-all active:scale-[0.98]",
              flagship ? "bg-gold text-ink hover:bg-deep-gold" : "bg-gold text-ink hover:bg-deep-gold")}>
            Apply &amp; pay →
          </Link>
        ) : (
          <WhatsAppCTA label={p.ctaLabel} message={p.ctaMsg} size="md" fullWidth />
        )}
        <Link href={`/programmes/${m.slug}`}
          className="flex min-h-[44px] w-full items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-paper hover:border-white/40">
          See full details
        </Link>
      </div>
    </div>
  );
}
